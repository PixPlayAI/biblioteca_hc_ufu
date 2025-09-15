// pages/api/analyze.js
import SYSTEM_PROMPT from '../../lib/systemPrompt';
import axios from 'axios';

// Função para extrair elementos da resposta do usuário
function extractElementsFromResponse(response) {
  const elements = {
    population: null,
    intervention: null,
    comparison: null,
    outcome: null,
    timeframe: null,
    studyDesign: null,
    exposure: null,
    location: null,
    condition: null
  };

  const text = response.toLowerCase();
  
  // População
  if (text.includes('pacientes pediátricos') || text.includes('crianças') || text.includes('pediatr')) {
    elements.population = 'pacientes pediátricos';
  }
  
  // Intervenção
  if (text.includes('musicoterapia')) {
    elements.intervention = 'musicoterapia';
  }
  
  // Local
  if (text.includes('hc-ufu') || text.includes('hc ufu') || text.includes('ebserh')) {
    elements.location = 'HC-UFU/EBSERH';
  }
  
  // Desfecho
  if (text.includes('tempo de internação') || text.includes('reduz') || text.includes('reduzir')) {
    elements.outcome = 'redução do tempo de internação';
  }
  
  // Comparação
  if (text.includes('não recebem') || text.includes('comparação') || text.includes('versus') || text.includes('comparado')) {
    elements.comparison = 'pacientes que não recebem a intervenção';
  }
  
  // Condição/Comorbidade
  if (text.includes('comorbidade')) {
    elements.condition = 'comorbidade específica (a definir)';
  }
  
  return elements;
}

// Função para determinar próxima pergunta baseada nos elementos já identificados
function determineNextQuestion(identifiedElements, history) {
  const questions = {
    condition: {
      text: "Você mencionou 'comorbidade específica'. Qual condição clínica você pretende focar?",
      context: "Por exemplo: pneumonia, cirurgias pediátricas, doenças respiratórias, oncologia pediátrica, ou outra condição específica que seja comum no HC-UFU?"
    },
    interventionDetails: {
      text: "Como será aplicada a musicoterapia no seu estudo?",
      context: "Considere detalhes como: sessões individuais ou em grupo, frequência (diária, 3x por semana), duração das sessões (30 min, 1 hora), tipo de atividades musicais (audição passiva, participação ativa, instrumentos)?"
    },
    comparisonDetails: {
      text: "Como será o grupo de comparação no seu estudo?",
      context: "Será um grupo controle sem nenhuma intervenção adicional? Ou receberão atividades recreativas tradicionais? Talvez cuidado padrão apenas?"
    },
    outcomeDetails: {
      text: "Além do tempo de internação, você pretende avaliar outros desfechos?",
      context: "Por exemplo: níveis de ansiedade (usando escalas específicas), satisfação dos pais/pacientes, uso de medicação para dor/ansiedade, parâmetros fisiológicos (frequência cardíaca, pressão), adesão ao tratamento?"
    },
    timeframe: {
      text: "Por quanto tempo você planeja acompanhar cada paciente?",
      context: "Durante toda a internação? Um período fixo (ex: primeiros 7 dias)? Ou há seguimento após alta hospitalar?"
    },
    studyDesign: {
      text: "Que tipo de desenho de estudo você pretende usar?",
      context: "Estudo randomizado controlado? Estudo observacional comparativo? Estudo antes e depois? Série de casos?"
    }
  };
  
  // Priorizar perguntas baseadas no que falta
  if (identifiedElements.condition === 'comorbidade específica (a definir)') {
    return questions.condition;
  }
  
  if (identifiedElements.intervention && !identifiedElements.interventionDetails) {
    return questions.interventionDetails;
  }
  
  if (identifiedElements.comparison && !identifiedElements.comparisonDetails) {
    return questions.comparisonDetails;
  }
  
  if (!identifiedElements.timeframe) {
    return questions.timeframe;
  }
  
  if (!identifiedElements.studyDesign) {
    return questions.studyDesign;
  }
  
  if (identifiedElements.outcome === 'redução do tempo de internação') {
    return questions.outcomeDetails;
  }
  
  // Se já tem elementos suficientes, sugerir finalização
  return {
    text: "Com base no que discutimos, já temos os elementos principais da sua pesquisa. Há algo mais que você gostaria de especificar?",
    context: "Se não, posso estruturar sua pergunta de pesquisa no formato mais adequado (provavelmente PICO ou PICOT)."
  };
}

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

  // Análise inteligente do contexto
  console.log('📝 Processando interação', currentStep + 1);
  console.log('📊 Histórico de perguntas:', history.map(h => h.question));
  console.log('💬 Resposta atual:', currentInput);
  
  // Extrair todos os elementos já identificados de todo o histórico
  let allIdentifiedElements = {};
  
  // Extrair do histórico
  history.forEach(h => {
    const extractedFromAnswer = extractElementsFromResponse(h.answer);
    allIdentifiedElements = { ...allIdentifiedElements, ...extractedFromAnswer };
  });
  
  // Extrair da resposta atual
  const currentExtracted = extractElementsFromResponse(currentInput);
  allIdentifiedElements = { ...allIdentifiedElements, ...currentExtracted };
  
  console.log('🔍 Elementos já identificados:', allIdentifiedElements);
  
  // Verificar se está repetindo perguntas
  const lastQuestion = history.length > 0 ? history[history.length - 1].question : null;
  const isRepeatingQuestion = history.some(h => 
    h.question.toLowerCase().includes('principal problema') || 
    h.question.toLowerCase().includes('população que você pretende')
  );
  
  // Determinar próxima pergunta baseada no contexto
  const contextualNextQuestion = determineNextQuestion(allIdentifiedElements, history);
  
  // Criar prompt mais inteligente
  const enhancedPrompt = `
CONTEXTO CRÍTICO DA CONVERSA:
- Interação número: ${currentStep + 1}
- Elementos JÁ IDENTIFICADOS: ${JSON.stringify(allIdentifiedElements, null, 2)}

HISTÓRICO DETALHADO:
${history.map((h, i) => `
INTERAÇÃO ${i + 1}:
Pergunta: "${h.question}"
Resposta: "${h.answer}"
Elementos extraídos: ${JSON.stringify(extractElementsFromResponse(h.answer))}
`).join('\n')}

RESPOSTA ATUAL:
"${currentInput}"
Elementos extraídos desta resposta: ${JSON.stringify(currentExtracted)}

REGRAS ABSOLUTAS PARA ESTA INTERAÇÃO:
1. NUNCA repita perguntas sobre elementos já identificados
2. População já foi identificada como: ${allIdentifiedElements.population || 'não identificada'}
3. Intervenção já foi identificada como: ${allIdentifiedElements.intervention || 'não identificada'}
4. Se população e intervenção já foram identificadas, PROSSIGA para outros elementos
5. Próxima pergunta sugerida baseada no contexto: "${contextualNextQuestion.text}"
6. Contexto da pergunta sugerida: "${contextualNextQuestion.context}"

INSTRUÇÕES ESPECÍFICAS:
- Se o usuário já forneceu informações sobre musicoterapia e pacientes pediátricos, NÃO pergunte sobre isso novamente
- Foque em elementos faltantes como: especificação da comorbidade, detalhes da intervenção, desenho do estudo, período de seguimento
- Se já tem elementos suficientes (>70%), considere finalizar com canGenerateFinal: true
- Use as perguntas contextualizadas fornecidas acima como base

Responda APENAS em JSON válido seguindo a estrutura especificada.`;

  try {
    const deepseekResponse = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + `
            
IMPORTANTE: Você deve ser INTELIGENTE e ADAPTATIVO:
- Analise SEMPRE o que já foi respondido antes de fazer nova pergunta
- NUNCA repita perguntas já feitas
- Se o usuário já deu informação detalhada, AVANCE para próximos elementos
- Contextualize SEMPRE as perguntas com base no que já foi discutido
- Finalize quando tiver ~70% dos elementos identificados`,
          },
          { 
            role: 'user', 
            content: enhancedPrompt 
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
      
      // Validação adicional para prevenir loops
      if (parsedContent.nextQuestion) {
        const nextQuestionLower = parsedContent.nextQuestion.text.toLowerCase();
        
        // Verificar se está tentando repetir pergunta sobre população/problema
        if (isRepeatingQuestion && 
            (nextQuestionLower.includes('principal problema') || 
             nextQuestionLower.includes('população que você pretende'))) {
          
          console.warn('⚠️ Detectada tentativa de repetir pergunta inicial. Forçando progressão...');
          
          // Forçar pergunta contextualizada
          parsedContent.nextQuestion = contextualNextQuestion;
          parsedContent.nextQuestion.isRequired = true;
        }
        
        // Verificar se está repetindo última pergunta
        if (lastQuestion && lastQuestion.toLowerCase() === nextQuestionLower) {
          console.warn('⚠️ Detectada repetição da última pergunta. Avançando...');
          parsedContent.nextQuestion = contextualNextQuestion;
        }
      }
      
      // Se tem muitos elementos identificados, considerar finalização
      const identifiedCount = Object.values(allIdentifiedElements).filter(v => v !== null).length;
      if (identifiedCount >= 5 && !parsedContent.canGenerateFinal) {
        console.log('✅ Elementos suficientes identificados. Sugerindo finalização...');
        parsedContent.canGenerateFinal = true;
      }
      
      // Normalizar elementos do framework
      parsedContent = normalizeFrameworkElements(parsedContent);
      
      // Log final
      console.log('✅ Próxima pergunta:', parsedContent.nextQuestion?.text);
      console.log('📊 Pode finalizar?', parsedContent.canGenerateFinal);
      
      return res.json(parsedContent);
    } catch (e) {
      console.error('❌ Erro ao parsear resposta:', e);
      return res.status(500).json({ error: 'Error parsing DeepSeek response.' });
    }
  } catch (e) {
    console.error('❌ Erro na requisição:', e.response?.data || e.message);
    return res.status(500).json({ error: 'Error requesting DeepSeek.' });
  }
}