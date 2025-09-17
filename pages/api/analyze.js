// pages/api/analyze.js
import SYSTEM_PROMPT from '../../lib/systemPrompt';
import axios from 'axios';

// Função para detectar contradições nas respostas
function detectContradictions(history, currentInput) {
  const contradictions = [];
  const allText = [...history.map(h => h.answer), currentInput].join(' ').toLowerCase();
  
  // Lista de contradições conhecidas
  const contradictionPatterns = [
    {
      pattern1: ['estudo transversal', 'corte transversal', 'transversal', 'cross-sectional'],
      pattern2: ['acompanhamento', 'seguimento', 'follow-up', 'longitudinal', 'ao longo de', 'durante meses', 'durante anos'],
      message: 'Você mencionou que é um estudo transversal, mas também falou em acompanhamento/seguimento. Estudos transversais são "fotografias" em um momento específico, sem seguimento.'
    },
    {
      pattern1: ['coleta única', 'momento único', 'sem seguimento'],
      pattern2: ['evolução', 'mudança ao longo do tempo', 'acompanhar', 'seguir'],
      message: 'Você disse que será coleta única, mas também mencionou avaliar evolução ao longo do tempo. Isso é contraditório.'
    },
    {
      pattern1: ['observacional', 'não há intervenção', 'apenas observar'],
      pattern2: ['aplicar tratamento', 'administrar medicamento', 'intervenção ativa', 'protocolo de tratamento'],
      message: 'Você indicou que é um estudo observacional, mas também mencionou aplicar intervenções ativas. Isso é contraditório.'
    },
    {
      pattern1: ['retrospectivo', 'dados históricos', 'análise de prontuários'],
      pattern2: ['seguimento prospectivo', 'acompanhar futuramente', 'coletar dados futuros'],
      message: 'Você mencionou estudo retrospectivo, mas também falou em seguimento prospectivo. Isso é contraditório.'
    },
    {
      pattern1: ['sem comparação', 'não há grupo controle', 'sem grupo de comparação'],
      pattern2: ['comparar com', 'versus', 'grupo controle', 'comparado a'],
      message: 'Você disse que não há comparação, mas também mencionou grupos de comparação. Preciso esclarecer isso.'
    }
  ];
  
  // Verificar cada padrão de contradição
  for (const contradiction of contradictionPatterns) {
    const hasPattern1 = contradiction.pattern1.some(p => allText.includes(p));
    const hasPattern2 = contradiction.pattern2.some(p => allText.includes(p));
    
    if (hasPattern1 && hasPattern2) {
      contradictions.push(contradiction.message);
    }
  }
  
  // Verificação específica para PICOT vs PICO
  const hasTransversal = allText.includes('transversal') || allText.includes('cross-sectional');
  const hasTimeElement = allText.includes('meses') || allText.includes('anos') || 
                         allText.includes('seguimento') || allText.includes('acompanhamento');
  
  if (hasTransversal && hasTimeElement) {
    contradictions.push('ATENÇÃO: Estudo transversal detectado com menção a tempo. Estudos transversais NUNCA usam PICOT, apenas PICO.');
  }
  
  return contradictions;
}

// Função para obter contador de contradições do histórico
function getContradictionCount(history) {
  // Contar quantas vezes já houve questionamento direto sobre contradições
  let count = 0;
  history.forEach(h => {
    if (h.isDirectContradiction) {
      count++;
    }
  });
  return count;
}

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
  
  // Desenho do estudo - IMPORTANTE para evitar PICOT incorreto
  if (text.includes('transversal') || text.includes('cross-sectional')) {
    elements.studyDesign = 'transversal';
  }
  if (text.includes('longitudinal') || text.includes('coorte') || text.includes('seguimento')) {
    elements.studyDesign = 'longitudinal';
  }
  
  return elements;
}

// Função para determinar próxima pergunta baseada nos elementos já identificados
function determineNextQuestion(identifiedElements, history, contradictions) {
  // Se há contradições, resolver primeiro
  if (contradictions.length > 0) {
    const count = getContradictionCount(history);
    
    if (count >= 3) {
      // Após 3 tentativas, escolher automaticamente
      return {
        text: "Baseado no contexto geral, vou considerar que seu estudo é [tipo mais provável]. Vamos prosseguir.",
        context: "Se discordar, por favor seja específico sobre o desenho do seu estudo.",
        isDirectContradiction: false
      };
    }
    
    return {
      text: `⚠️ CONTRADIÇÃO DETECTADA: ${contradictions[0]} Por favor, escolha apenas UMA das opções abaixo:`,
      context: `Opção 1: É um estudo transversal (fotografia em um momento, sem seguimento)
Opção 2: É um estudo com seguimento/acompanhamento dos mesmos participantes
Opção 3: Outra configuração (por favor, explique claramente)

Esta é a ${count + 1}ª vez que pergunto. Preciso dessa definição para estruturar corretamente sua pesquisa.`,
      isDirectContradiction: true,
      isRequired: true
    };
  }
  
  const questions = {
    condition: {
      text: "Você mencionou 'comorbidade específica'. Qual condição clínica você pretende focar? Se isso não fizer sentido para seu estudo, sinta-se à vontade para dizer que não se aplica.",
      context: "Por exemplo: pneumonia, cirurgias pediátricas, doenças respiratórias, oncologia pediátrica, ou outra condição específica que seja comum no HC-UFU? Mas se nenhuma dessas opções fizer sentido para o seu caso, apenas me avise que não se aplica."
    },
    interventionDetails: {
      text: "Como será aplicada a musicoterapia no seu estudo? Caso não venha a aplicar musicoterapia, sinta-se à vontade para dizer que não faz sentido.",
      context: "Considere detalhes como: sessões individuais ou em grupo, frequência (diária, 3x por semana), duração das sessões (30 min, 1 hora), tipo de atividades musicais (audição passiva, participação ativa, instrumentos)? Mas se isso não fizer sentido para o seu estudo, apenas diga 'não se aplica'."
    },
    comparisonDetails: {
      text: "Como será o grupo de comparação no seu estudo? Se não houver comparação ou não fizer sentido, me avise.",
      context: "Será um grupo controle sem nenhuma intervenção adicional? Ou receberão atividades recreativas tradicionais? Talvez cuidado padrão apenas? Se não houver grupo de comparação ou isso não se aplicar ao seu estudo, sinta-se à vontade para dizer."
    },
    outcomeDetails: {
      text: "Além do tempo de internação, você pretende avaliar outros desfechos? Caso não pretenda avaliar outros desfechos, pode dizer que não.",
      context: "Por exemplo: níveis de ansiedade (usando escalas específicas), satisfação dos pais/pacientes, uso de medicação para dor/ansiedade, parâmetros fisiológicos (frequência cardíaca, pressão), adesão ao tratamento? Mas se nenhum desses fizer sentido ou você não pretende avaliar outros desfechos, apenas diga 'não se aplica'."
    },
    timeframe: {
      text: "Por quanto tempo você planeja acompanhar cada paciente? Se não houver acompanhamento (estudo transversal), por favor me diga.",
      context: "Durante toda a internação? Um período fixo (ex: primeiros 7 dias)? Ou há seguimento após alta hospitalar? Se for um estudo transversal (coleta em um único momento), sinta-se à vontade para dizer que não há seguimento."
    },
    studyDesign: {
      text: "Que tipo de desenho de estudo você pretende usar? Se ainda não definiu ou isso não faz sentido, me avise.",
      context: "Estudo randomizado controlado? Estudo observacional comparativo? Estudo antes e depois? Série de casos? Estudo transversal? Se nenhuma dessas opções fizer sentido ou você ainda não definiu, pode dizer 'ainda não sei' ou 'não se aplica'."
    }
  };
  
  // Priorizar perguntas baseadas no que falta
  if (identifiedElements.condition === 'comorbidade específica (a definir)') {
    return questions.condition;
  }
  
  // IMPORTANTE: Se já identificou que é transversal, NÃO perguntar sobre timeframe
  if (identifiedElements.studyDesign === 'transversal') {
    // Pular perguntas sobre seguimento/tempo
    if (identifiedElements.intervention && !identifiedElements.interventionDetails) {
      return questions.interventionDetails;
    }
    if (!identifiedElements.comparison) {
      return questions.comparisonDetails;
    }
    if (identifiedElements.outcome === 'redução do tempo de internação') {
      return questions.outcomeDetails;
    }
  }
  
  if (identifiedElements.intervention && !identifiedElements.interventionDetails) {
    return questions.interventionDetails;
  }
  
  if (identifiedElements.comparison && !identifiedElements.comparisonDetails) {
    return questions.comparisonDetails;
  }
  
  if (!identifiedElements.timeframe && identifiedElements.studyDesign !== 'transversal') {
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
    text: "Com base no que discutimos, já temos os elementos principais da sua pesquisa. Há algo mais que você gostaria de especificar? Se não, posso estruturar sua pergunta de pesquisa.",
    context: "Se não houver mais nada a adicionar ou se algum aspecto não fizer sentido para o seu estudo, apenas me diga e posso estruturar sua pergunta de pesquisa no formato mais adequado."
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
  
  // Detectar contradições
  const contradictions = detectContradictions(history, currentInput);
  const contradictionCount = getContradictionCount(history);
  
  if (contradictions.length > 0) {
    console.log('⚠️ CONTRADIÇÕES DETECTADAS:', contradictions);
    console.log('📊 Contador de contradições:', contradictionCount);
  }
  
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
  
  // Determinar próxima pergunta baseada no contexto e contradições
  const contextualNextQuestion = determineNextQuestion(allIdentifiedElements, history, contradictions);
  
  // Criar prompt mais inteligente
  const enhancedPrompt = `
CONTEXTO CRÍTICO DA CONVERSA:
- Interação número: ${currentStep + 1}
- Elementos JÁ IDENTIFICADOS: ${JSON.stringify(allIdentifiedElements, null, 2)}
${contradictions.length > 0 ? `
- ⚠️ CONTRADIÇÕES DETECTADAS: ${contradictions.join('; ')}
- Contador de tentativas de resolução: ${contradictionCount}/3` : ''}

HISTÓRICO DETALHADO:
${history.map((h, i) => `
INTERAÇÃO ${i + 1}:
Pergunta: "${h.question}"
Resposta: "${h.answer}"
${h.isDirectContradiction ? 'PERGUNTA DIRETA SOBRE CONTRADIÇÃO' : ''}
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
7. SEMPRE inclua "Se isso não fizer sentido para seu estudo, sinta-se à vontade para dizer" em TODAS as perguntas
8. Se detectar TRANSVERSAL, NUNCA sugira PICOT, sempre PICO
9. ${contradictions.length > 0 ? `RESOLVA A CONTRADIÇÃO PRIMEIRO com pergunta direta` : ''}
10. ${contradictionCount >= 3 ? 'APÓS 3 TENTATIVAS, ESCOLHA AUTOMATICAMENTE' : ''}

INSTRUÇÕES ESPECÍFICAS:
- Se o usuário já forneceu informações sobre musicoterapia e pacientes pediátricos, NÃO pergunte sobre isso novamente
- Foque em elementos faltantes como: especificação da comorbidade, detalhes da intervenção, desenho do estudo, período de seguimento
- Se já tem elementos suficientes (>70%), considere finalizar com canGenerateFinal: true
- Use as perguntas contextualizadas fornecidas acima como base
- SEMPRE ofereça a opção de "não faz sentido" ou "não se aplica"
- Se há contradição, marque hasContradiction: true e directContradictionCount: ${contradictionCount + (contradictions.length > 0 ? 1 : 0)}

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
- Finalize quando tiver ~70% dos elementos identificados
- SEMPRE inclua opção de "não faz sentido" em TODAS as perguntas
- DETECTE contradições e resolva com perguntas diretas
- Se for estudo TRANSVERSAL, NUNCA use PICOT`,
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
      
      // Adicionar informações de contradição se necessário
      if (contradictions.length > 0 && !parsedContent.analysis?.hasContradiction) {
        parsedContent.analysis = {
          ...parsedContent.analysis,
          hasContradiction: true,
          directContradictionCount: contradictionCount + (contextualNextQuestion.isDirectContradiction ? 1 : 0)
        };
      }
      
      // Se está lidando com contradição, usar a pergunta contextual
      if (contradictions.length > 0 && contextualNextQuestion.isDirectContradiction) {
        parsedContent.nextQuestion = contextualNextQuestion;
        // Marcar no histórico que é pergunta sobre contradição
        parsedContent.nextQuestion.isDirectContradiction = true;
      }
      
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
        
        // GARANTIR que TODAS as perguntas tenham a opção "não faz sentido"
        if (!parsedContent.nextQuestion.text.includes('não faz sentido') && 
            !parsedContent.nextQuestion.text.includes('não se aplica')) {
          parsedContent.nextQuestion.text += ' Se isso não fizer sentido para seu estudo, sinta-se à vontade para dizer que não se aplica.';
        }
        if (parsedContent.nextQuestion.context && 
            !parsedContent.nextQuestion.context.includes('não faz sentido') && 
            !parsedContent.nextQuestion.context.includes('não se aplica')) {
          parsedContent.nextQuestion.context += ' Mas se nenhuma dessas opções fizer sentido para o seu caso, apenas me avise que não se aplica.';
        }
      }
      
      // Se tem muitos elementos identificados, considerar finalização
      const identifiedCount = Object.values(allIdentifiedElements).filter(v => v !== null).length;
      if (identifiedCount >= 5 && !parsedContent.canGenerateFinal) {
        console.log('✅ Elementos suficientes identificados. Sugerindo finalização...');
        parsedContent.canGenerateFinal = true;
      }
      
      // VALIDAÇÃO CRÍTICA: Se é transversal, garantir que não seja PICOT
      if (allIdentifiedElements.studyDesign === 'transversal' && 
          parsedContent.finalResult?.format === 'PICOT') {
        console.error('⚠️ ERRO: Tentando usar PICOT para estudo transversal. Corrigindo para PICO...');
        parsedContent.finalResult.format = 'PICO';
        // Remover elemento T dos elementos
        if (parsedContent.finalResult.elements?.explicit?.T) {
          delete parsedContent.finalResult.elements.explicit.T;
        }
        if (parsedContent.finalResult.elements?.implicit?.T) {
          delete parsedContent.finalResult.elements.implicit.T;
        }
      }
      
      // Normalizar elementos do framework
      parsedContent = normalizeFrameworkElements(parsedContent);
      
      // Log final
      console.log('✅ Próxima pergunta:', parsedContent.nextQuestion?.text);
      console.log('📊 Pode finalizar?', parsedContent.canGenerateFinal);
      console.log('⚠️ Tem contradição?', parsedContent.analysis?.hasContradiction);
      
      // Adicionar flag de contradição direta ao histórico se necessário
      if (parsedContent.nextQuestion?.isDirectContradiction) {
        // Esta informação será usada no próximo ciclo
        console.log('📝 Marcando pergunta como direta sobre contradição');
      }
      
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