// pages/api/search-mesh.js
import axios from 'axios';

// Usar DEEPSEEK_API_KEY ao invés de OPENAI_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MESH_API_KEY = process.env.MESH_API_KEY;
const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// NOVO: Definir elementos válidos por framework
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
  BeHEMoTh: ['Be', 'HE', 'Mo', 'Th']
};

// NOVO: Função para filtrar apenas elementos válidos do framework
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
    } else {
      console.warn(`Elemento "${key}" não é válido para o framework ${frameworkType}. Ignorando.`);
    }
  });
  
  return filtered;
}

// Função para extrair conceitos principais usando DeepSeek
async function extractConcepts(frameworkElements, fullQuestion, frameworkType) {
  console.log('🤖 extractConcepts - INÍCIO da extração de conceitos com DeepSeek');
  console.log('📋 Framework Type:', frameworkType);
  console.log('❓ Pergunta completa:', fullQuestion);
  console.log('📊 Elementos do framework recebidos:', frameworkElements);
  
  // LOG DETALHADO DE CADA ELEMENTO RECEBIDO
  console.log('\n🔍 DETALHAMENTO DOS ELEMENTOS RECEBIDOS:');
  console.log('=====================================');
  Object.entries(frameworkElements).forEach(([elemento, descricao]) => {
    console.log(`📌 ${elemento}: "${descricao}"`);
  });
  console.log('=====================================\n');
  
  const prompt = `
    Você vai extrair conceitos médicos simples dos elementos de pesquisa para busca posterior em bases de dados.
    
    REGRAS FUNDAMENTAIS:
    - NÃO tente adivinhar termos MeSH - eles serão processados pela API do MeSH
    - Extraia conceitos SIMPLES e DIRETOS em inglês
    - Use termos médicos comuns, não códigos ou nomenclaturas específicas
    - PROCESSE TODOS OS ELEMENTOS FORNECIDOS
    - CADA ELEMENTO DEVE TER ENTRE 3 A 5 CONCEITOS
    
    ESTRATÉGIA DE EXTRAÇÃO:
    1. Se o elemento tem muitas ideias/conceitos possíveis:
       - Selecione os 3-5 MAIS RELEVANTES e COMPLEMENTARES
       - Priorize conceitos que cubram diferentes aspectos do elemento
       - Evite redundâncias
    
    2. Se o elemento tem poucas opções de conceitos:
       - Abstraia o conceito principal em 3-5 variações
       - Use sinônimos, termos relacionados e diferentes níveis de especificidade
       - Exemplo: "obesidade" → ["obesity", "obese", "overweight", "excessive weight", "high BMI"]
    
    Framework utilizado: ${frameworkType}
    
    Exemplos de extração correta:
    - "Pacientes adultos com diabetes tipo 2" → ["diabetes", "type 2 diabetes", "diabetes mellitus", "adult patients", "diabetic adults"]
    - "adultos obesos" → ["obesity", "obese adults", "overweight", "excessive weight", "high BMI"]
    - "Metformina" → ["metformin", "biguanide", "antidiabetic drug", "glucose-lowering medication", "oral hypoglycemic"]
    - "dieta de baixo carboidrato" → ["low carbohydrate diet", "low-carb", "ketogenic diet", "carbohydrate restriction", "reduced carbohydrate"]
    - "dieta de baixo teor de gordura" → ["low fat diet", "fat restriction", "reduced fat", "low lipid diet", "decreased fat intake"]
    - "maior perda de peso" → ["weight loss", "weight reduction", "body weight decrease", "weight change", "weight management"]
    - "Exercícios aeróbicos" → ["aerobic exercise", "cardiovascular exercise", "physical activity", "endurance training", "cardio workout"]
    - "Controle glicêmico" → ["glycemic control", "blood glucose control", "glucose management", "HbA1c", "blood sugar regulation"]

    Elementos do framework ${frameworkType} para análise:
    ${JSON.stringify(frameworkElements, null, 2)}
    
    Pergunta completa: ${fullQuestion}
    
    INSTRUÇÕES FINAIS:
    - Retorne um JSON com arrays de 3-5 conceitos para CADA elemento
    - As chaves devem ser EXATAMENTE as mesmas fornecidas no input
    - TODOS os elementos devem ter conceitos extraídos
    - NUNCA retorne arrays vazios ou com menos de 3 conceitos
    - Pense que esses conceitos serão submetidos para a API dos termos MeSH
    
    Exemplo de retorno esperado:
    {
      "P": ["obesity", "obese adults", "overweight", "excessive weight", "high BMI"],
      "I": ["low carbohydrate diet", "low-carb", "ketogenic diet", "carbohydrate restriction"],
      "C": ["low fat diet", "fat restriction", "reduced fat", "low lipid diet"],
      "O": ["weight loss", "weight reduction", "body weight decrease", "weight management"]
    }
  `;
  console.log('📤 Enviando prompt para DeepSeek');

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração de conceitos médicos para busca em bases de dados. Você extrai termos simples e diretos, NÃO termos MeSH. SEMPRE processe TODOS os elementos fornecidos com 3-5 conceitos cada. NUNCA retorne arrays vazios ou com menos de 3 conceitos.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 59000 // 59 segundos de timeout
      }
    );

    const concepts = JSON.parse(response.data.choices[0].message.content);
    
    console.log('\n✅ CONCEITOS EXTRAÍDOS PELA IA (DeepSeek):');
    console.log('================================');
    console.log(JSON.stringify(concepts, null, 2));
    console.log('================================\n');
    
    // VERIFICAR SE TODOS OS ELEMENTOS FORAM PROCESSADOS
    const elementosNaoProcessados = Object.keys(frameworkElements).filter(
      elem => !concepts[elem] || concepts[elem].length === 0
    );
    
    if (elementosNaoProcessados.length > 0) {
      console.error('❌ ERRO: Elementos não processados pela IA:', elementosNaoProcessados);
      
      // Adicionar conceitos básicos para elementos não processados
      elementosNaoProcessados.forEach(elem => {
        const texto = frameworkElements[elem];
        if (texto) {
          // Tentar criar variações do texto original
          concepts[elem] = [texto, texto + " patients", texto + " subjects"];
          console.log(`🔧 Adicionando conceitos básicos para ${elem}: ${JSON.stringify(concepts[elem])}`);
        }
      });
    }
    
    // GARANTIR QUE CADA ELEMENTO TENHA PELO MENOS 3 CONCEITOS
    Object.entries(concepts).forEach(([elem, termos]) => {
      if (termos.length < 3) {
        console.warn(`⚠️ Elemento ${elem} tem apenas ${termos.length} conceitos. Expandindo...`);
        const textoOriginal = frameworkElements[elem];
        while (termos.length < 3) {
          termos.push(textoOriginal + " " + (termos.length + 1));
        }
        concepts[elem] = termos;
      }
    });
    
    // LOG SUPER DETALHADO - COMPARAÇÃO ENTRADA VS SAÍDA
    console.log('\n🔄 COMPARAÇÃO ENTRADA → SAÍDA (POR ELEMENTO):');
    console.log('==============================================');
    Object.entries(frameworkElements).forEach(([elemento, descricao]) => {
      const termos = concepts[elemento] || [];
      console.log(`\n📌 Elemento: ${elemento}`);
      console.log(`   📥 ENTRADA (Descrição original): "${descricao}"`);
      console.log(`   📤 SAÍDA (Conceitos extraídos): ${JSON.stringify(termos)}`);
      console.log(`   📊 Quantidade de conceitos: ${termos.length}`);
      
      if (termos.length > 0) {
        console.log('   📝 Detalhamento dos conceitos:');
        termos.forEach((termo, index) => {
          console.log(`      ${index + 1}. "${termo}"`);
        });
      }
    });
    console.log('==============================================\n');
    
    console.log('🤖 extractConcepts - FIM da extração');
    
    return concepts;
  } catch (error) {
    console.error('❌ Erro ao extrair conceitos com DeepSeek:', error);
    console.error('❌ Detalhes do erro:', error.response?.data);
    throw error;
  }
}

// Função para buscar termos MeSH SEM LIMITES
async function searchMeSHTerm(term) {
  console.log(`\n🔍 searchMeSHTerm - Buscando termo: "${term}"`);
  
  const debugInfo = {
    searchTerm: term,
    apiCalls: [],
    usingApiKey: !!MESH_API_KEY
  };

  try {
    // Delay máximo entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de delay
    
    // Busca o ID do termo SEM LIMITE
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi`;
    const searchParams = {
      db: 'mesh',
      term: term,
      retmode: 'json',
      retmax: 1000, // Buscar até 1000 resultados
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };
    
    debugInfo.apiCalls.push({
      type: 'search',
      url: searchUrl,
      params: searchParams,
      hasApiKey: !!MESH_API_KEY
    });

    console.log(`   📡 Chamando NCBI E-utilities...`);
    
    const searchResponse = await axios.get(searchUrl, { 
      params: searchParams,
      timeout: 59000 // 59 segundos de timeout
    });
    
    debugInfo.apiCalls[0].response = {
      count: searchResponse.data.esearchresult.count,
      ids: searchResponse.data.esearchresult.idlist
    };

    console.log(`   📊 Resultados encontrados: ${searchResponse.data.esearchresult.count}`);

    const ids = searchResponse.data.esearchresult.idlist;
    if (!ids || ids.length === 0) {
      console.log(`   ⚠️ Nenhum resultado encontrado`);
      debugInfo.noResultsFound = true;
      return { results: [], debug: debugInfo };
    }

    // Busca detalhes de TODOS os termos
    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi`;
    const summaryParams = {
      db: 'mesh',
      id: ids.join(','),
      retmode: 'json',
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };

    debugInfo.apiCalls.push({
      type: 'summary',
      url: summaryUrl,
      params: summaryParams,
      hasApiKey: !!MESH_API_KEY
    });

    const summaryResponse = await axios.get(summaryUrl, { 
      params: summaryParams,
      timeout: 59000 // 59 segundos de timeout
    });
    
    const results = [];
    const uids = summaryResponse.data.result.uids || [];
    
    console.log(`   📋 Processando ${uids.length} termos MeSH`);
    
    for (const uid of uids) {
      const meshData = summaryResponse.data.result[uid];
      if (!meshData || meshData.error) continue;
      
      // Extrair TODOS os dados
      const preferredTerm = meshData.ds_meshui || meshData.ds_meshterms?.[0] || '';
      const meshTerms = meshData.ds_meshterms || [];
      
      // Extrair TODOS os tree numbers
      let treeNumbers = [];
      
      if (meshData.ds_meshhierarchy && Array.isArray(meshData.ds_meshhierarchy)) {
        treeNumbers = meshData.ds_meshhierarchy.filter(h => typeof h === 'string');
      }
      
      if (treeNumbers.length === 0 && meshData.ds_idxlinks) {
        if (Array.isArray(meshData.ds_idxlinks)) {
          treeNumbers = meshData.ds_idxlinks.map(link => {
            if (typeof link === 'string') return link;
            
            if (typeof link === 'object' && link !== null) {
              if (link.parent) return link.parent;
              if (link.code) return link.code;
              if (link.treeNumber) return link.treeNumber;
              if (link.hierarchyCode) return link.hierarchyCode;
              if (link.descriptor) return link.descriptor;
              
              for (const [key, value] of Object.entries(link)) {
                if (typeof value === 'string' && /^[A-Z]\d+/.test(value)) {
                  return value;
                }
              }
              
              return null;
            }
            
            return null;
          }).filter(Boolean);
        }
      }
      
      // TODOS os sinônimos
      const synonyms = meshData.ds_meshsynonyms || [];
      
      // Definição COMPLETA
      const definition = meshData.ds_scopenote || '';
      
      // Calcular relevance score com degradação mais suave
      const relevanceScore = Math.round(95 - (results.length * 0.3));
      
      const result = {
        meshId: uid,
        meshUI: preferredTerm,
        term: meshTerms[0] || term,
        allTerms: meshTerms,
        definition: definition,
        synonyms: synonyms,
        treeNumbers: treeNumbers,
        relevanceScore: relevanceScore
      };
      
      results.push(result);
    }

    console.log(`   ✅ ${results.length} termos MeSH processados`);

    return { results, debug: debugInfo };
  } catch (error) {
    console.error(`   ❌ Erro ao buscar MeSH:`, error.message);
    debugInfo.error = error.message;
    return { results: [], debug: debugInfo };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Configurar headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log('\n🚀 API MeSH - INÍCIO DO PROCESSAMENTO');
  console.log('===================================================');
  console.log('📥 Dados recebidos:', JSON.stringify(req.body, null, 2));

  const { frameworkElements, fullQuestion, frameworkType } = req.body;

  // Filtrar elementos válidos
  const validFrameworkElements = filterValidFrameworkElements(frameworkElements, frameworkType);
  console.log('✅ Elementos válidos:', validFrameworkElements);

  try { 
    const processStartTime = Date.now();
    
    // Debug completo do processo
    const fullDebug = {
      '🚀 INÍCIO': new Date().toISOString(),
      '📝 ENTRADA ORIGINAL': {
        frameworkElements,
        fullQuestion,
        frameworkType
      },
      '🔑 API KEY STATUS': MESH_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
      '🔄 PROCESSO': []
    };

    // PASSO 1: Extrair conceitos usando IA
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 PASSO 1: EXTRAÇÃO DE CONCEITOS COM IA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const concepts = await extractConcepts(validFrameworkElements, fullQuestion, frameworkType);
    
    console.log('\n🔍 CONCEITOS EXTRAÍDOS POR ELEMENTO:');
    Object.entries(concepts).forEach(([elem, terms]) => {
      console.log(`${elem}: ${terms.length} conceitos - ${JSON.stringify(terms)}`);
    });
    
    // PASSO 2: Buscar termos MeSH para CADA conceito
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 PASSO 2: BUSCA DE TERMOS MESH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = [];
    const allMeshTerms = [];
    
    // PROCESSAR CADA ELEMENTO SEQUENCIALMENTE
    for (const [element, originalText] of Object.entries(validFrameworkElements)) {
      console.log(`\n📌 PROCESSANDO ELEMENTO: ${element} - "${originalText}"`);
      
      const elementResults = {
        element,
        originalText: originalText,
        terms: []
      };
      
      // Obter conceitos para este elemento
      const elementConcepts = concepts[element] || [];
      
      if (elementConcepts.length === 0) {
        console.log(`⚠️ Nenhum conceito extraído, tentando buscar com texto original`);
        
        // Tentar buscar com o texto original
        if (originalText && originalText.trim()) {
          console.log(`🔍 Buscando com texto original: "${originalText}"`);
          const { results: meshTerms } = await searchMeSHTerm(originalText);
          
          // Adicionar termos com score >= 50%
          meshTerms.forEach(meshTerm => {
            if (meshTerm.relevanceScore >= 50) {
              const cleanTerm = { ...meshTerm };
              delete cleanTerm._rawData;
              
              elementResults.terms.push(cleanTerm);
              allMeshTerms.push(cleanTerm);
              console.log(`   ✅ Termo adicionado: "${meshTerm.term}" (${meshTerm.relevanceScore}%)`);
            }
          });
        }
      } else {
        console.log(`🔍 ${elementConcepts.length} conceitos para buscar: ${JSON.stringify(elementConcepts)}`);
        
        // Buscar TODOS os conceitos
        for (let i = 0; i < elementConcepts.length; i++) {
          const searchTerm = elementConcepts[i];
          console.log(`\n   [${i+1}/${elementConcepts.length}] Buscando: "${searchTerm}"`);
          
          try {
            const { results: meshTerms } = await searchMeSHTerm(searchTerm);
            
            let addedCount = 0;
            meshTerms.forEach(meshTerm => {
              if (meshTerm.relevanceScore >= 50) {
                const cleanTerm = { ...meshTerm };
                delete cleanTerm._rawData;
                
                // Verificar se já não foi adicionado
                if (!elementResults.terms.find(t => t.meshId === meshTerm.meshId)) {
                  elementResults.terms.push(cleanTerm);
                  allMeshTerms.push(cleanTerm);
                  addedCount++;
                }
              }
            });
            
            console.log(`   ✅ ${addedCount} termos adicionados (score >= 50%)`);
          } catch (error) {
            console.error(`   ❌ Erro ao buscar "${searchTerm}":`, error.message);
          }
        }
      }
      
      // Ordenar por relevância
      elementResults.terms.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Adicionar resultado do elemento
      results.push(elementResults);
      
      console.log(`\n✅ ELEMENTO ${element} CONCLUÍDO: ${elementResults.terms.length} termos MeSH encontrados`);
    }

    // Remover duplicatas globais
    const uniqueMeshTerms = allMeshTerms
      .filter((term, index, self) => index === self.findIndex(t => t.meshId === term.meshId))
      .filter(term => term.relevanceScore >= 50);

    const processTime = Date.now() - processStartTime;
    
    // LOG FINAL
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO FINAL DO PROCESSAMENTO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️ Tempo total: ${processTime}ms (${(processTime/1000).toFixed(2)}s)`);
    console.log(`✅ Elementos processados: ${results.length}`);
    console.log('\n📋 RESUMO POR ELEMENTO:');
    results.forEach((r) => {
      console.log(`${r.element}: ${r.terms.length} termos MeSH`);
      if (r.terms.length > 0) {
        console.log(`   Top 3: ${r.terms.slice(0, 3).map(t => `"${t.term}" (${t.relevanceScore}%)`).join(', ')}`);
      }
    });
    console.log(`\n🎯 Total de termos únicos: ${uniqueMeshTerms.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Preparar resposta
    const responseData = {
      results, 
      allMeshTerms: uniqueMeshTerms,
      debug: process.env.NODE_ENV === 'development' ? fullDebug : undefined
    };
    
    console.log('📤 Enviando resposta...');
    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar termos MeSH',
      details: error.message
    });
  }
}