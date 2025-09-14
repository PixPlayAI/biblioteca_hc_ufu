// pages/api/intelligent-search.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60,
};

function generateSimplePrompt(userInput) {
  return `Analise este texto de pesquisa em saúde e extraia os conceitos principais para busca em bases de dados médicas.

TEXTO: "${userInput}"

TAREFA:
1. Identifique os conceitos médicos e científicos principais
2. Traduza cada conceito para inglês científico apropriado
3. Para cada conceito, forneça sinônimos e termos relacionados em inglês

REGRAS:
- Extraia entre 3 a 8 conceitos principais
- Use terminologia médica padrão em inglês
- Inclua variações e sinônimos quando relevante
- Separe conceitos compostos quando apropriado
- Foque em termos que provavelmente existem em vocabulários controlados médicos

Retorne um JSON simples no formato:
{
  "concepts": [
    {
      "original": "termo original em português",
      "english": "termo em inglês",
      "synonyms": ["sinônimo1", "sinônimo2"],
      "related": ["termo relacionado1", "termo relacionado2"]
    }
  ],
  "summary": "breve resumo do que o pesquisador está buscando"
}`;
}

async function processIntelligentSearch(userInput) {
  try {
    console.log('🤖 Iniciando análise e tradução de conceitos...');
    
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em terminologia médica e científica. Extraia e traduza conceitos de forma precisa e objetiva. Responda APENAS com JSON válido.'
          },
          {
            role: 'user',
            content: generateSimplePrompt(userInput)
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 58000
      }
    );

    const content = response.data.choices[0].message.content;
    let analysisResult = JSON.parse(content);
    
    if (!analysisResult.concepts || analysisResult.concepts.length === 0) {
      analysisResult.concepts = [{
        original: userInput,
        english: userInput,
        synonyms: [],
        related: []
      }];
    }
    
    if (!analysisResult.summary) {
      analysisResult.summary = userInput;
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    return {
      concepts: [{
        original: userInput,
        english: userInput,
        synonyms: [],
        related: []
      }],
      summary: userInput
    };
  }
}

export default async function handler(req, res) {
  // Configurar timeout
  if (res.socket) {
    res.socket.setTimeout(59000);
  }
  
  // Configurar CORS se necessário
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Verificar método
  if (req.method !== 'POST') {
    console.log('❌ Método não permitido:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: 'Esta API aceita apenas requisições POST',
      receivedMethod: req.method 
    });
  }

  try {
    const { userInput } = req.body;

    if (!userInput || typeof userInput !== 'string' || userInput.trim() === '') {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'userInput é obrigatório e deve ser uma string não vazia' 
      });
    }

    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY não configurada');
      return res.status(500).json({ 
        error: 'Configuration Error',
        message: 'API key não configurada no servidor' 
      });
    }

    console.log('🚀 Processamento iniciado para:', userInput.substring(0, 50) + '...');
    
    const analysisResult = await processIntelligentSearch(userInput);
    
    const searchTerms = [];
    
    analysisResult.concepts.forEach(concept => {
      if (concept.english) searchTerms.push(concept.english);
      if (concept.synonyms && Array.isArray(concept.synonyms)) {
        searchTerms.push(...concept.synonyms.slice(0, 2));
      }
      if (concept.related && Array.isArray(concept.related)) {
        searchTerms.push(...concept.related.slice(0, 1));
      }
    });
    
    const uniqueSearchTerms = [...new Set(searchTerms.filter(term => term && term.trim()))];
    
    const response = {
      success: true,
      analysis: analysisResult,
      searchTerms: uniqueSearchTerms,
      originalText: userInput,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Resposta preparada com', uniqueSearchTerms.length, 'termos de busca');
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erro geral no handler:', error);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao processar a requisição',
      details: error.message
    });
  }
}