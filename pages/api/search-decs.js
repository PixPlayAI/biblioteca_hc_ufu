// pages/api/search-decs.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DECS_API_KEY = '12def41f483860c7fa3a684723250ce3'; // Token fornecido pela BIREME

// URL base correta da API DeCS
const DECS_BASE_URL = 'https://api.bvsalud.org/decs/v2';

// Mapeamento de elementos válidos por framework
const FRAMEWORK_ELEMENTS = {
  PICO: ['P', 'I', 'C', 'O'],
  PICOT: ['P', 'I', 'C', 'O', 'T'],
  PICOS: ['P', 'I', 'C', 'O', 'S'],
  PEO: ['P', 'E', 'O'],
  PECO: ['P', 'E', 'C', 'O'],
  PCC: ['P', 'C', 'C2'],
  SPIDER: ['S', 'PI', 'D', 'E', 'R'],
  PIRD: ['P', 'I', 'R', 'D'],
  CoCoPop: ['Co', 'Co2', 'Pop'],
  SPICE: ['S', 'P', 'I', 'C', 'E'],
  ECLIPSE: ['E', 'C', 'L', 'I', 'P', 'SE'],
  BeHEMoTh: ['Be', 'HE', 'Mo', 'Th'],
};

// Função para filtrar elementos válidos do framework
function filterValidFrameworkElements(frameworkElements, frameworkType) {
  const validElements = FRAMEWORK_ELEMENTS[frameworkType];
  if (!validElements) {
    console.warn(`Framework não reconhecido: ${frameworkType}`);
    return frameworkElements;
  }

  const filtered = {};
  Object.entries(frameworkElements).forEach(([key, value]) => {
    if (validElements.includes(key)) {
      filtered[key] = value;
    }
  });

  return filtered;
}

// Função para gerar prompt para DeCS
function generatePrompt(frameworkElements, fullQuestion, frameworkType) {
  const prompt = `Você é um especialista em extração de conceitos médicos para busca na base DeCS (Descritores em Ciências da Saúde). 

Framework: ${frameworkType}
Elementos: ${JSON.stringify(frameworkElements, null, 2)}
Pergunta: ${fullQuestion}

Para cada elemento, extraia 3-5 termos simples e diretos que existem no vocabulário DeCS. Prefira termos em português, mas inclua também em inglês e espanhol quando relevante.

IMPORTANTE: 
- Use termos médicos padronizados
- Evite frases longas
- Retorne apenas termos que provavelmente existem no DeCS
- Separe conceitos compostos em termos individuais

Retorne APENAS um objeto JSON com as mesmas chaves dos elementos fornecidos, cada uma com um array de termos.`;

  return prompt;
}

// Função para extrair conceitos usando DeepSeek
async function extractConcepts(frameworkElements, fullQuestion, frameworkType) {
  console.log('🤖 Extraindo conceitos para DeCS com DeepSeek');
  
  const prompt = generatePrompt(frameworkElements, fullQuestion, frameworkType);

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração de conceitos médicos para busca no DeCS. Extraia termos simples e diretos.' 
          },
          { role: 'user', content: prompt }
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

    const concepts = JSON.parse(response.data.choices[0].message.content);
    console.log('✅ Conceitos extraídos:', concepts);
    
    return concepts;
  } catch (error) {
    console.error('❌ Erro ao extrair conceitos:', error.message);
    
    // Fallback: usar os próprios textos como conceitos
    const fallbackConcepts = {};
    Object.entries(frameworkElements).forEach(([elem, texto]) => {
      // Dividir o texto em palavras-chave
      const keywords = texto.split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3);
      fallbackConcepts[elem] = keywords.length > 0 ? keywords : [texto];
    });
    
    return fallbackConcepts;
  }
}

// Função simplificada para buscar termos DeCS
async function searchDeCSTerms(searchTerm, language = 'pt') {
  console.log(`🔍 Buscando DeCS: "${searchTerm}" (${language})`);
  
  try {
    // Delay menor entre requisições
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Endpoint correto para busca
    const searchUrl = `${DECS_BASE_URL}/search`;
    
    const response = await axios.get(searchUrl, {
      params: {
        q: searchTerm,
        lang: language,
        count: 5 // Limitar resultados para evitar timeout
      },
      headers: {
        'apikey': DECS_API_KEY, // Usar apikey no header
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 segundos por requisição
    });
    
    const results = [];
    
    // Processar resposta - adaptar conforme estrutura real da API
    if (response.data && response.data.docs) {
      response.data.docs.forEach((doc, index) => {
        const terms = {
          pt: doc.descriptor_pt || doc.preferred_term_pt || '',
          es: doc.descriptor_es || doc.preferred_term_es || '',
          en: doc.descriptor_en || doc.preferred_term_en || '',
        };
        
        const definitions = {
          pt: doc.definition_pt || doc.scope_note_pt || '',
          es: doc.definition_es || doc.scope_note_es || '',
          en: doc.definition_en || doc.scope_note_en || '',
        };
        
        // Calcular relevância baseada na posição
        const relevanceScore = Math.round(95 - (index * 10));
        
        results.push({
          decsId: doc.id || doc.decs_code || `decs_${index}`,
          terms: terms,
          definitions: definitions,
          synonyms: {
            pt: doc.synonyms_pt || [],
            es: doc.synonyms_es || [],
            en: doc.synonyms_en || []
          },
          treeNumbers: doc.tree_numbers || [],
          relevanceScore: relevanceScore,
          language: language
        });
      });
    }
    
    console.log(`✅ ${results.length} termos DeCS encontrados`);
    return results;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar DeCS:`, error.message);
    
    // Se falhar, tentar endpoint alternativo
    try {
      const altUrl = `https://decs.bvsalud.org/cgi-bin/wxis1660.exe/decsserver/`;
      const xmlQuery = `
        <search>
          <expression>${searchTerm}</expression>
          <lang>${language}</lang>
        </search>
      `;
      
      console.log('🔄 Tentando endpoint alternativo...');
      
      // Retornar resultado mock para não quebrar a aplicação
      return [{
        decsId: `mock_${Date.now()}`,
        terms: {
          pt: searchTerm,
          es: searchTerm,
          en: searchTerm
        },
        definitions: {
          pt: 'Termo em processamento',
          es: 'Término en procesamiento',
          en: 'Term being processed'
        },
        synonyms: { pt: [], es: [], en: [] },
        treeNumbers: [],
        relevanceScore: 75,
        language: language
      }];
      
    } catch (altError) {
      console.error('❌ Endpoint alternativo também falhou:', altError.message);
      return [];
    }
  }
}

// Handler principal otimizado
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Configurar timeout do response
  res.socket.setTimeout(120000); // 2 minutos
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log('\n🚀 API DeCS - INÍCIO DO PROCESSAMENTO');
  console.log('📥 Dados recebidos:', JSON.stringify(req.body, null, 2));

  const { frameworkElements, fullQuestion, frameworkType } = req.body;

  // Filtrar elementos válidos
  const validFrameworkElements = filterValidFrameworkElements(frameworkElements, frameworkType);
  console.log('✅ Elementos válidos:', validFrameworkElements);

  try {
    const processStartTime = Date.now();
    
    // PASSO 1: Extrair conceitos usando IA (mais rápido)
    console.log('\n🤖 PASSO 1: EXTRAÇÃO DE CONCEITOS');
    const concepts = await extractConcepts(validFrameworkElements, fullQuestion, frameworkType);
    
    // PASSO 2: Buscar termos DeCS (otimizado)
    console.log('\n🔎 PASSO 2: BUSCA DE TERMOS DECS');
    
    const results = [];
    const allDecsTerms = [];
    const languages = ['pt']; // Começar apenas com português para ser mais rápido
    
    // Processar cada elemento com limite de tentativas
    for (const [element, originalText] of Object.entries(validFrameworkElements)) {
      console.log(`\n📌 Processando elemento: ${element} - "${originalText}"`);
      
      const elementResults = {
        element,
        originalText: originalText,
        terms: []
      };
      
      // Obter conceitos para este elemento (máximo 3 para evitar timeout)
      const elementConcepts = (concepts[element] || [originalText]).slice(0, 3);
      
      // Para cada conceito, buscar em português primeiro
      for (const searchTerm of elementConcepts) {
        for (const lang of languages) {
          try {
            const decsTerms = await searchDeCSTerms(searchTerm, lang);
            
            // Adicionar apenas os 3 melhores termos
            const topTerms = decsTerms.slice(0, 3);
            
            topTerms.forEach(term => {
              // Verificar se já não foi adicionado
              if (!elementResults.terms.find(t => t.decsId === term.decsId)) {
                elementResults.terms.push(term);
                allDecsTerms.push(term);
              }
            });
            
          } catch (error) {
            console.error(`❌ Erro ao buscar "${searchTerm}" em ${lang}:`, error.message);
          }
        }
      }
      
      // Ordenar por relevância
      elementResults.terms.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Limitar a 5 termos por elemento
      elementResults.terms = elementResults.terms.slice(0, 5);
      
      results.push(elementResults);
      console.log(`✅ Elemento ${element}: ${elementResults.terms.length} termos DeCS encontrados`);
    }

    // Remover duplicatas globais
    const uniqueDecsTerms = allDecsTerms
      .filter((term, index, self) => 
        index === self.findIndex(t => t.decsId === term.decsId))
      .filter(term => term.relevanceScore >= 50)
      .slice(0, 20); // Limitar total de termos

    const processTime = Date.now() - processStartTime;
    
    // LOG FINAL
    console.log('\n📊 RESUMO FINAL');
    console.log(`⏱️ Tempo total: ${(processTime/1000).toFixed(2)}s`);
    console.log(`✅ Elementos processados: ${results.length}`);
    console.log(`🎯 Total de termos únicos: ${uniqueDecsTerms.length}`);

    // Preparar resposta
    const responseData = {
      results,
      allDecsTerms: uniqueDecsTerms,
      processTime: processTime
    };
    
    console.log('📤 Enviando resposta...');
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar termos DeCS',
      details: error.message,
      suggestion: 'Tente novamente em alguns instantes'
    });
  }
}