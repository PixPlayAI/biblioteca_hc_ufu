// pages/api/generate-search-strings.js
import { 
  SEARCH_STRING_PREAMBULO 
} from '../../lib/prompts/searchStringPreambulo';
import { 
  SEARCH_STRING_BASES_PRIMEIRA_PARTE 
} from '../../lib/prompts/searchStringBasesPrimeiraParte';
import { 
  SEARCH_STRING_BASES_SEGUNDA_PARTE 
} from '../../lib/prompts/searchStringBasesSegundaParte';
import { 
  SEARCH_STRING_BASES_TERCEIRA_PARTE 
} from '../../lib/prompts/searchStringBasesTerceiraParte';
import { 
  SEARCH_STRING_POSAMBULO 
} from '../../lib/prompts/searchStringPosambulo';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Função para montar os prompts dinamicamente
const montarPromptPrimeiraParte = () => {
  return SEARCH_STRING_PREAMBULO + 
         SEARCH_STRING_BASES_PRIMEIRA_PARTE + 
         SEARCH_STRING_POSAMBULO;
};

const montarPromptSegundaParte = () => {
  return SEARCH_STRING_PREAMBULO + 
         SEARCH_STRING_BASES_SEGUNDA_PARTE + 
         SEARCH_STRING_POSAMBULO;
};

const montarPromptTerceiraParte = () => {
  return SEARCH_STRING_PREAMBULO + 
         SEARCH_STRING_BASES_TERCEIRA_PARTE + 
         SEARCH_STRING_POSAMBULO;
};

const montarPromptCompleto = () => {
  return SEARCH_STRING_PREAMBULO + 
         SEARCH_STRING_BASES_PRIMEIRA_PARTE + 
         SEARCH_STRING_BASES_SEGUNDA_PARTE + 
         SEARCH_STRING_BASES_TERCEIRA_PARTE +
         SEARCH_STRING_POSAMBULO;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { meshContent, promptType = 'completo' } = req.body;

  if (!meshContent) {
    return res.status(400).json({ error: 'MeSH content is required' });
  }

  // Selecionar o prompt baseado no tipo solicitado
  let promptSelecionado;
  let expectedBases = [];
  
  switch (promptType) {
    case 'primeiraParte':
      promptSelecionado = montarPromptPrimeiraParte();
      expectedBases = ['PubMed', 'SciELO'];
      console.log('Processando primeira parte: PubMed, SciELO');
      break;
    case 'segundaParte':
      promptSelecionado = montarPromptSegundaParte();
      expectedBases = ['Europe_PMC', 'CrossRef', 'DOAJ', 'Cochrane_Library'];
      console.log('Processando segunda parte: Europe PMC, CrossRef, DOAJ, Cochrane');
      break;
    case 'terceiraParte':
      promptSelecionado = montarPromptTerceiraParte();
      expectedBases = ['LILACS_BVS', 'Scopus', 'Web_of_Science'];
      console.log('Processando terceira parte: LILACS, Scopus, Web of Science');
      break;
    case 'completo':
    default:
      promptSelecionado = montarPromptCompleto();
      expectedBases = ['PubMed', 'SciELO', 'Europe_PMC', 'CrossRef', 'DOAJ', 'Cochrane_Library', 'LILACS_BVS', 'Scopus', 'Web_of_Science'];
      console.log('Processando prompt completo: todas as 9 bases');
      break;
  }

  try {
    const startTime = Date.now();
    
    // Fazer requisição SEM streaming para DeepSeek
    const requestPayload = {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: promptSelecionado
        },
        { 
          role: 'user', 
          content: meshContent
        }
      ],
      temperature: 0,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      stream: false // DESATIVAR STREAMING
    };

    console.log(`Enviando requisição para DeepSeek (${promptType})...`);

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

    // Validar que recebemos as bases esperadas
    const receivedBases = Object.keys(result.search_strings.specific);
    const missingBases = expectedBases.filter(base => !receivedBases.includes(base));
    
    if (missingBases.length > 0) {
      console.warn(`Bases esperadas mas não recebidas: ${missingBases.join(', ')}`);
    }

    // Filtrar apenas as bases esperadas para esta parte
    const filteredResult = {
      search_strings: {
        specific: {},
        broad: {}
      }
    };

    expectedBases.forEach(base => {
      if (result.search_strings.specific[base]) {
        filteredResult.search_strings.specific[base] = result.search_strings.specific[base];
      }
      if (result.search_strings.broad[base]) {
        filteredResult.search_strings.broad[base] = result.search_strings.broad[base];
      }
    });

    console.log(`Retornando resultado para ${promptType}:`, Object.keys(filteredResult.search_strings.specific));

    // Retornar resposta JSON normal
    return res.status(200).json({
      success: true,
      data: filteredResult,
      processingTime: processingTime,
      promptType: promptType
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
      errorDetails = 'A operação demorou muito. Tente com menos bases por vez.';
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