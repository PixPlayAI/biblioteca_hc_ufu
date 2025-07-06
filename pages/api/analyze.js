// pages/api/analyze.js
import SYSTEM_PROMPT from '../../lib/systemPrompt';
import axios from 'axios';

// Função para normalizar elementos do BeHEMoTh e outros frameworks
function normalizeFrameworkElements(result) {
  if (!result?.finalResult) return result;
  
  const { format, elements, elementDescriptions } = result.finalResult;
  
  // Mapeamento específico para BeHEMoTh
  if (format === 'BeHEMoTh') {
    const behemothMapping = {
      'Be': 'behavior',
      'HE': 'healthContext',
      'Mo': 'exclusions',
      'Th': 'modelsOrTheories',
      'B': 'behavior',  // Caso venha só 'B'
      'H': 'healthContext',  // Caso venha só 'H'
      'E': 'exclusions',  // Caso venha só 'E'
      'M': 'modelsOrTheories'  // Caso venha só 'M'
    };
    
    // Normalizar elementos explícitos
    if (elements?.explicit) {
      const normalizedExplicit = {};
      const normalizedDescriptions = {};
      
      Object.entries(elements.explicit).forEach(([key, value]) => {
        // Se a chave é uma sigla conhecida do BeHEMoTh
        if (behemothMapping[key]) {
          const normalizedKey = behemothMapping[key];
          normalizedExplicit[normalizedKey] = value;
          normalizedExplicit[key] = value; // Manter também a sigla
          
          // Copiar descrições se existirem
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[normalizedKey] = elementDescriptions.explicit[key];
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        } else {
          // Manter elementos que já estão normalizados
          normalizedExplicit[key] = value;
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        }
      });
      
      // Garantir que todos os elementos do BeHEMoTh estejam presentes
      ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'].forEach(elem => {
        if (!normalizedExplicit[elem]) {
          // Procurar por valores em outras chaves
          for (const [sigla, elemName] of Object.entries(behemothMapping)) {
            if (elemName === elem && elements.explicit[sigla]) {
              normalizedExplicit[elem] = elements.explicit[sigla];
              if (elementDescriptions?.explicit?.[sigla]) {
                normalizedDescriptions[elem] = elementDescriptions.explicit[sigla];
              }
              break;
            }
          }
        }
      });
      
      result.finalResult.elements.explicit = normalizedExplicit;
      if (result.finalResult.elementDescriptions?.explicit) {
        result.finalResult.elementDescriptions.explicit = normalizedDescriptions;
      }
    }
    
    // Fazer o mesmo para elementos implícitos
    if (elements?.implicit) {
      const normalizedImplicit = { ...elements.explicit }; // Copiar do explicit
      result.finalResult.elements.implicit = normalizedImplicit;
    }
  }
  
  // Mapeamento específico para ECLIPSE
  if (format === 'ECLIPSE') {
    const eclipseMapping = {
      'E': 'expectation',
      'C': 'clientGroup',
      'L': 'location',
      'I': 'impact',
      'P': 'professionals',
      'SE': 'service',
      'S': 'service'  // Caso venha só 'S' ao invés de 'SE'
    };
    
    // Normalizar elementos explícitos
    if (elements?.explicit) {
      const normalizedExplicit = {};
      const normalizedDescriptions = {};
      
      Object.entries(elements.explicit).forEach(([key, value]) => {
        // Se a chave é uma sigla conhecida do ECLIPSE
        if (eclipseMapping[key]) {
          const normalizedKey = eclipseMapping[key];
          normalizedExplicit[normalizedKey] = value;
          normalizedExplicit[key === 'S' ? 'SE' : key] = value; // Corrigir S para SE
          
          // Copiar descrições se existirem
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[normalizedKey] = elementDescriptions.explicit[key];
            normalizedDescriptions[key === 'S' ? 'SE' : key] = elementDescriptions.explicit[key];
          }
        } else {
          // Manter elementos que já estão normalizados
          normalizedExplicit[key] = value;
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        }
      });
      
      // Garantir que todos os elementos do ECLIPSE estejam presentes
      ['expectation', 'clientGroup', 'location', 'impact', 'professionals', 'service'].forEach(elem => {
        if (!normalizedExplicit[elem]) {
          // Procurar por valores em outras chaves
          for (const [sigla, elemName] of Object.entries(eclipseMapping)) {
            if (elemName === elem && elements.explicit[sigla]) {
              normalizedExplicit[elem] = elements.explicit[sigla];
              if (elementDescriptions?.explicit?.[sigla]) {
                normalizedDescriptions[elem] = elementDescriptions.explicit[sigla];
              }
              break;
            }
          }
        }
      });
      
      result.finalResult.elements.explicit = normalizedExplicit;
      if (result.finalResult.elementDescriptions?.explicit) {
        result.finalResult.elementDescriptions.explicit = normalizedDescriptions;
      }
    }
    
    // Fazer o mesmo para elementos implícitos
    if (elements?.implicit) {
      const normalizedImplicit = { ...elements.explicit }; // Copiar do explicit
      result.finalResult.elements.implicit = normalizedImplicit;
    }
  }
  
  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ DEEPSEEK_API_KEY não está configurada');
    return res.status(500).json({ error: 'DeepSeek API key not configured.' });
  }

  const {
    history = [],
    currentInput,
    currentStep = 0,
    suggestionMode = false,
    suggestedElement = null,
  } = req.body.content || {};

  const promptMessage = `HISTÓRICO DA CONVERSA:
${history
  .map((h, i) => `ETAPA ${i + 1}: Pergunta: ${h.question}, Resposta: ${h.answer}`)
  .join('\n')}

RESPOSTA ATUAL (Etapa ${currentStep + 1}): "${currentInput}"`;

  try {
    console.log('📝 Enviando solicitação para DeepSeek com o prompt:', promptMessage);

    const deepseekResponse = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + '\nResponda APENAS em JSON.',
          },
          { role: 'user', content: promptMessage },
        ],
        temperature: 0,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 100000,
      }
    );

    const deepseekContent = deepseekResponse.data.choices?.[0]?.message?.content;

    console.log('📥 Resposta do DeepSeek:', deepseekResponse.data);

    if (!deepseekContent) {
      console.error('❌ Resposta vazia do DeepSeek');
      return res.status(500).json({ error: 'Empty response from DeepSeek.' });
    }

    const sanitizedContent = deepseekContent
      .trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      let parsedContent = JSON.parse(sanitizedContent);
      
      // Normalizar elementos do framework antes de retornar
      parsedContent = normalizeFrameworkElements(parsedContent);
      
      // Log para debug
      if (parsedContent.finalResult?.format === 'BeHEMoTh') {
        console.log('🔍 BeHEMoTh - Elementos normalizados:', parsedContent.finalResult.elements);
      }
      
      if (parsedContent.finalResult?.format === 'ECLIPSE') {
        console.log('🔍 ECLIPSE - Elementos normalizados:', parsedContent.finalResult.elements);
      }
      
      return res.json(parsedContent);
    } catch (e) {
      console.error('❌ Erro ao parsear resposta do DeepSeek:', sanitizedContent);
      return res.status(500).json({ error: 'Error parsing DeepSeek response.' });
    }
  } catch (e) {
    console.error('❌ Erro ao solicitar DeepSeek:', e.response?.data || e.message);
    return res.status(500).json({ error: 'Error requesting DeepSeek.' });
  }
}