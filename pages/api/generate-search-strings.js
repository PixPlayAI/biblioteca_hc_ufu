// pages/api/generate-search-strings.js
import { 
  SEARCH_STRING_PREAMBULO 
} from '../../lib/prompts/searchStringPreambulo';
import { 
  SEARCH_STRING_POSAMBULO 
} from '../../lib/prompts/searchStringPosambulo';

// Importar prompts individuais de cada base
import { SEARCH_STRING_PUBMED } from '../../lib/prompts/searchStringPubMed';
import { SEARCH_STRING_SCIELO } from '../../lib/prompts/searchStringSciELO';
import { SEARCH_STRING_EUROPE_PMC } from '../../lib/prompts/searchStringEuropePMC';
import { SEARCH_STRING_CROSSREF } from '../../lib/prompts/searchStringCrossRef';
import { SEARCH_STRING_DOAJ } from '../../lib/prompts/searchStringDOAJ';
import { SEARCH_STRING_COCHRANE } from '../../lib/prompts/searchStringCochrane';
import { SEARCH_STRING_LILACS } from '../../lib/prompts/searchStringLILACS';
import { SEARCH_STRING_SCOPUS } from '../../lib/prompts/searchStringScopus';
import { SEARCH_STRING_WEB_OF_SCIENCE } from '../../lib/prompts/searchStringWebOfScience';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Mapeamento de bases para prompts
const DATABASE_PROMPTS = {
  'pubmed': SEARCH_STRING_PUBMED,
  'scielo': SEARCH_STRING_SCIELO,
  'europe_pmc': SEARCH_STRING_EUROPE_PMC,
  'crossref': SEARCH_STRING_CROSSREF,
  'doaj': SEARCH_STRING_DOAJ,
  'cochrane': SEARCH_STRING_COCHRANE,
  'lilacs': SEARCH_STRING_LILACS,
  'scopus': SEARCH_STRING_SCOPUS,
  'web_of_science': SEARCH_STRING_WEB_OF_SCIENCE
};

// Função para montar o prompt para uma base específica
const montarPromptBase = (database) => {
  const promptBase = DATABASE_PROMPTS[database];
  if (!promptBase) {
    throw new Error(`Base de dados inválida: ${database}`);
  }
  
  return SEARCH_STRING_PREAMBULO + 
         promptBase + 
         SEARCH_STRING_POSAMBULO;
};

// Função para converter dados estruturados em formato de texto esperado pelo prompt
const createFormattedContent = (structuredData) => {
  let content = `Na pesquisa essa foi a pergunta de pesquisa estruturada:\n`;
  content += `${structuredData.question}\n\n`;
  content += `Essa pergunta foi classificada no acrônimo: ${structuredData.frameworkType}\n\n`;

  // Adicionar elementos e termos MeSH
  Object.entries(structuredData.elements).forEach(([key, description]) => {
    const label = getFrameworkElementLabel(key, structuredData.frameworkType);
    
    content += `A ${label} foi: ${description}\n`;
    
    // Adicionar termos MeSH se existirem
    const meshTerms = structuredData.meshTerms[key];
    if (meshTerms && meshTerms.length > 0) {
      content += `E os principais termos MeSH e descrição dos termos relacionados a ${label.toLowerCase()}, foram:\n`;
      
      meshTerms.forEach(term => {
        content += `${term.term}: ${term.definition || 'Sem descrição disponível no momento.'}\n`;
      });
    } else {
      content += `Para a ${label.toLowerCase()}, não foram encontrados termos MeSH com alta relevância nesta busca.\n`;
    }
    
    content += '\n';
  });

  return content.trim();
};

// Função auxiliar para obter label do elemento do framework
const getFrameworkElementLabel = (key, frameworkType) => {
  // Mapeamento simplificado - adapte conforme necessário
  const mappings = {
    PICO: {
      P: 'População',
      I: 'Intervenção',
      C: 'Comparação',
      O: 'Desfecho'
    },
    PICOT: {
      P: 'População',
      I: 'Intervenção',
      C: 'Comparação',
      O: 'Desfecho',
      T: 'Tempo'
    },
    PICOS: {
      P: 'População',
      I: 'Intervenção',
      C: 'Comparação',
      O: 'Desfecho',
      S: 'Tipo de Estudo'
    },
    PEO: {
      P: 'População',
      E: 'Exposição',
      O: 'Desfecho'
    },
    PECO: {
      P: 'População',
      E: 'Exposição',
      C: 'Comparação',
      O: 'Desfecho'
    },
    PCC: {
      P: 'População',
      C: 'Conceito',
      C2: 'Contexto'
    },
    SPIDER: {
      S: 'Amostra',
      PI: 'Fenômeno de Interesse',
      D: 'Desenho',
      E: 'Avaliação',
      R: 'Tipo de Pesquisa'
    },
    PIRD: {
      P: 'População',
      I: 'Teste Índice',
      R: 'Teste de Referência',
      D: 'Diagnóstico'
    },
    CoCoPop: {
      Co: 'Condição',
      Co2: 'Contexto',
      Pop: 'População'
    },
    SPICE: {
      S: 'Contexto',
      P: 'Perspectiva',
      I: 'Intervenção',
      C: 'Comparação',
      E: 'Avaliação'
    },
    ECLIPSE: {
      E: 'Expectativa',
      C: 'Grupo de Clientes',
      L: 'Local',
      I: 'Impacto',
      P: 'Profissionais',
      SE: 'Serviço'
    },
    BeHEMoTh: {
      Be: 'Comportamento',
      HE: 'Contexto de Saúde',
      Mo: 'Exclusões',
      Th: 'Modelos/Teorias'
    }
  };

  return mappings[frameworkType]?.[key] || key;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { meshContent, structuredData, database = 'pubmed' } = req.body;

  // Usar dados estruturados se disponíveis, senão usar meshContent
  let contentToProcess = meshContent;
  
  if (structuredData) {
    try {
      contentToProcess = createFormattedContent(structuredData);
      console.log('Usando dados estruturados formatados');
    } catch (error) {
      console.error('Erro ao formatar dados estruturados:', error);
      // Fallback para meshContent original
      contentToProcess = meshContent;
    }
  }

  if (!contentToProcess) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // Validar a base de dados
  const databaseLower = database.toLowerCase();
  if (!DATABASE_PROMPTS[databaseLower]) {
    return res.status(400).json({ error: 'Invalid database specified' });
  }

  // Determinar o nome da base esperada no resultado
  const expectedBase = databaseLower === 'pubmed' ? 'PubMed' :
                      databaseLower === 'scielo' ? 'SciELO' :
                      databaseLower === 'europe_pmc' ? 'Europe_PMC' :
                      databaseLower === 'crossref' ? 'CrossRef' :
                      databaseLower === 'doaj' ? 'DOAJ' :
                      databaseLower === 'cochrane' ? 'Cochrane_Library' :
                      databaseLower === 'lilacs' ? 'LILACS_BVS' :
                      databaseLower === 'scopus' ? 'Scopus' :
                      databaseLower === 'web_of_science' ? 'Web_of_Science' : '';

  try {
    const startTime = Date.now();
    console.log(`Processando base: ${expectedBase}`);
    console.log(`Tipo de framework: ${structuredData?.frameworkType || 'não especificado'}`);
    
    // Montar o prompt específico para a base
    const promptSelecionado = montarPromptBase(databaseLower);
    
    // Fazer requisição para DeepSeek
    const requestPayload = {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: promptSelecionado
        },
        { 
          role: 'user', 
          content: contentToProcess
        }
      ],
      temperature: 0,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      stream: false
    };

    console.log(`Enviando requisição para DeepSeek (${expectedBase})...`);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const responseData = await response.json();
    const processingTime = Date.now() - startTime;
    
    console.log(`Resposta recebida do DeepSeek em ${processingTime}ms`);

    // Extrair o conteúdo da resposta
    const content = responseData.choices[0].message.content;
    
    // Parsear o resultado
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao parsear resultado:', parseError);
      console.error('Conteúdo recebido:', content.substring(0, 500) + '...');
      throw new Error('Erro ao processar resposta JSON');
    }

    if (!result.search_strings || !result.search_strings.specific || !result.search_strings.broad) {
      console.error('Formato de resposta inválido:', result);
      throw new Error('Formato de resposta inválido');
    }

    // Filtrar apenas a base solicitada
    const filteredResult = {
      search_strings: {
        specific: {},
        broad: {}
      }
    };

    // Adicionar apenas a string da base solicitada
    if (result.search_strings.specific[expectedBase]) {
      filteredResult.search_strings.specific[expectedBase] = result.search_strings.specific[expectedBase];
    }
    if (result.search_strings.broad[expectedBase]) {
      filteredResult.search_strings.broad[expectedBase] = result.search_strings.broad[expectedBase];
    }

    console.log(`Retornando resultado para ${expectedBase}`);

    // Retornar resposta
    return res.status(200).json({
      success: true,
      data: filteredResult,
      processingTime: processingTime,
      database: expectedBase
    });

  } catch (error) {
    console.error('Erro:', error);
    
    let errorMessage = 'Erro ao gerar strings de busca';
    let errorDetails = error.message;
    
    if (error.message.includes('401')) {
      errorMessage = 'Erro de autenticação com DeepSeek';
      errorDetails = 'Verifique a chave da API';
    } else if (error.message.includes('429')) {
      errorMessage = 'Limite de taxa excedido';
      errorDetails = 'Tente novamente em alguns instantes';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Tempo limite excedido';
      errorDetails = 'A operação demorou muito. Tente novamente.';
    }
    
    return res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: errorDetails
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};