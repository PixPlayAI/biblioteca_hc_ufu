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
  maxDuration: 60,
};

// Função simplificada para gerar o prompt
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

// Função para processar a busca inteligente
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
        timeout: 25000
      }
    );

    const content = response.data.choices[0].message.content;
    let analysisResult = JSON.parse(content);
    
    // Garantir estrutura mínima
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
    // Retorno mínimo em caso de erro
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

// Handler principal
export default async function handler(req, res) {
  // Configurar timeout da response
  if (res.socket) {
    res.socket.setTimeout(59000);
  }
  
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
    console.log('🚀 Processamento iniciado');
    
    // Processar com timeout controlado
    const analysisPromise = processIntelligentSearch(userInput);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 50000)
    );
    
    const analysisResult = await Promise.race([analysisPromise, timeoutPromise]);
    
    // Preparar dados para busca nas APIs
    const searchTerms = [];
    
    // Adicionar todos os termos em inglês e sinônimos
    analysisResult.concepts.forEach(concept => {
      searchTerms.push(concept.english);
      if (concept.synonyms && concept.synonyms.length > 0) {
        searchTerms.push(...concept.synonyms.slice(0, 2)); // Limitar sinônimos
      }
      if (concept.related && concept.related.length > 0) {
        searchTerms.push(...concept.related.slice(0, 1)); // Limitar relacionados
      }
    });
    
    // Remover duplicatas
    const uniqueSearchTerms = [...new Set(searchTerms)];
    
    const response = {
      success: true,
      analysis: analysisResult,
      searchTerms: uniqueSearchTerms,
      originalText: userInput,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Resposta preparada com', uniqueSearchTerms.length, 'termos de busca');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    
    // Resposta de fallback
    const fallbackResponse = {
      success: true,
      analysis: {
        concepts: [{
          original: userInput,
          english: userInput,
          synonyms: [],
          related: []
        }],
        summary: userInput
      },
      searchTerms: [userInput],
      originalText: userInput,
      timestamp: new Date().toISOString()
    };
    
    return res.status(200).json(fallbackResponse);
  }
}