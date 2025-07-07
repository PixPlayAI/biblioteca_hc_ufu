// pages/api/search-mesh.js
import axios from 'axios';

// Usar DEEPSEEK_API_KEY ao invés de OPENAI_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MESH_API_KEY = process.env.MESH_API_KEY;
const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// NOVO: Definir elementos válidos por framework
const FRAMEWORK_ELEMENTS = {
  PICO: ['P', 'I', 'C', 'O'],
  PICOT: ['P', 'I', 'C', 'O', 'T'],
  PICOS: ['P', 'I', 'C', 'O', 'S'],
  PEO: ['P', 'E', 'O'],
  PECO: ['P', 'E', 'C', 'O'],
  PCC: ['P', 'C', 'C2'],
  SPIDER: ['S', 'PI', 'D', 'E', 'R'],
  PIRD: ['P', 'I', 'R', 'D'],
  CoCoPop: ['Co', 'Co2', 'Pop'],
  SPICE: ['S', 'P', 'I', 'C', 'E'],
  ECLIPSE: ['E', 'C', 'L', 'I', 'P', 'SE'],
  BeHEMoTh: ['Be', 'HE', 'Mo', 'Th']
};

// NOVO: Função para filtrar apenas elementos válidos do framework
function filterValidFrameworkElements(frameworkElements, frameworkType) {
  const validElements = FRAMEWORK_ELEMENTS[frameworkType];
  if (!validElements) {
    console.warn(`Framework não reconhecido: ${frameworkType}`);
    return frameworkElements;
  }
  
  const filtered = {};
  Object.entries(frameworkElements).forEach(([key, value]) => {
    if (validElements.includes(key)) {
      filtered[key] = value;
    } else {
      console.warn(`Elemento "${key}" não é válido para o framework ${frameworkType}. Ignorando.`);
    }
  });
  
  return filtered;
}

// Função para extrair conceitos principais usando DeepSeek
async function extractConcepts(frameworkElements, fullQuestion, frameworkType) {
  console.log('🤖 extractConcepts - INÍCIO da extração de conceitos com DeepSeek');
  console.log('📋 Framework Type:', frameworkType);
  console.log('❓ Pergunta completa:', fullQuestion);
  console.log('📊 Elementos do framework recebidos:', frameworkElements);
  
  // LOG DETALHADO DE CADA ELEMENTO RECEBIDO
  console.log('\n🔍 DETALHAMENTO DOS ELEMENTOS RECEBIDOS:');
  console.log('=====================================');
  Object.entries(frameworkElements).forEach(([elemento, descricao]) => {
    console.log(`📌 ${elemento}: "${descricao}"`);
  });
  console.log('=====================================\n');
  
  const prompt = `
    Você vai extrair conceitos médicos simples dos elementos de pesquisa para busca posterior em bases de dados.
    
    IMPORTANTE: 
    - NÃO tente adivinhar termos MeSH
    - Extraia conceitos SIMPLES e DIRETOS em inglês
    - Use termos médicos comuns, não códigos ou nomenclaturas específicas
    - Para cada elemento, forneça múltiplas variações quando possível
    - PROCESSE TODOS OS ELEMENTOS FORNECIDOS
    
    Framework utilizado: ${frameworkType}
    
    Exemplos de extração correta:
    - "Pacientes adultos com diabetes tipo 2" → ["diabetes", "type 2 diabetes", "diabetes mellitus", "adult", "adults"]
    - "Metformina" → ["metformin"]
    - "Exercícios aeróbicos" → ["exercise", "aerobic exercise", "physical activity"]
    - "Controle glicêmico" → ["glycemic control", "blood glucose", "glucose control", "hba1c"]
    - "Enfermeiros de UTI" → ["nurses", "intensive care unit", "ICU", "critical care"]
    - "Burnout profissional" → ["burnout", "professional burnout", "occupational stress"]
    - "Qualidade de vida" → ["quality of life", "QoL", "life quality"]
    - "usuários do SUS" → ["SUS", "Brazil Health", "Health system"]
    - "implementação de agendamento online via aplicativo móvel" → ["Appointment Scheduling", "Medical Informatics Applications", "Online Systems", "Telemedicine", "Mobile Applications"]
    - "agendamento presencial tradicional" → ["Appointment Scheduling", "Outpatients", "Ambulatory Care Facilities", "Health Facilities"]

    Elementos do framework ${frameworkType} para análise:
    ${JSON.stringify(frameworkElements, null, 2)}
    
    Pergunta completa: ${fullQuestion}
    
    IMPORTANTE: Retorne um JSON com arrays de conceitos SIMPLES para CADA elemento do framework fornecido.
    As chaves devem ser EXATAMENTE as mesmas fornecidas no input.
    TODOS os elementos devem ter conceitos extraídos.
    
    Exemplo: {"P": ["diabetes", "adult"], "I": ["metformin", "exercise"], "C": ["placebo"], "O": ["glucose control"]}
  `;
  console.log('📤 Enviando prompt para DeepSeek:', prompt);

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração de conceitos médicos para busca em bases de dados. Você extrai termos simples e diretos, NÃO termos MeSH. SEMPRE processe TODOS os elementos fornecidos.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const concepts = JSON.parse(response.data.choices[0].message.content);
    
    console.log('\n✅ CONCEITOS EXTRAÍDOS PELA IA (DeepSeek):');
    console.log('================================');
    console.log(JSON.stringify(concepts, null, 2));
    console.log('================================\n');
    
    // VERIFICAR SE TODOS OS ELEMENTOS FORAM PROCESSADOS
    const elementosNaoProcessados = Object.keys(frameworkElements).filter(
      elem => !concepts[elem] || concepts[elem].length === 0
    );
    
    if (elementosNaoProcessados.length > 0) {
      console.error('❌ ERRO: Elementos não processados pela IA:', elementosNaoProcessados);
      
      // Adicionar arrays vazios para elementos não processados
      elementosNaoProcessados.forEach(elem => {
        concepts[elem] = [];
      });
    }
    
    // LOG SUPER DETALHADO - COMPARAÇÃO ENTRADA VS SAÍDA
    console.log('\n🔄 COMPARAÇÃO ENTRADA → SAÍDA (POR ELEMENTO):');
    console.log('==============================================');
    Object.entries(frameworkElements).forEach(([elemento, descricao]) => {
      const termos = concepts[elemento] || [];
      console.log(`\n📌 Elemento: ${elemento}`);
      console.log(`   📥 ENTRADA (Descrição original): "${descricao}"`);
      console.log(`   📤 SAÍDA (Conceitos extraídos): ${JSON.stringify(termos)}`);
      console.log(`   📊 Quantidade de conceitos: ${termos.length}`);
      
      if (termos.length > 0) {
        console.log('   📝 Detalhamento dos conceitos:');
        termos.forEach((termo, index) => {
          console.log(`      ${index + 1}. "${termo}"`);
        });
      } else {
        console.log('   ⚠️ NENHUM CONCEITO EXTRAÍDO!');
      }
    });
    console.log('==============================================\n');
    
    console.log('🤖 extractConcepts - FIM da extração');
    
    return concepts;
  } catch (error) {
    console.error('❌ Erro ao extrair conceitos com DeepSeek:', error);
    console.error('❌ Detalhes do erro:', error.response?.data);
    throw error;
  }
}

// Função para buscar termos MeSH SEM LIMITES
async function searchMeSHTerm(term) {
  console.log(`🔍 searchMeSHTerm - Buscando termo: "${term}" (SEM LIMITES)`);
  
  const debugInfo = {
    searchTerm: term,
    apiCalls: [],
    usingApiKey: !!MESH_API_KEY
  };

  try {
    // Busca o ID do termo SEM LIMITE
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi`;
    const searchParams = {
      db: 'mesh',
      term: term,
      retmode: 'json',
      retmax: 100, // Buscar até 100 resultados
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };
    
    debugInfo.apiCalls.push({
      type: 'search',
      url: searchUrl,
      params: searchParams,
      hasApiKey: !!MESH_API_KEY
    });

    console.log(`📡 Fazendo chamada para NCBI E-utilities: ${searchUrl}`);
    
    const searchResponse = await axios.get(searchUrl, { 
      params: searchParams,
      timeout: 20000
    });
    
    debugInfo.apiCalls[0].response = {
      count: searchResponse.data.esearchresult.count,
      ids: searchResponse.data.esearchresult.idlist
    };

    console.log(`📊 Resultados encontrados para "${term}": ${searchResponse.data.esearchresult.count}`);

    const ids = searchResponse.data.esearchresult.idlist;
    if (!ids || ids.length === 0) {
      console.log(`⚠️ Nenhum resultado encontrado para: "${term}"`);
      debugInfo.noResultsFound = true;
      return { results: [], debug: debugInfo };
    }

    // Busca detalhes de TODOS os termos encontrados
    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi`;
    const summaryParams = {
      db: 'mesh',
      id: ids.join(','),
      retmode: 'json',
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };

    debugInfo.apiCalls.push({
      type: 'summary',
      url: summaryUrl,
      params: summaryParams,
      hasApiKey: !!MESH_API_KEY
    });

    const summaryResponse = await axios.get(summaryUrl, { 
      params: summaryParams,
      timeout: 20000
    });
    
    const results = [];
    const uids = summaryResponse.data.result.uids || [];
    
    console.log(`📋 Processando ${uids.length} termos MeSH encontrados para "${term}"`);
    
    for (const uid of uids) {
      const meshData = summaryResponse.data.result[uid];
      if (!meshData || meshData.error) continue;
      
      // Extrair TODOS os dados
      const preferredTerm = meshData.ds_meshui || meshData.ds_meshterms?.[0] || '';
      const meshTerms = meshData.ds_meshterms || [];
      
      // Extrair TODOS os tree numbers
      let treeNumbers = [];
      
      if (meshData.ds_meshhierarchy && Array.isArray(meshData.ds_meshhierarchy)) {
        treeNumbers = meshData.ds_meshhierarchy.filter(h => typeof h === 'string');
      }
      
      if (treeNumbers.length === 0 && meshData.ds_idxlinks) {
        if (Array.isArray(meshData.ds_idxlinks)) {
          treeNumbers = meshData.ds_idxlinks.map(link => {
            if (typeof link === 'string') return link;
            
            if (typeof link === 'object' && link !== null) {
              if (link.parent) return link.parent;
              if (link.code) return link.code;
              if (link.treeNumber) return link.treeNumber;
              if (link.hierarchyCode) return link.hierarchyCode;
              if (link.descriptor) return link.descriptor;
              
              for (const [key, value] of Object.entries(link)) {
                if (typeof value === 'string' && /^[A-Z]\d+/.test(value)) {
                  return value;
                }
              }
              
              return null;
            }
            
            return null;
          }).filter(Boolean);
        }
      }
      
      // TODOS os sinônimos
      const synonyms = meshData.ds_meshsynonyms || [];
      
      // Definição COMPLETA
      const definition = meshData.ds_scopenote || '';
      
      // Calcular relevance score com base na posição
      const relevanceScore = Math.round(95 - (results.length * 0.5)); // Degradação mais suave
      
      const result = {
        meshId: uid,
        meshUI: preferredTerm,
        term: meshTerms[0] || term,
        allTerms: meshTerms,
        definition: definition,
        synonyms: synonyms,
        treeNumbers: treeNumbers,
        relevanceScore: relevanceScore
      };
      
      results.push(result);
      
      console.log(`      ✅ Termo MeSH encontrado: "${result.term}" (Score: ${result.relevanceScore}%)`);
    }

    debugInfo.apiCalls[1].response = {
      termCount: results.length,
      terms: results.map(r => ({
        term: r.term,
        treeNumbers: r.treeNumbers,
        meshId: r.meshId
      }))
    };

    console.log(`🔍 searchMeSHTerm - Busca concluída para "${term}": ${results.length} termos encontrados`);

    return { results, debug: debugInfo };
  } catch (error) {
    console.error(`❌ Erro ao buscar MeSH para "${term}":`, error);
    debugInfo.error = error.message;
    return { results: [], debug: debugInfo };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Configurar headers para otimizar resposta
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Debug dos dados recebidos
  console.log('\n🚀 API MeSH - INÍCIO DO PROCESSAMENTO');
  console.log('===================================================');
  console.log('📥 Dados recebidos do frontend:', {
    frameworkElements: req.body.frameworkElements,
    fullQuestion: req.body.fullQuestion,
    frameworkType: req.body.frameworkType
  });

  const { frameworkElements, fullQuestion, frameworkType } = req.body;

  // NOVO: Filtrar elementos válidos
  const validFrameworkElements = filterValidFrameworkElements(frameworkElements, frameworkType);
  console.log('✅ Elementos válidos para o framework:', validFrameworkElements);

  try { 
    // Debug completo do processo
    const fullDebug = {
      '🚀 INÍCIO': new Date().toISOString(),
      '📝 ENTRADA ORIGINAL': {
        frameworkElements,
        fullQuestion,
        frameworkType
      },
      '🔑 API KEY STATUS': MESH_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
      '🔄 PROCESSO': []
    };

    // PASSO 1: Extrair conceitos usando IA
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 PASSO 1: EXTRAÇÃO DE CONCEITOS COM IA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const concepts = await extractConcepts(validFrameworkElements, fullQuestion, frameworkType);
    
    // PASSO 2: Buscar termos MeSH para CADA conceito
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 PASSO 2: BUSCA DE TERMOS MESH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = [];
    const allMeshTerms = [];
    
    // PROCESSAR TODOS OS ELEMENTOS
    for (const [element, originalText] of Object.entries(validFrameworkElements)) {
      console.log(`\n📌 PROCESSANDO ELEMENTO: ${element}`);
      console.log(`📝 Texto original: "${originalText}"`);
      
      const elementResults = {
        element,
        originalText: originalText,
        terms: []
      };
      
      // Verificar se existem conceitos para este elemento
      const terms = concepts[element] || [];
      
      if (terms.length === 0) {
        console.log(`⚠️ Nenhum conceito extraído para ${element}, tentando buscar diretamente o texto original`);
        
        // Tentar buscar com o texto original se não houver conceitos
        if (originalText && originalText.trim()) {
          const { results: meshTerms } = await searchMeSHTerm(originalText);
          
          // Adicionar apenas termos com score >= 50%
          meshTerms.forEach(meshTerm => {
            if (meshTerm.relevanceScore >= 50) {
              const cleanTerm = { ...meshTerm };
              delete cleanTerm._rawData;
              
              if (!elementResults.terms.find(t => t.meshId === meshTerm.meshId)) {
                elementResults.terms.push(cleanTerm);
                allMeshTerms.push(cleanTerm);
                console.log(`      ✅ Termo adicionado: "${meshTerm.term}" (${meshTerm.relevanceScore}%)`);
              }
            }
          });
        }
      } else {
        console.log(`🔍 Conceitos a buscar: ${JSON.stringify(terms)}`);
        console.log(`📊 Total de conceitos: ${terms.length}`);
        
        // Buscar TODOS os termos sem limite
        for (const searchTerm of terms) {
          console.log(`\n   🔍 Buscando conceito: "${searchTerm}"`);
          
          const { results: meshTerms } = await searchMeSHTerm(searchTerm);
          
          // Adicionar apenas termos com score >= 50%
          meshTerms.forEach(meshTerm => {
            if (meshTerm.relevanceScore >= 50) {
              const cleanTerm = { ...meshTerm };
              delete cleanTerm._rawData;
              
              if (!elementResults.terms.find(t => t.meshId === meshTerm.meshId)) {
                elementResults.terms.push(cleanTerm);
                allMeshTerms.push(cleanTerm);
                console.log(`      ✅ Termo adicionado: "${meshTerm.term}" (${meshTerm.relevanceScore}%)`);
              }
            } else {
              console.log(`      ❌ Termo ignorado (score < 50%): "${meshTerm.term}" (${meshTerm.relevanceScore}%)`);
            }
          });
          
          // Pequena pausa entre requisições para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Ordena por relevância
      elementResults.terms.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // SEMPRE adiciona o elemento aos resultados
      results.push(elementResults);
      
      console.log(`\n✅ Total de termos MeSH com score >= 50% para ${element}: ${elementResults.terms.length}`);
    }

    // Remove duplicatas globais de allMeshTerms
    const uniqueMeshTerms = allMeshTerms
      .filter((term, index, self) => index === self.findIndex(t => t.meshId === term.meshId))
      .filter(term => term.relevanceScore >= 50); // Apenas termos com score >= 50%

    // LOG FINAL
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO FINAL DO PROCESSAMENTO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Total de elementos processados:', results.length);
    console.log('📋 Elementos do framework:', Object.keys(frameworkElements).join(', '));
    console.log('📋 Elementos incluídos nos resultados:', results.map(r => r.element).join(', '));
    console.log('\n📋 RESUMO POR ELEMENTO:');
    results.forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.element}: "${r.originalText}"`);
      console.log(`   - Conceitos buscados: ${concepts[r.element]?.length || 0}`);
      console.log(`   - Termos MeSH encontrados (score >= 50%): ${r.terms.length}`);
      if (r.terms.length > 0) {
        console.log('   - Top 5 termos:');
        r.terms.slice(0, 5).forEach((term, i) => {
          console.log(`     ${i + 1}. "${term.term}" (${term.relevanceScore}%)`);
        });
      }
    });
    console.log('\n🎯 Total de termos MeSH únicos (score >= 50%):', uniqueMeshTerms.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 API MeSH - FIM DO PROCESSAMENTO\n');

    // Preparar resposta
    const responseData = {
      results, 
      allMeshTerms: uniqueMeshTerms,
      debug: process.env.NODE_ENV === 'development' ? fullDebug : undefined
    };
      
    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Erro na busca MeSH:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar termos MeSH',
      details: error.message
    });
  }
}