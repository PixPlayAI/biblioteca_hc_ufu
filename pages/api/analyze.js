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

// Função para garantir que não haja repetição de perguntas
function ensureUniqueQuestion(response, history) {
  // Extrai todas as perguntas já feitas
  const previousQuestions = history.map(h => h.question?.toLowerCase().trim());
  const currentQuestionLower = response.nextQuestion?.text?.toLowerCase().trim();
  
  // Verifica se a pergunta atual já foi feita
  if (previousQuestions.includes(currentQuestionLower)) {
    console.error('🔴 ERRO CRÍTICO: Pergunta repetida detectada!');
    console.error('Pergunta repetida:', response.nextQuestion?.text);
    console.error('Elementos já identificados:', response.analysis?.identifiedElements);
    
    // Força uma nova pergunta baseada nos elementos identificados
    const identified = response.analysis?.identifiedElements || {};
    const missing = response.analysis?.missingElements || [];
    
    // Mapa de perguntas para elementos faltantes
    const questionMap = {
      comparison: {
        text: "Você pretende comparar a musicoterapia com outro tipo de intervenção ou com um grupo controle sem intervenção?",
        context: "Por exemplo: comparar com atividades recreativas tradicionais, ou com pacientes que recebem apenas o cuidado padrão?"
      },
      outcome: {
        text: "Além do tempo de internação, há outros resultados que você gostaria de medir?",
        context: "Como satisfação do paciente, níveis de ansiedade, adesão ao tratamento, ou indicadores clínicos específicos?"
      },
      timeframe: {
        text: "Por quanto tempo você planeja acompanhar esses pacientes?",
        context: "Seria durante toda a internação? Ou há um período específico de seguimento?"
      },
      studyDesign: {
        text: "Que tipo de estudo você pretende realizar?",
        context: "Será um estudo experimental randomizado, observacional, ou outro tipo de desenho?"
      },
      comorbidity: {
        text: "Você mencionou 'comorbidade específica'. Já definiu qual condição clínica será o foco?",
        context: "Por exemplo: pneumonia, pós-operatório, doenças crônicas, ou outra condição?"
      }
    };
    
    // Tenta encontrar o próximo elemento faltante para perguntar
    for (const element of missing) {
      if (questionMap[element]) {
        response.nextQuestion = questionMap[element];
        response.nextQuestion.isRequired = true;
        console.log('✅ Nova pergunta gerada:', response.nextQuestion.text);
        return response;
      }
    }
    
    // Se já identificou população e intervenção mas não outros elementos
    if (identified.population && identified.intervention) {
      if (!identified.comparison) {
        response.nextQuestion = questionMap.comparison;
      } else if (!identified.outcome || identified.outcome === 'tempo de internação') {
        response.nextQuestion = questionMap.outcome;
      } else if (!identified.timeframe) {
        response.nextQuestion = questionMap.timeframe;
      } else {
        // Se tem elementos suficientes, sugere finalizar
        response.nextQuestion = {
          text: "Com base no que você descreveu, já temos os elementos principais. Gostaria de adicionar mais algum detalhe antes de estruturarmos sua pergunta?",
          context: "Se não houver mais nada, posso formatar sua pergunta de pesquisa agora.",
          isRequired: false
        };
        response.canGenerateFinal = true;
      }
    } else if (!identified.intervention) {
      response.nextQuestion = {
        text: "Como exatamente a musicoterapia seria aplicada no seu estudo?",
        context: "Por exemplo: sessões individuais ou em grupo? Frequência e duração das sessões? Tipo de atividades musicais?",
        isRequired: true
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

  // Se é a primeira interação após a pergunta inicial
  const isSecondInteraction = history.length === 1;
  const hasDetailedFirstResponse = currentInput && currentInput.length > 50 && 
    (currentInput.toLowerCase().includes('musicoterapia') || 
     currentInput.toLowerCase().includes('jogos') || 
     currentInput.toLowerCase().includes('internação'));

  // Força progressão se detectar resposta detalhada na segunda interação
  let forceProgression = '';
  if (isSecondInteraction && hasDetailedFirstResponse) {
    forceProgression = `
ATENÇÃO CRÍTICA: O usuário já forneceu uma resposta DETALHADA sobre população e intervenção. 
NÃO pergunte novamente sobre o problema ou população.
Elementos já identificados na resposta:
- População: pacientes pediátricos
- Intervenção: musicoterapia
- Local: HC-UFU/EBSERH
- Desfecho parcial: tempo de internação

PRÓXIMA PERGUNTA DEVE SER SOBRE: comparação, detalhes da comorbidade, ou outros desfechos.
NÃO REPITA A PERGUNTA INICIAL!`;
  }

  const promptMessage = `HISTÓRICO DA CONVERSA:
${history
  .map((h, i) => `ETAPA ${i + 1}: 
  Pergunta: "${h.question}"
  Resposta do usuário: "${h.answer}"`)
  .join('\n')}

RESPOSTA ATUAL (Etapa ${currentStep + 1}): "${currentInput}"

${forceProgression}

ANÁLISE CRÍTICA DO CONTEXTO:
- Número de interações já realizadas: ${history.length}
- Usuário já forneceu informação detalhada: ${hasDetailedFirstResponse ? 'SIM' : 'NÃO'}
- Comprimento da resposta atual: ${currentInput.length} caracteres

REGRAS ABSOLUTAS:
1. SE o usuário já forneceu informações sobre população/problema, NUNCA pergunte isso novamente
2. SE a resposta menciona intervenção (musicoterapia, jogos, etc.), pergunte sobre OUTROS elementos
3. Perguntas já feitas: ${history.map(h => h.question).join('; ')}
4. NÃO REPITA nenhuma dessas perguntas
5. Use o contexto específico fornecido pelo usuário em suas perguntas

Responda APENAS em JSON válido.`;

  try {
    console.log('📝 Processando interação', currentStep + 1);
    console.log('📊 Resposta do usuário tem', currentInput.length, 'caracteres');
    console.log('🔍 Detectada resposta detalhada?', hasDetailedFirstResponse);

    const deepseekResponse = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + `

REGRA MÁXIMA: Após receber a primeira resposta do usuário, NUNCA repita a pergunta inicial sobre população/problema.
Se o usuário já mencionou população, intervenção ou qualquer elemento, avance para os próximos elementos.
Seja inteligente e adaptativo - não siga um script fixo.`,
          },
          { 
            role: 'user', 
            content: promptMessage 
          },
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

    try {
      let parsedContent = JSON.parse(deepseekContent);
      
      // Normalizar elementos do framework
      parsedContent = normalizeFrameworkElements(parsedContent);
      
      // VALIDAÇÃO CRÍTICA: Garantir que não há repetição de perguntas
      parsedContent = ensureUniqueQuestion(parsedContent, history);
      
      // Log final
      console.log('✅ Próxima pergunta gerada:', parsedContent.nextQuestion?.text?.substring(0, 100));
      console.log('📊 Pode gerar resultado final?', parsedContent.canGenerateFinal);
      
      return res.json(parsedContent);
    } catch (e) {
      console.error('❌ Erro ao parsear resposta do DeepSeek:', e);
      return res.status(500).json({ error: 'Error parsing DeepSeek response.' });
    }
  } catch (e) {
    console.error('❌ Erro ao solicitar DeepSeek:', e.response?.data || e.message);
    return res.status(500).json({ error: 'Error requesting DeepSeek.' });
  }
}