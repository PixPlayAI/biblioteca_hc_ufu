// pages/api/generate-search-strings.js
import axios from 'axios';
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

const montarPromptCompleto = () => {
  return SEARCH_STRING_PREAMBULO + 
         SEARCH_STRING_BASES_PRIMEIRA_PARTE + 
         SEARCH_STRING_BASES_SEGUNDA_PARTE + 
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
      expectedBases = ['PubMed', 'SciELO', 'Europe_PMC', 'CrossRef'];
      console.log('Processando primeira parte: PubMed, SciELO, Europe PMC, CrossRef');
      break;
    case 'segundaParte':
      promptSelecionado = montarPromptSegundaParte();
      expectedBases = ['DOAJ', 'Cochrane_Library', 'LILACS_BVS', 'Scopus', 'Web_of_Science'];
      console.log('Processando segunda parte: DOAJ, Cochrane, LILACS, Scopus, Web of Science');
      break;
    case 'completo':
    default:
      promptSelecionado = montarPromptCompleto();
      expectedBases = ['PubMed', 'SciELO', 'Europe_PMC', 'CrossRef', 'DOAJ', 'Cochrane_Library', 'LILACS_BVS', 'Scopus', 'Web_of_Science'];
      console.log('Processando prompt completo: todas as 9 bases');
      break;
  }

  // Configurar SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Content-Encoding': 'none'
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (res.flush) res.flush();
  };

  try {
    sendEvent({ 
      type: 'status', 
      message: `Conectado ao servidor. Iniciando processamento ${promptType === 'primeiraParte' ? '(Parte 1/2)' : promptType === 'segundaParte' ? '(Parte 2/2)' : ''}...` 
    });

    // IMPORTANTE: Habilitar streaming na API DeepSeek
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
      stream: true // ATIVAR STREAMING
    };

    sendEvent({ 
      type: 'status', 
      message: `Processando com DeepSeek ${promptType === 'primeiraParte' ? '(Bases 1-4)' : promptType === 'segundaParte' ? '(Bases 5-9)' : '(Todas as bases)'}...` 
    });

    const startTime = Date.now();
    
    // Fazer requisição com streaming
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let chunkCount = 0;

    sendEvent({ 
      type: 'status', 
      message: 'Recebendo resposta...' 
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              fullContent += data.choices[0].delta.content;
              chunkCount++;
              
              // Enviar progresso a cada 10 chunks
              if (chunkCount % 10 === 0) {
                sendEvent({ 
                  type: 'progress', 
                  message: `Processando... (${Math.min(chunkCount, 100)}%)`,
                  chunks: chunkCount
                });
              }
            }
          } catch (e) {
            console.error('Erro ao processar chunk:', e);
          }
        }
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`Streaming concluído em ${processingTime}ms para ${promptType}`);

    // Parsear o resultado final
    sendEvent({ 
      type: 'status', 
      message: 'Finalizando processamento...' 
    });

    let result;
    try {
      result = JSON.parse(fullContent);
    } catch (parseError) {
      console.error('Erro ao parsear resultado:', parseError);
      console.error('Conteúdo recebido:', fullContent.substring(0, 500) + '...');
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

    console.log(`Enviando resultado filtrado para ${promptType}:`, Object.keys(filteredResult.search_strings.specific));

    sendEvent({ 
      type: 'complete',
      success: true,
      data: filteredResult,
      processingTime: processingTime,
      message: `Strings de busca geradas com sucesso ${promptType === 'primeiraParte' ? '(Parte 1/2)' : promptType === 'segundaParte' ? '(Parte 2/2)' : ''}!`
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
    
    sendEvent({ 
      type: 'error',
      error: errorMessage,
      details: errorDetails
    });
  } finally {
    sendEvent({ type: 'done' });
    res.end();
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};