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
      'B': 'behavior',
      'H': 'healthContext',
      'E': 'exclusions',
      'M': 'modelsOrTheories'
    };
    
    // Normalizar elementos explícitos
    if (elements?.explicit) {
      const normalizedExplicit = {};
      const normalizedDescriptions = {};
      
      Object.entries(elements.explicit).forEach(([key, value]) => {
        if (behemothMapping[key]) {
          const normalizedKey = behemothMapping[key];
          normalizedExplicit[normalizedKey] = value;
          normalizedExplicit[key] = value;
          
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[normalizedKey] = elementDescriptions.explicit[key];
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        } else {
          normalizedExplicit[key] = value;
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        }
      });
      
      ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'].forEach(elem => {
        if (!normalizedExplicit[elem]) {
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
    
    if (elements?.implicit) {
      const normalizedImplicit = { ...elements.explicit };
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
      'S': 'service'
    };
    
    if (elements?.explicit) {
      const normalizedExplicit = {};
      const normalizedDescriptions = {};
      
      Object.entries(elements.explicit).forEach(([key, value]) => {
        if (eclipseMapping[key]) {
          const normalizedKey = eclipseMapping[key];
          normalizedExplicit[normalizedKey] = value;
          normalizedExplicit[key === 'S' ? 'SE' : key] = value;
          
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[normalizedKey] = elementDescriptions.explicit[key];
            normalizedDescriptions[key === 'S' ? 'SE' : key] = elementDescriptions.explicit[key];
          }
        } else {
          normalizedExplicit[key] = value;
          if (elementDescriptions?.explicit?.[key]) {
            normalizedDescriptions[key] = elementDescriptions.explicit[key];
          }
        }
      });
      
      ['expectation', 'clientGroup', 'location', 'impact', 'professionals', 'service'].forEach(elem => {
        if (!normalizedExplicit[elem]) {
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
    
    if (elements?.implicit) {
      const normalizedImplicit = { ...elements.explicit };
      result.finalResult.elements.implicit = normalizedImplicit;
    }
  }
  
  return result;
}

// Função para validar que a próxima pergunta não é repetida
function validateNextQuestion(response, history) {
  if (!response.nextQuestion?.text) return response;
  
  // Verifica se a pergunta atual é igual à última pergunta feita
  const lastQuestion = history[history.length - 1]?.question;
  
  if (lastQuestion && response.nextQuestion.text === lastQuestion) {
    console.error('⚠️ ERRO: IA está repetindo a mesma pergunta!');
    
    // Força uma nova pergunta baseada nos elementos faltantes
    if (response.analysis?.missingElements?.length > 0) {
      const missingElement = response.analysis.missingElements[0];
      const elementQuestions = {
        outcome: "Qual resultado ou desfecho você espera medir ou observar com este estudo?",
        comparison: "Você pretende comparar com algum outro grupo ou condição? Se sim, qual?",
        timeframe: "Há algum período de tempo específico para acompanhamento ou observação?",
        studyDesign: "Que tipo de estudo você planeja realizar (observacional, experimental, revisão)?",
        intervention: "Qual intervenção específica será aplicada?",
        exposure: "A que fator ou condição os participantes estão expostos?",
        context: "Em que contexto ou ambiente o estudo será realizado?"
      };
      
      response.nextQuestion = {
        text: elementQuestions[missingElement] || `Pode me contar mais sobre ${missingElement} do seu estudo?`,
        context: `Com base no que você já mencionou sobre ${response.analysis?.identifiedElements?.population || 'seu estudo'}, preciso entender melhor este aspecto.`,
        isRequired: true
      };
    } else {
      // Se não há elementos faltantes mas ainda não pode gerar o final, pede confirmação
      response.nextQuestion = {
        text: "Com base no que você me contou, já temos informações suficientes. Há mais algum detalhe importante que você gostaria de adicionar?",
        context: "Se não houver mais nada, posso estruturar sua pergunta de pesquisa agora.",
        isRequired: false
      };
    }
  }
  
  return response;
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

  // Monta o prompt incluindo contexto sobre evitar repetições
  const contextReminder = history.length > 0 ? `
IMPORTANTE: 
1. NÃO repita perguntas já feitas
2. USE o contexto das respostas anteriores para fazer perguntas mais específicas
3. A última resposta do usuário foi: "${currentInput}"
4. Você já identificou alguns elementos, agora precisa perguntar sobre os elementos FALTANTES
5. Seja específico e contextualizado baseado no que o usuário já disse` : '';

  const promptMessage = `HISTÓRICO DA CONVERSA:
${history
  .map((h, i) => `ETAPA ${i + 1}: 
  Pergunta: ${h.question}
  Resposta: ${h.answer}
  Qualidade: ${h.quality || 'N/A'}`)
  .join('\n')}

RESPOSTA ATUAL (Etapa ${currentStep + 1}): "${currentInput}"

${contextReminder}

REGRAS CRÍTICAS PARA PRÓXIMA PERGUNTA:
1. NUNCA repita uma pergunta já feita
2. Se o usuário já forneceu informações sobre população/problema, NÃO pergunte novamente
3. Faça perguntas sobre elementos AINDA NÃO IDENTIFICADOS
4. Use o contexto fornecido (jogos de tabuleiro, internação pediátrica, etc.) nas suas perguntas
5. Se já tem informações suficientes, gere o resultado final

Responda APENAS em JSON válido conforme o formato especificado.`;

  try {
    console.log('📝 Enviando solicitação para DeepSeek');
    console.log('📊 Histórico tem', history.length, 'interações');
    console.log('💬 Última resposta do usuário:', currentInput.substring(0, 100) + '...');

    const deepseekResponse = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + '\n\nLEMBRETE CRÍTICO: NUNCA repita perguntas. Sempre avance baseado no contexto já fornecido. Se o usuário já deu informações sobre o problema/população, pergunte sobre OUTROS elementos (intervenção, comparação, desfecho, etc.).',
          },
          { role: 'user', content: promptMessage },
        ],
        temperature: 0,
        max_tokens: 4096,
        response_format: { type: "json_object" }
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
      
      // Normalizar elementos do framework
      parsedContent = normalizeFrameworkElements(parsedContent);
      
      // Validar que não está repetindo perguntas
      parsedContent = validateNextQuestion(parsedContent, history);
      
      // Log para debug
      console.log('✅ Próxima pergunta:', parsedContent.nextQuestion?.text?.substring(0, 100) + '...');
      console.log('📊 Elementos identificados:', Object.keys(parsedContent.analysis?.identifiedElements || {}).filter(k => parsedContent.analysis.identifiedElements[k]));
      console.log('❓ Elementos faltantes:', parsedContent.analysis?.missingElements);
      
      // Verificação adicional para garantir progressão
      if (history.length > 0 && !parsedContent.canGenerateFinal) {
        const lastQuestionText = history[history.length - 1]?.question;
        if (parsedContent.nextQuestion?.text === lastQuestionText) {
          console.error('🔄 ALERTA: Detectada repetição de pergunta. Forçando progressão...');
          
          // Força progressão para o próximo elemento
          const identifiedKeys = Object.keys(parsedContent.analysis?.identifiedElements || {})
            .filter(k => parsedContent.analysis.identifiedElements[k]);
          
          if (identifiedKeys.includes('population') && !identifiedKeys.includes('intervention')) {
            parsedContent.nextQuestion = {
              text: "Entendi que você quer estudar crianças internadas. Agora, sobre a intervenção com jogos de tabuleiro: como exatamente isso seria implementado?",
              context: "Por exemplo: os jogos seriam oferecidos diariamente? Por quanto tempo? Seria uma sessão estruturada ou livre acesso?",
              isRequired: true
            };
          } else if (!identifiedKeys.includes('outcome')) {
            parsedContent.nextQuestion = {
              text: "Você mencionou querer avaliar o tempo de internação. Além disso, há outros aspectos que gostaria de medir?",
              context: "Como satisfação da criança, níveis de ansiedade, adesão ao tratamento, ou outros indicadores clínicos?",
              isRequired: true
            };
          }
        }
      }
      
      return res.json(parsedContent);
    } catch (e) {
      console.error('❌ Erro ao parsear resposta do DeepSeek:', e);
      console.error('Conteúdo que causou erro:', sanitizedContent.substring(0, 500));
      return res.status(500).json({ error: 'Error parsing DeepSeek response.' });
    }
  } catch (e) {
    console.error('❌ Erro ao solicitar DeepSeek:', e.response?.data || e.message);
    return res.status(500).json({ error: 'Error requesting DeepSeek.' });
  }
}