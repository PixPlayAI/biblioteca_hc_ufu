// pages/api/intelligent-search.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Configurar timeout máximo permitido pela Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60, // Máximo permitido pela Vercel no plano Pro
};

// Função simplificada para gerar o prompt
function generateIntelligentSearchPrompt(userInput) {
  return `Analise este texto de pesquisa e extraia elementos para busca MeSH/DeCS.

TEXTO: "${userInput}"

Identifique o framework (PICO, PEO, etc.) e retorne um JSON simples:
{
  "detectedFramework": "PICO",
  "confidence": 0.8,
  "elements": {
    "P": {
      "description": "população/pacientes",
      "concepts": ["termo1", "termo2"]
    }
  },
  "analysis": "resumo da análise"
}

Use APENAS as siglas corretas de cada framework. Seja BREVE e DIRETO.`;
}

// Função otimizada para processar a busca
async function processIntelligentSearch(userInput) {
  try {
    console.log('🤖 Iniciando análise rápida...');
    
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Responda APENAS com JSON válido. Seja extremamente conciso.'
          },
          {
            role: 'user',
            content: generateIntelligentSearchPrompt(userInput)
          }
        ],
        temperature: 0.1,
        max_tokens: 1000, // Reduzido para resposta mais rápida
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000 // 25 segundos para deixar margem
      }
    );

    const content = response.data.choices[0].message.content;
    let analysisResult = JSON.parse(content);
    
    // Garantir estrutura mínima
    if (!analysisResult.detectedFramework) {
      analysisResult.detectedFramework = 'PICO';
    }
    if (!analysisResult.elements || Object.keys(analysisResult.elements).length === 0) {
      analysisResult.elements = {
        P: {
          description: userInput,
          concepts: [userInput]
        }
      };
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    // Retorno mínimo em caso de erro
    return {
      detectedFramework: 'PICO',
      confidence: 0.5,
      elements: {
        P: {
          description: userInput,
          concepts: [userInput]
        }
      },
      analysis: userInput
    };
  }
}

// Handler principal otimizado
export default async function handler(req, res) {
  // Configurar timeout da response
  if (res.socket) {
    res.socket.setTimeout(59000); // 59 segundos
  }
  
  // Configurar headers
  res.setHeader('Content-Type', 'application/json');
  
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
    console.log('🚀 Processamento rápido iniciado');
    
    // Processar com timeout controlado
    const analysisPromise = processIntelligentSearch(userInput);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 50000) // 50 segundos
    );
    
    const analysisResult = await Promise.race([analysisPromise, timeoutPromise]);
    
    // Preparar dados mínimos
    const descriptorData = {
      frameworkElements: {},
      fullQuestion: analysisResult.analysis || userInput,
      frameworkType: analysisResult.detectedFramework || 'PICO'
    };
    
    // Converter elementos
    if (analysisResult.elements) {
      Object.entries(analysisResult.elements).forEach(([key, value]) => {
        descriptorData.frameworkElements[key] = value.description || value.concepts?.[0] || '';
      });
    }
    
    // Garantir pelo menos um elemento
    if (Object.keys(descriptorData.frameworkElements).length === 0) {
      descriptorData.frameworkElements.P = userInput;
    }
    
    const response = {
      success: true,
      analysis: analysisResult,
      descriptorData: descriptorData,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Resposta enviada');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    // Resposta de fallback
    const fallbackResponse = {
      success: true,
      analysis: {
        detectedFramework: 'PICO',
        confidence: 0.5,
        elements: {
          P: {
            description: userInput,
            concepts: [userInput]
          }
        },
        analysis: userInput
      },
      descriptorData: {
        frameworkElements: { P: userInput },
        fullQuestion: userInput,
        frameworkType: 'PICO'
      },
      timestamp: new Date().toISOString()
    };
    
    return res.status(200).json(fallbackResponse);
  }
}