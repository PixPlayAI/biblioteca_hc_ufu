// pages/api/intelligent-search.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Função para gerar o prompt especializado para busca inteligente
function generateIntelligentSearchPrompt(userInput) {
  return `Você é um especialista em pesquisa científica na área da saúde. Analise o texto fornecido pelo pesquisador e extraia os conceitos-chave para busca de descritores MeSH e DeCS.

TEXTO DO PESQUISADOR:
"${userInput}"

TAREFA:
1. Identifique o framework de pesquisa mais adequado (PICO, PICOT, PICOS, PEO, etc.)
2. Extraia e organize os elementos principais da pesquisa
3. Para cada elemento, forneça conceitos em português E inglês
4. Seja específico e use terminologia médica apropriada

IMPORTANTE:
- Se o texto já estiver bem estruturado, mantenha a estrutura
- Se o texto for informal, organize-o adequadamente
- Sempre forneça alternativas e sinônimos
- Considere variações regionais de termos médicos

Retorne APENAS um objeto JSON no seguinte formato:
{
  "detectedFramework": "PICO/PICOT/PICOS/etc",
  "confidence": 0.0-1.0,
  "elements": {
    "P": {
      "description": "descrição em português",
      "concepts": ["conceito1", "conceito2"],
      "englishConcepts": ["concept1", "concept2"]
    },
    "I": { ... },
    // outros elementos conforme o framework
  },
  "searchStrategy": {
    "primaryTerms": ["termo1", "termo2"],
    "secondaryTerms": ["termo3", "termo4"],
    "suggestedDatabases": ["PubMed", "BVS", "Cochrane"]
  },
  "analysis": "Breve análise do que foi identificado"
}`;
}

// Função para processar a busca inteligente (simplificada)
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
            content: 'Você é um especialista em metodologia de pesquisa em saúde. Analise textos e extraia elementos estruturados para busca bibliográfica.'
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
        timeout: 8000 // 8 segundos apenas para análise
      }
    );

    const analysisResult = JSON.parse(response.data.choices[0].message.content);
    console.log('✅ Análise concluída:', analysisResult);
    
    return analysisResult;
  } catch (error) {
    console.error('❌ Erro na análise inteligente:', error);
    throw error;
  }
}

// Função para preparar dados para busca de descritores
function prepareDescriptorData(analysisResult) {
  const frameworkElements = {};
  
  // Converter elementos para formato esperado pelos endpoints de busca
  Object.entries(analysisResult.elements).forEach(([key, value]) => {
    frameworkElements[key] = value.description;
  });
  
  return {
    frameworkElements,
    fullQuestion: analysisResult.analysis,
    frameworkType: analysisResult.detectedFramework
  };
}

// Handler principal da API (simplificado)
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
    
    // Fazer APENAS a análise inteligente (não buscar descritores aqui)
    const analysisResult = await processIntelligentSearch(userInput);
    
    // Preparar dados para busca de descritores (será usado no frontend)
    const descriptorData = prepareDescriptorData(analysisResult);
    
    // Retornar resposta rápida com análise e dados preparados
    const response = {
      success: true,
      analysis: analysisResult,
      descriptorData: descriptorData,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ BUSCA INTELIGENTE - ANÁLISE CONCLUÍDA');
    
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Erro geral na busca inteligente:', error);
    res.status(500).json({
      error: 'Erro ao processar busca inteligente',
      details: error.message
    });
  }
}