// pages/api/intelligent-search.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Função para gerar o prompt especializado para busca inteligente
function generateIntelligentSearchPrompt(userInput) {
  return `Você é um especialista em pesquisa científica na área da saúde. Analise o texto fornecido pelo pesquisador e extraia os conceitos-chave para busca de descritores MeSH e DeCS.

TEXTO DO PESQUISADOR:
"${userInput}"

TAREFA:
1. Identifique o framework de pesquisa mais adequado (PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER, PIRD, CoCoPop, SPICE, ECLIPSE, BeHEMoTh, ou sem sigla)
2. Extraia e organize os elementos principais da pesquisa
3. Para cada elemento, forneça conceitos em português E inglês
4. Seja específico e use terminologia médica apropriada

IMPORTANTE:
- Se o texto já estiver bem estruturado, mantenha a estrutura
- Se o texto for informal, organize-o adequadamente
- Sempre forneça alternativas e sinônimos
- Considere variações regionais de termos médicos
- Use as siglas corretas para cada framework (P, I, C, O para PICO; P, E, O para PEO, etc.)

Retorne APENAS um objeto JSON no seguinte formato:
{
  "detectedFramework": "PICO/PICOT/PICOS/PEO/PECO/PCC/SPIDER/PIRD/CoCoPop/SPICE/ECLIPSE/BeHEMoTh/sem sigla",
  "confidence": 0.8,
  "elements": {
    "P": {
      "description": "descrição em português do elemento",
      "concepts": ["conceito1", "conceito2", "conceito3"],
      "englishConcepts": ["concept1", "concept2", "concept3"]
    },
    "I": {
      "description": "descrição em português do elemento",
      "concepts": ["conceito1", "conceito2"],
      "englishConcepts": ["concept1", "concept2"]
    }
  },
  "searchStrategy": {
    "primaryTerms": ["termo1", "termo2"],
    "secondaryTerms": ["termo3", "termo4"],
    "suggestedDatabases": ["PubMed", "BVS", "Cochrane"]
  },
  "analysis": "Breve análise do que foi identificado na pesquisa"
}

IMPORTANTE: Use APENAS as siglas válidas para cada framework. Por exemplo:
- PICO: P, I, C, O
- PEO: P, E, O  
- PECO: P, E, C, O
- Etc.`;
}

// Função para processar a busca inteligente
async function processIntelligentSearch(userInput) {
  try {
    console.log('🤖 Analisando texto com IA...');
    
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em metodologia de pesquisa em saúde. Analise textos e extraia elementos estruturados para busca bibliográfica. SEMPRE retorne um JSON válido com todos os campos obrigatórios.'
          },
          {
            role: 'user',
            content: generateIntelligentSearchPrompt(userInput)
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('📥 Resposta da IA:', content);
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta da IA:', parseError);
      // Criar uma resposta padrão se falhar
      analysisResult = {
        detectedFramework: 'PICO',
        confidence: 0.5,
        elements: {
          P: {
            description: userInput,
            concepts: [userInput],
            englishConcepts: [userInput]
          }
        },
        searchStrategy: {
          primaryTerms: [userInput],
          secondaryTerms: [],
          suggestedDatabases: ['PubMed', 'BVS']
        },
        analysis: 'Análise automática do texto fornecido'
      };
    }
    
    // Validar e corrigir a estrutura se necessário
    if (!analysisResult.detectedFramework) {
      analysisResult.detectedFramework = 'PICO';
    }
    if (!analysisResult.confidence) {
      analysisResult.confidence = 0.8;
    }
    if (!analysisResult.elements || Object.keys(analysisResult.elements).length === 0) {
      analysisResult.elements = {
        P: {
          description: userInput,
          concepts: [userInput],
          englishConcepts: [userInput]
        }
      };
    }
    if (!analysisResult.analysis) {
      analysisResult.analysis = userInput;
    }
    
    // Garantir que cada elemento tem a estrutura correta
    Object.keys(analysisResult.elements).forEach(key => {
      const element = analysisResult.elements[key];
      if (!element.description) {
        element.description = userInput;
      }
      if (!element.concepts || element.concepts.length === 0) {
        element.concepts = [element.description];
      }
      if (!element.englishConcepts || element.englishConcepts.length === 0) {
        element.englishConcepts = element.concepts;
      }
    });
    
    console.log('✅ Análise processada:', JSON.stringify(analysisResult, null, 2));
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Erro na análise inteligente:', error);
    // Retornar uma análise básica em caso de erro
    return {
      detectedFramework: 'PICO',
      confidence: 0.5,
      elements: {
        P: {
          description: userInput,
          concepts: [userInput],
          englishConcepts: [userInput]
        }
      },
      searchStrategy: {
        primaryTerms: [userInput],
        secondaryTerms: [],
        suggestedDatabases: ['PubMed', 'BVS']
      },
      analysis: userInput
    };
  }
}

// Função para preparar dados para busca de descritores
function prepareDescriptorData(analysisResult) {
  const frameworkElements = {};
  
  // Converter elementos para formato esperado pelos endpoints de busca
  // IMPORTANTE: usar apenas as siglas, não os nomes completos
  Object.entries(analysisResult.elements).forEach(([key, value]) => {
    // Garantir que usamos a descrição correta
    frameworkElements[key] = value.description || value.concepts?.[0] || '';
  });
  
  console.log('📦 Dados preparados para descritores:', {
    frameworkElements,
    fullQuestion: analysisResult.analysis,
    frameworkType: analysisResult.detectedFramework
  });
  
  return {
    frameworkElements,
    fullQuestion: analysisResult.analysis || '',
    frameworkType: analysisResult.detectedFramework || 'PICO'
  };
}

// Handler principal da API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'userInput é obrigatório' });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API key não configurada' });
  }

  try {
    console.log('\n🚀 BUSCA INTELIGENTE - INÍCIO');
    console.log('📝 Input do usuário:', userInput);
    
    // Fazer a análise inteligente
    const analysisResult = await processIntelligentSearch(userInput);
    
    // Preparar dados para busca de descritores
    const descriptorData = prepareDescriptorData(analysisResult);
    
    // Validar dados antes de enviar
    if (!descriptorData.frameworkElements || Object.keys(descriptorData.frameworkElements).length === 0) {
      console.error('❌ Nenhum elemento extraído');
      return res.status(400).json({
        error: 'Não foi possível extrair elementos da pesquisa',
        details: 'Tente reformular sua pergunta de pesquisa'
      });
    }
    
    // Retornar resposta
    const response = {
      success: true,
      analysis: analysisResult,
      descriptorData: descriptorData,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ BUSCA INTELIGENTE - ANÁLISE CONCLUÍDA');
    console.log('📤 Resposta final:', JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Erro geral na busca inteligente:', error);
    res.status(500).json({
      error: 'Erro ao processar busca inteligente',
      details: error.message
    });
  }
}