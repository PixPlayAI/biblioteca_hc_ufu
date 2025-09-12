// pages/api/search-decs.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DECS_API_KEY = process.env.DECS_API_KEY;
const DECS_BASE_URL = 'https://api.bvsalud.org/decs/v2';

// Mapeamento de elementos válidos por framework (mesmo do MeSH)
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

// Função para gerar prompt similar ao MeSH mas adaptado para DeCS
function generatePrompt(frameworkElements, fullQuestion, frameworkType) {
  const frameworkDefinitions = {
    PICO: `PICO - Framework para questões clínicas:
- P (População/Paciente): População específica ou pacientes
- I (Intervenção): Tratamento, terapia ou procedimento
- C (Comparação): Grupo controle ou tratamento alternativo
- O (Desfecho): Resultado clínico mensurável`,
    
    PICOT: `PICOT - PICO com elemento temporal:
- P (População/Paciente): População específica
- I (Intervenção): Intervenção terapêutica
- C (Comparação): Comparador ou controle
- O (Desfecho): Desfecho mensurável
- T (Tempo): Período de acompanhamento`,
    
    PICOS: `PICOS - PICO com desenho do estudo:
- P (População/Paciente): População do estudo
- I (Intervenção): Intervenção avaliada
- C (Comparação): Comparador
- O (Desfecho): Desfecho
- S (Desenho do Estudo): Tipo de estudo`,
    
    PEO: `PEO - Framework para estudos observacionais:
- P (População): População exposta
- E (Exposição): Exposição natural/ocupacional
- O (Desfecho): Desfecho observado`,
    
    PECO: `PECO - PEO com comparação:
- P (População): População do estudo
- E (Exposição): Exposição ambiental
- C (Comparação): Grupo não exposto
- O (Desfecho): Desfecho observado`,
    
    PCC: `PCC - Framework para revisões de escopo:
- P (População): População de interesse
- C (Conceito): Conceito central explorado
- C2 (Contexto): Contexto geográfico/cultural`,
    
    SPIDER: `SPIDER - Framework para pesquisa qualitativa:
- S (Amostra): Amostra do estudo
- PI (Fenômeno de Interesse): Experiência estudada
- D (Design): Método qualitativo
- E (Avaliação): O que está sendo avaliado
- R (Tipo de Pesquisa): Tipo de pesquisa qualitativa`,
    
    PIRD: `PIRD - Framework para estudos diagnósticos:
- P (População): População com suspeita diagnóstica
- I (Teste Índice): Novo teste diagnóstico
- R (Teste de Referência): Teste padrão-ouro
- D (Diagnóstico): Condição diagnosticada`,
    
    CoCoPop: `CoCoPop - Framework para estudos de prevalência:
- Co (Condição): Doença/condição de saúde
- Co2 (Contexto): Contexto temporal/geográfico
- Pop (População): População estudada`,
    
    SPICE: `SPICE - Framework para avaliação de serviços:
- S (Ambiente): Local do serviço de saúde
- P (Perspectiva): Perspectiva dos usuários
- I (Intervenção): Mudança no serviço
- C (Comparação): Prática atual
- E (Avaliação): Indicadores de qualidade`,
    
    ECLIPSE: `ECLIPSE - Framework para políticas de saúde:
- E (Expectativa): Objetivo da política
- C (Grupo de Clientes): Grupo beneficiário
- L (Local): Local de implementação
- I (Impacto): Impacto esperado
- P (Profissionais): Profissionais envolvidos
- SE (Serviço): Tipo de serviço`,
    
    BeHEMoTh: `BeHEMoTh - Framework para comportamento em saúde:
- Be (Comportamento): Comportamento de saúde
- HE (Contexto de Saúde): Contexto/ambiente
- Mo (Exclusões): Exclusões metodológicas
- Th (Teorias): Teorias comportamentais`
  };

  const prompt = `Você é um especialista em extração de conceitos médicos para busca na base DeCS (Descritores em Ciências da Saúde). Sua tarefa é analisar elementos de frameworks de pesquisa e extrair conceitos que existem no vocabulário DeCS.

🎯 FRAMEWORK ATUAL: ${frameworkType}

📚 DEFINIÇÃO DOS ELEMENTOS:
${frameworkDefinitions[frameworkType] || 'Framework não definido'}

⚠️ REGRAS CRÍTICAS:
1. Cada conceito DEVE estar DIRETAMENTE relacionado ao elemento específico
2. NÃO misturar conceitos entre elementos diferentes
3. Preferir termos simples e diretos
4. Incluir conceitos em português, espanhol e inglês quando possível
5. Retornar 5-7 conceitos por elemento

🎯 ELEMENTOS A PROCESSAR:
${JSON.stringify(frameworkElements, null, 2)}

📝 PERGUNTA COMPLETA PARA CONTEXTO:
${fullQuestion}

RETORNE APENAS um objeto JSON com:
- As MESMAS chaves fornecidas em frameworkElements
- Cada chave com array de 5-7 termos relevantes
- Termos em português, inglês e espanhol quando possível
- Conceitos DIRETAMENTE relacionados ao elemento

RETORNE APENAS O JSON, SEM EXPLICAÇÕES.`;

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
            content: 'Você é um especialista em extração de conceitos médicos para busca no DeCS. Extraia termos simples e diretos em português, inglês e espanhol quando possível.' 
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
        timeout: 59000
      }
    );

    const concepts = JSON.parse(response.data.choices[0].message.content);
    console.log('✅ Conceitos extraídos:', concepts);
    
    return concepts;
  } catch (error) {
    console.error('❌ Erro ao extrair conceitos:', error);
    
    // Fallback: usar os próprios textos como conceitos
    const fallbackConcepts = {};
    Object.entries(frameworkElements).forEach(([elem, texto]) => {
      fallbackConcepts[elem] = [texto];
    });
    
    return fallbackConcepts;
  }
}

// Função para buscar termos DeCS
async function searchDeCSTerms(searchTerm, language = 'pt') {
  console.log(`🔍 Buscando DeCS: "${searchTerm}" (${language})`);
  
  try {
    // Delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Busca por palavras
    const searchUrl = `${DECS_BASE_URL}/search-by-words`;
    const searchParams = {
      words: searchTerm,
      lang: language,
      format: 'json'
    };
    
    console.log(`📡 Chamando API DeCS...`);
    
    const response = await axios.get(searchUrl, {
      params: searchParams,
      headers: {
        'Authorization': `Bearer ${DECS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 59000
    });
    
    const results = [];
    
    // Processar resposta do DeCS
    if (response.data && response.data.decs) {
      const decsData = response.data.decs;
      
      // DeCS retorna um objeto com descritores
      if (decsData.descriptors && Array.isArray(decsData.descriptors)) {
        decsData.descriptors.forEach((descriptor, index) => {
          // Extrair informações multilíngues
          const terms = {
            pt: descriptor.descriptor_pt || '',
            es: descriptor.descriptor_es || '',
            en: descriptor.descriptor_en || '',
            fr: descriptor.descriptor_fr || ''
          };
          
          // Definições multilíngues
          const definitions = {
            pt: descriptor.definition_pt || '',
            es: descriptor.definition_es || '',
            en: descriptor.definition_en || '',
            fr: descriptor.definition_fr || ''
          };
          
          // Sinônimos
          const synonyms = {
            pt: descriptor.synonyms_pt || [],
            es: descriptor.synonyms_es || [],
            en: descriptor.synonyms_en || [],
            fr: descriptor.synonyms_fr || []
          };
          
          // Tree numbers (hierarquia)
          const treeNumbers = descriptor.tree_numbers || [];
          
          // Calcular relevância
          const relevanceScore = Math.round(95 - (index * 2));
          
          results.push({
            decsId: descriptor.decs_code || descriptor.id || `decs_${index}`,
            terms: terms,
            definitions: definitions,
            synonyms: synonyms,
            treeNumbers: treeNumbers,
            relevanceScore: relevanceScore,
            language: language
          });
        });
      }
    }
    
    console.log(`✅ ${results.length} termos DeCS encontrados`);
    return results;
    
  } catch (error) {
    console.error(`❌ Erro ao buscar DeCS:`, error.message);
    return [];
  }
}

// Função alternativa para busca booleana se a busca por palavras falhar
async function searchDeCSBoolean(searchTerm, language = 'pt') {
  console.log(`🔍 Tentando busca booleana DeCS: "${searchTerm}" (${language})`);
  
  try {
    const searchUrl = `${DECS_BASE_URL}/search-boolean`;
    const searchParams = {
      bool: searchTerm,
      lang: language,
      format: 'json'
    };
    
    const response = await axios.get(searchUrl, {
      params: searchParams,
      headers: {
        'Authorization': `Bearer ${DECS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 59000
    });
    
    const results = [];
    
    if (response.data && response.data.decs && response.data.decs.descriptors) {
      response.data.decs.descriptors.forEach((descriptor, index) => {
        const terms = {
          pt: descriptor.descriptor_pt || '',
          es: descriptor.descriptor_es || '',
          en: descriptor.descriptor_en || '',
          fr: descriptor.descriptor_fr || ''
        };
        
        const definitions = {
          pt: descriptor.definition_pt || '',
          es: descriptor.definition_es || '',
          en: descriptor.definition_en || '',
          fr: descriptor.definition_fr || ''
        };
        
        const relevanceScore = Math.round(90 - (index * 2));
        
        results.push({
          decsId: descriptor.decs_code || `decs_${index}`,
          terms: terms,
          definitions: definitions,
          synonyms: {},
          treeNumbers: descriptor.tree_numbers || [],
          relevanceScore: relevanceScore,
          language: language
        });
      });
    }
    
    return results;
    
  } catch (error) {
    console.error(`❌ Erro na busca booleana:`, error.message);
    return [];
  }
}

// Handler principal
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log('\n🚀 API DeCS - INÍCIO DO PROCESSAMENTO');
  console.log('===================================================');
  console.log('📥 Dados recebidos:', JSON.stringify(req.body, null, 2));

  const { frameworkElements, fullQuestion, frameworkType } = req.body;

  // Filtrar elementos válidos
  const validFrameworkElements = filterValidFrameworkElements(frameworkElements, frameworkType);
  console.log('✅ Elementos válidos:', validFrameworkElements);

  try {
    const processStartTime = Date.now();
    
    // PASSO 1: Extrair conceitos usando IA
    console.log('\n🤖 PASSO 1: EXTRAÇÃO DE CONCEITOS');
    const concepts = await extractConcepts(validFrameworkElements, fullQuestion, frameworkType);
    
    // PASSO 2: Buscar termos DeCS
    console.log('\n🔎 PASSO 2: BUSCA DE TERMOS DECS');
    
    const results = [];
    const allDecsTerms = [];
    const languages = ['pt', 'es', 'en']; // Português, Espanhol, Inglês
    
    // Processar cada elemento
    for (const [element, originalText] of Object.entries(validFrameworkElements)) {
      console.log(`\n📌 Processando elemento: ${element} - "${originalText}"`);
      
      const elementResults = {
        element,
        originalText: originalText,
        terms: []
      };
      
      // Obter conceitos para este elemento
      const elementConcepts = concepts[element] || [originalText];
      
      // Para cada conceito, buscar em múltiplos idiomas
      for (const searchTerm of elementConcepts) {
        for (const lang of languages) {
          try {
            // Tentar busca por palavras primeiro
            let decsTerms = await searchDeCSTerms(searchTerm, lang);
            
            // Se não encontrar, tentar busca booleana
            if (decsTerms.length === 0) {
              decsTerms = await searchDeCSBoolean(searchTerm, lang);
            }
            
            // Adicionar termos encontrados
            decsTerms.forEach(term => {
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
      
      // Limitar a 10 termos por elemento
      elementResults.terms = elementResults.terms.slice(0, 10);
      
      results.push(elementResults);
      console.log(`✅ Elemento ${element}: ${elementResults.terms.length} termos DeCS encontrados`);
    }

    // Remover duplicatas globais
    const uniqueDecsTerms = allDecsTerms
      .filter((term, index, self) => 
        index === self.findIndex(t => t.decsId === term.decsId))
      .filter(term => term.relevanceScore >= 50);

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
      details: error.message
    });
  }
}