// pages/api/intelligent-search-mesh.js
import axios from 'axios';

const MESH_API_KEY = process.env.MESH_API_KEY;
const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60,
};

async function searchMeSHTerm(term) {
  console.log(`🔍 Buscando MeSH: "${term}"`);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi`;
    const searchParams = {
      db: 'mesh',
      term: term,
      retmode: 'json',
      retmax: 10,
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };
    
    const searchResponse = await axios.get(searchUrl, { 
      params: searchParams,
      timeout: 30000
    });
    
    const ids = searchResponse.data.esearchresult.idlist;
    if (!ids || ids.length === 0) {
      console.log(`⚠️ Nenhum resultado encontrado`);
      return [];
    }

    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi`;
    const summaryParams = {
      db: 'mesh',
      id: ids.join(','),
      retmode: 'json',
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };

    const summaryResponse = await axios.get(summaryUrl, { 
      params: summaryParams,
      timeout: 30000
    });
    
    const results = [];
    const uids = summaryResponse.data.result.uids || [];
    
    for (const uid of uids.slice(0, 5)) {
      const meshData = summaryResponse.data.result[uid];
      if (!meshData || meshData.error) continue;
      
      const meshTerms = meshData.ds_meshterms || [];
      const definition = meshData.ds_scopenote || '';
      const treeNumbers = meshData.ds_meshhierarchy || [];
      const synonyms = meshData.ds_meshsynonyms || [];
      
      const relevanceScore = Math.round(95 - (results.length * 10));
      
      results.push({
        meshId: uid,
        term: meshTerms[0] || term,
        allTerms: meshTerms,
        definition: definition,
        synonyms: synonyms,
        treeNumbers: Array.isArray(treeNumbers) ? treeNumbers : [],
        relevanceScore: relevanceScore,
        searchedTerm: term
      });
    }

    console.log(`✅ ${results.length} termos MeSH encontrados`);
    return results;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar MeSH:`, error.message);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (res.socket) {
    res.socket.setTimeout(59000);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log('\n🚀 API MeSH Inteligente - INÍCIO');
  
  const { searchTerms } = req.body;

  if (!searchTerms || !Array.isArray(searchTerms)) {
    return res.status(400).json({ error: 'searchTerms deve ser um array' });
  }

  try { 
    const processStartTime = Date.now();
    const allResults = [];
    
    console.log(`📋 Processando ${searchTerms.length} termos de busca`);
    
    for (const term of searchTerms) {
      try {
        const results = await searchMeSHTerm(term);
        allResults.push({
          searchTerm: term,
          results: results
        });
      } catch (error) {
        console.error(`❌ Erro ao buscar "${term}":`, error.message);
      }
    }
    
    const allMeshTerms = [];
    const seenIds = new Set();
    
    allResults.forEach(({ results }) => {
      results.forEach(meshTerm => {
        if (!seenIds.has(meshTerm.meshId)) {
          seenIds.add(meshTerm.meshId);
          allMeshTerms.push(meshTerm);
        }
      });
    });
    
    allMeshTerms.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const processTime = Date.now() - processStartTime;
    
    console.log(`✅ Processamento concluído em ${(processTime/1000).toFixed(2)}s`);
    console.log(`📊 Total de termos MeSH únicos: ${allMeshTerms.length}`);
    
    res.status(200).json({
      searchResults: allResults,
      allMeshTerms: allMeshTerms,
      totalTerms: allMeshTerms.length,
      processTime: processTime
    });
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar termos MeSH',
      details: error.message
    });
  }
}