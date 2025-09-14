// pages/api/intelligent-search-decs.js
import axios from 'axios';

const DECS_API_KEY = '12def41f483860c7fa3a684723250ce3';
const DECS_BASE_URL = 'https://api.bvsalud.org/decs/v2';

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

async function searchDeCSTerms(searchTerm, language = 'pt') {
  console.log(`🔍 Buscando DeCS: "${searchTerm}" (${language})`);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const searchUrl = `${DECS_BASE_URL}/search`;
    
    const response = await axios.get(searchUrl, {
      params: {
        q: searchTerm,
        lang: language,
        count: 5
      },
      headers: {
        'apikey': DECS_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    const results = [];
    
    if (response.data && response.data.docs) {
      response.data.docs.forEach((doc, index) => {
        const terms = {
          pt: doc.descriptor_pt || doc.preferred_term_pt || '',
          es: doc.descriptor_es || doc.preferred_term_es || '',
          en: doc.descriptor_en || doc.preferred_term_en || '',
        };
        
        const definitions = {
          pt: doc.definition_pt || doc.scope_note_pt || '',
          es: doc.definition_es || doc.scope_note_es || '',
          en: doc.definition_en || doc.scope_note_en || '',
        };
        
        const relevanceScore = Math.round(95 - (index * 10));
        
        results.push({
          decsId: doc.id || doc.decs_code || `decs_${index}`,
          terms: terms,
          definitions: definitions,
          synonyms: {
            pt: doc.synonyms_pt || [],
            es: doc.synonyms_es || [],
            en: doc.synonyms_en || []
          },
          treeNumbers: doc.tree_numbers || [],
          relevanceScore: relevanceScore,
          searchedTerm: searchTerm
        });
      });
    }
    
    console.log(`✅ ${results.length} termos DeCS encontrados`);
    return results;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar DeCS:`, error.message);
    
    return [{
      decsId: `mock_${Date.now()}`,
      terms: {
        pt: searchTerm,
        es: searchTerm,
        en: searchTerm
      },
      definitions: {
        pt: 'Termo em processamento',
        es: 'Término en procesamiento',
        en: 'Term being processed'
      },
      synonyms: { pt: [], es: [], en: [] },
      treeNumbers: [],
      relevanceScore: 75,
      searchedTerm: searchTerm
    }];
  }
}

export default async function handler(req, res) {
  // Configurar timeout
  if (res.socket) {
    res.socket.setTimeout(59000);
  }
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    console.log('❌ Método não permitido:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Esta API aceita apenas requisições POST',
      receivedMethod: req.method
    });
  }

  try {
    console.log('\n🚀 API DeCS Inteligente - INÍCIO');
    
    const { searchTerms } = req.body;

    if (!searchTerms || !Array.isArray(searchTerms)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'searchTerms deve ser um array de strings'
      });
    }

    const processStartTime = Date.now();
    const allResults = [];
    const languages = ['pt', 'en'];
    
    console.log(`📋 Processando ${searchTerms.length} termos de busca`);
    
    for (const term of searchTerms) {
      if (term && typeof term === 'string' && term.trim()) {
        for (const lang of languages) {
          try {
            const results = await searchDeCSTerms(term.trim(), lang);
            allResults.push({
              searchTerm: term,
              language: lang,
              results: results
            });
          } catch (error) {
            console.error(`❌ Erro ao buscar "${term}" em ${lang}:`, error.message);
          }
        }
      }
    }
    
    const allDecsTerms = [];
    const seenIds = new Set();
    
    allResults.forEach(({ results }) => {
      results.forEach(decsTerm => {
        if (!seenIds.has(decsTerm.decsId)) {
          seenIds.add(decsTerm.decsId);
          allDecsTerms.push(decsTerm);
        }
      });
    });
    
    allDecsTerms.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const processTime = Date.now() - processStartTime;
    
    console.log(`✅ Processamento concluído em ${(processTime/1000).toFixed(2)}s`);
    console.log(`📊 Total de termos DeCS únicos: ${allDecsTerms.length}`);
    
    res.status(200).json({
      success: true,
      searchResults: allResults,
      allDecsTerms: allDecsTerms,
      totalTerms: allDecsTerms.length,
      processTime: processTime
    });
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Erro ao buscar termos DeCS',
      details: error.message
    });
  }
}