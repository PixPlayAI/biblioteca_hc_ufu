// pages/api/search-mesh.js
import axios from 'axios';

// Mudança 1: Usar DEEPSEEK_API_KEY ao invés de OPENAI_API_KEY
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
    
    IMPORTANTE: 
    - NÃO tente adivinhar termos MeSH
    - Extraia conceitos SIMPLES e DIRETOS em inglês
    - Use termos médicos comuns, não códigos ou nomenclaturas específicas
    - Para cada elemento, forneça múltiplas variações quando possível
    
    Framework utilizado: ${frameworkType}
    
    Exemplos de extração correta:
    - "Pacientes adultos com diabetes tipo 2" → ["diabetes", "type 2 diabetes", "diabetes mellitus", "adult", "adults"]
    - "Metformina" → ["metformin"]
    - "Exercícios aeróbicos" → ["exercise", "aerobic exercise", "physical activity"]
    - "Controle glicêmico" → ["glycemic control", "blood glucose", "glucose control", "hba1c"]
    - "Enfermeiros de UTI" → ["nurses", "intensive care unit", "ICU", "critical care"]
    - "Burnout profissional" → ["burnout", "professional burnout", "occupational stress"]
    - "Qualidade de vida" → ["quality of life", "QoL", "life quality"]
    - "usuários do SUS" → ["SUS", "Brazil Health", "Health system"]
    - "implementação de agendamento online via aplicativo móvel" → ["Appointment Scheduling", "Medical Informatics Applications", "Online Systems", "Telemedicine", "Mobile Applications"]
    - "agendamento presencial tradicional" → ["Appointment Scheduling", "Outpatients", "Ambulatory Care Facilities", "Health Facilities"]

    Elementos do framework ${frameworkType} para análise:
    ${JSON.stringify(frameworkElements, null, 2)}
    
    Pergunta completa: ${fullQuestion}
    
    Retorne um JSON com arrays de conceitos SIMPLES para cada elemento do framework.
    As chaves devem ser exatamente as mesmas fornecidas no input.
    Exemplo: {"P": ["diabetes", "adult"], "I": ["metformin", "exercise"], ...}
  `;
 console.log('📤 Enviando prompt para DeepSeek:', prompt);

  try {
    // Mudança 2: URL da API DeepSeek
    // Mudança 3: Modelo deepseek-chat ao invés de gpt-4-1106-preview
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat', // Usando o modelo mais poderoso do DeepSeek
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração de conceitos médicos para busca em bases de dados. Você extrai termos simples e diretos, NÃO termos MeSH.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, // Mudança 4: Usando chave do DeepSeek
          'Content-Type': 'application/json'
        }
      }
    );

    const concepts = JSON.parse(response.data.choices[0].message.content);
    
    console.log('\n✅ CONCEITOS EXTRAÍDOS PELA IA (DeepSeek):');
    console.log('================================');
    console.log(JSON.stringify(concepts, null, 2));
    console.log('================================\n');
    
    // LOG SUPER DETALHADO - COMPARAÇÃO ENTRADA VS SAÍDA
    console.log('\n🔄 COMPARAÇÃO ENTRADA → SAÍDA (POR ELEMENTO):');
    console.log('==============================================');
    Object.entries(concepts).forEach(([elemento, termos]) => {
      console.log(`\n📌 Elemento: ${elemento}`);
      console.log(`   📥 ENTRADA (Descrição original): "${frameworkElements[elemento]}"`);
      console.log(`   📤 SAÍDA (Conceitos extraídos): ${JSON.stringify(termos)}`);
      console.log(`   📊 Quantidade de conceitos: ${termos.length}`);
      
      // Log individual de cada conceito
      if (termos.length > 0) {
        console.log('   📝 Detalhamento dos conceitos:');
        termos.forEach((termo, index) => {
          console.log(`      ${index + 1}. "${termo}"`);
        });
      }
    });
    console.log('==============================================\n');
    
    // Verificar se algum elemento ficou sem conceitos
    const elementosSemConceitos = Object.entries(concepts)
      .filter(([, termos]) => termos.length === 0)
      .map(([elemento]) => elemento);
    
    if (elementosSemConceitos.length > 0) {
      console.warn('⚠️ ATENÇÃO: Elementos sem conceitos extraídos:', elementosSemConceitos);
    }
    
    console.log('🤖 extractConcepts - FIM da extração');
    
    return concepts;
  } catch (error) {
    console.error('❌ Erro ao extrair conceitos com DeepSeek:', error);
    console.error('❌ Detalhes do erro:', error.response?.data);
    throw error;
  }
}

// Função melhorada para buscar termos MeSH
async function searchMeSHTerm(term) {
  console.log(`🔍 searchMeSHTerm - Buscando termo: "${term}"`);
  
  const debugInfo = {
    searchTerm: term,
    apiCalls: [],
    usingApiKey: !!MESH_API_KEY
  };

  try {
    // Primeiro, busca o ID do termo
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi`;
    const searchParams = {
      db: 'mesh',
      term: term,
      retmode: 'json',
      retmax: 10,
      ...(MESH_API_KEY && { api_key: MESH_API_KEY })
    };
    
    debugInfo.apiCalls.push({
      type: 'search',
      url: searchUrl,
      params: searchParams,
      hasApiKey: !!MESH_API_KEY
    });

    console.log(`📡 Fazendo chamada para NCBI E-utilities: ${searchUrl}`);
    
    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    
    debugInfo.apiCalls[0].response = {
      count: searchResponse.data.esearchresult.count,
      ids: searchResponse.data.esearchresult.idlist
    };

    console.log(`📊 Resultados encontrados para "${term}": ${searchResponse.data.esearchresult.count}`);

    const ids = searchResponse.data.esearchresult.idlist;
    if (!ids || ids.length === 0) {
      console.log(`⚠️ Nenhum resultado encontrado para: "${term}"`);
      debugInfo.noResultsFound = true;
      return { results: [], debug: debugInfo };
    }

    // Busca detalhes dos termos encontrados
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

    const summaryResponse = await axios.get(summaryUrl, { params: summaryParams });
    
    const results = [];
    const uids = summaryResponse.data.result.uids || [];
    
    console.log(`📋 Processando ${uids.length} termos MeSH encontrados para "${term}"`);
    
    for (const uid of uids) {
      const meshData = summaryResponse.data.result[uid];
      if (!meshData || meshData.error) continue;
      
      // Extrair o termo preferido e informações adicionais
      const preferredTerm = meshData.ds_meshui || meshData.ds_meshterms?.[0] || '';
      const meshTerms = meshData.ds_meshterms || [];
      
      // Melhorar a extração de tree numbers
      let treeNumbers = [];
      
      // Primeiro, tentar ds_meshhierarchy se existir
      if (meshData.ds_meshhierarchy && Array.isArray(meshData.ds_meshhierarchy)) {
        treeNumbers = meshData.ds_meshhierarchy.filter(h => typeof h === 'string');
      }
      
      // Se não encontrou, tentar ds_idxlinks
      if (treeNumbers.length === 0 && meshData.ds_idxlinks) {
        if (Array.isArray(meshData.ds_idxlinks)) {
          treeNumbers = meshData.ds_idxlinks.map(link => {
            if (typeof link === 'string') return link;
            
            // Se for objeto, tentar extrair propriedades comuns
            if (typeof link === 'object' && link !== null) {
              // Logar a estrutura do objeto para debug
              console.log('Tree number object structure:', JSON.stringify(link, null, 2));
              
              // Tentar várias propriedades possíveis
              if (link.parent) return link.parent;
              if (link.code) return link.code;
              if (link.treeNumber) return link.treeNumber;
              if (link.hierarchyCode) return link.hierarchyCode;
              if (link.descriptor) return link.descriptor;
              
              // Se tiver uma propriedade que parece um tree number (formato letra.números)
              for (const [key, value] of Object.entries(link)) {
                if (typeof value === 'string' && /^[A-Z]\d+/.test(value)) {
                  return value;
                }
              }
              
              // Não retornar [object Object], retornar null
              return null;
            }
            
            return null;
          }).filter(Boolean); // Remove valores null/undefined
        }
      }
      
      // Se ainda não tem tree numbers, tentar outras propriedades
      if (treeNumbers.length === 0) {
        // Verificar se há tree numbers em outras propriedades
        const possibleTreeProps = ['ds_treecode', 'ds_tree', 'treecode', 'tree_number'];
        for (const prop of possibleTreeProps) {
          if (meshData[prop]) {
            if (Array.isArray(meshData[prop])) {
              treeNumbers = meshData[prop].filter(t => typeof t === 'string');
            } else if (typeof meshData[prop] === 'string') {
              treeNumbers = [meshData[prop]];
            }
            if (treeNumbers.length > 0) break;
          }
        }
      }
      
      const result = {
        meshId: uid,
        meshUI: preferredTerm,
        term: meshTerms[0] || term,
        allTerms: meshTerms,
        definition: meshData.ds_scopenote || '',
        synonyms: meshData.ds_meshsynonyms || [],
        treeNumbers: treeNumbers,
        relevanceScore: Math.round(95 - (results.length * 5)),
        // Adicionar dados brutos para debug se necessário
        _rawData: meshData
      };
      
      results.push(result);
      
      console.log(`      ✅ Termo MeSH encontrado: "${result.term}" (Score: ${result.relevanceScore}%)`);
    }

    debugInfo.apiCalls[1].response = {
      termCount: results.length,
      terms: results.map(r => ({
        term: r.term,
        treeNumbers: r.treeNumbers,
        meshId: r.meshId
      }))
    };

    console.log(`🔍 searchMeSHTerm - Busca concluída para "${term}": ${results.length} termos encontrados`);

    return { results, debug: debugInfo };
  } catch (error) {
    console.error(`❌ Erro ao buscar MeSH para "${term}":`, error);
    debugInfo.error = error.message;
    return { results: [], debug: debugInfo };
  }
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug dos dados recebidos
  console.log('\n🚀 API MeSH - INÍCIO DO PROCESSAMENTO');
  console.log('===================================================');
  console.log('📥 Dados recebidos do frontend:', {
    frameworkElements: req.body.frameworkElements,
    fullQuestion: req.body.fullQuestion,
    frameworkType: req.body.frameworkType
  });

  const { frameworkElements, fullQuestion, frameworkType } = req.body;

  // NOVO: Filtrar elementos válidos
  const validFrameworkElements = filterValidFrameworkElements(frameworkElements, frameworkType);
  console.log('✅ Elementos válidos para o framework:', validFrameworkElements);

  try { 
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
    
    fullDebug['🔄 PROCESSO'].push({
      '🤖 PASSO 1': 'EXTRAÇÃO DE CONCEITOS COM IA',
      '📤 ENVIADO PARA OPENAI': {
        objetivo: 'Extrair conceitos simples (NÃO termos MeSH) para busca posterior',
        modelo: 'gpt-4-1106-preview',
        framework: frameworkType
      }
    });

    const concepts = await extractConcepts(validFrameworkElements, fullQuestion, frameworkType);
    
    fullDebug['🔄 PROCESSO'].push({
      '✅ RESPOSTA DA IA': concepts,
      '🔍 ANÁLISE': {
        totalConceitos: Object.values(concepts).flat().length,
        conceitosPorElemento: Object.entries(concepts).map(([k, v]) => ({ [k]: v.length }))
      }
    });

    // PASSO 2: Buscar termos MeSH para cada conceito
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 PASSO 2: BUSCA DE TERMOS MESH');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = [];
    const allMeshTerms = []; // Para coletar todos os termos únicos
    
    // LOG DO QUE VAI SER BUSCADO
    console.log('\n📋 RESUMO DO QUE SERÁ BUSCADO NO MESH:');
    console.log('=====================================');
    Object.entries(concepts).forEach(([elemento, termos]) => {
      console.log(`\n${elemento} (${frameworkElements[elemento]}):`);
      termos.forEach((termo, index) => {
        console.log(`  ${index + 1}. "${termo}"`);
      });
    });
    console.log('=====================================\n');
    
    // CORREÇÃO CRÍTICA: Garantir que TODOS os elementos do framework sejam incluídos
    // MODIFICADO: Processar apenas elementos válidos
    for (const [element, originalText] of Object.entries(validFrameworkElements)) {
      console.log(`\n📌 PROCESSANDO ELEMENTO: ${element}`);
      console.log(`📝 Texto original: "${originalText}"`);
      const elementDebug = {
        '🏷️ ELEMENTO': element,
        '🇧🇷 TEXTO ORIGINAL': originalText,
        '🇺🇸 CONCEITOS EXTRAÍDOS': concepts[element] || [],
        '🔎 BUSCAS MESH': []
      };
      
      const elementResults = {
        element,
        originalText: originalText, // IMPORTANTE: Sempre incluir o texto original
        terms: []
      };
      
      // Verificar se existem conceitos para este elemento
      const terms = concepts[element] || [];
      
      if (terms.length === 0) {
        console.log(`⚠️ Nenhum conceito extraído para ${element}, mas incluindo no resultado`);
      } else {
        console.log(`🔍 Conceitos a buscar: ${JSON.stringify(terms)}`);
        console.log(`📊 Total de conceitos para buscar: ${terms.length}`);
        
        // Busca todos os termos do elemento
        for (const searchTerm of terms) {
          console.log(`\n   🔍 Buscando conceito: "${searchTerm}"`);
          
          const searchDebug = {
            '🔍 BUSCANDO': searchTerm,
            '🌐 API': 'NCBI E-utilities (REAL)',
            '🔑 API KEY': MESH_API_KEY ? 'USANDO' : 'SEM KEY',
            '💰 CUSTO': 'GRATUITO'
          };

          const { results: meshTerms, debug: termDebug } = await searchMeSHTerm(searchTerm);
          
          searchDebug['📊 RESULTADOS'] = {
            encontrados: meshTerms.length,
            termos: meshTerms.map(t => t.term),
            meshIDs: meshTerms.map(t => t.meshUI),
            treeNumbers: meshTerms.map(t => ({
              term: t.term,
              trees: t.treeNumbers
            }))
          };
          searchDebug['🔧 DEBUG API'] = termDebug;
          
          elementDebug['🔎 BUSCAS MESH'].push(searchDebug);
          
          // Adiciona termos encontrados
          meshTerms.forEach(meshTerm => {
            // Remove _rawData antes de adicionar aos resultados
            const cleanTerm = { ...meshTerm };
            delete cleanTerm._rawData;
            
            // Verifica se o termo já não foi adicionado
            if (!elementResults.terms.find(t => t.meshId === meshTerm.meshId)) {
              elementResults.terms.push(cleanTerm);
              allMeshTerms.push(cleanTerm);
              console.log(`      ✅ Termo adicionado: "${meshTerm.term}" (${meshTerm.relevanceScore}%)`);
            }
          });
        }
        
        // Ordena por relevância
        elementResults.terms.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      
      fullDebug['🔄 PROCESSO'].push(elementDebug);
      
      // SEMPRE adiciona o elemento aos resultados, mesmo sem termos MeSH
      results.push(elementResults);
      
      if (elementResults.terms.length > 0) {
        console.log(`\n✅ Total de termos MeSH para ${element}: ${elementResults.terms.length}`);
      } else {
        console.log(`\n⚠️ Nenhum termo MeSH encontrado para ${element}, mas elemento incluído nos resultados`);
      }
    }

    // Remove duplicatas globais de allMeshTerms
    const uniqueMeshTerms = allMeshTerms.filter((term, index, self) =>
      index === self.findIndex(t => t.meshId === term.meshId)
    );

    fullDebug['📊 RESUMO FINAL'] = {
      '✅ STATUS': 'SUCESSO',
      '🌐 TIPO': 'API REAL (NCBI)',
      '🔑 API KEY': MESH_API_KEY ? 'ATIVA' : 'NÃO CONFIGURADA',
      '💰 CUSTO': 'GRATUITO',
      '📈 ESTATÍSTICAS': {
        framework: frameworkType,
        elementosProcessados: Object.keys(frameworkElements).length, // Mudança aqui
        elementosIncluídosNosResultados: results.length, // Nova métrica
        totalConceitosExtraidos: Object.values(concepts).flat().length,
        totalTermosMeshEncontrados: uniqueMeshTerms.length,
        termosUnicos: uniqueMeshTerms.map(t => t.term),
        tempoProcessamento: `${Date.now() - new Date(fullDebug['🚀 INÍCIO']).getTime()}ms`
      }
    };

    // LOG FINAL SUPER DETALHADO
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO FINAL DO PROCESSAMENTO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Total de elementos processados:', results.length);
    console.log('📋 Elementos do framework:', Object.keys(frameworkElements).join(', '));
    console.log('📋 Elementos incluídos nos resultados:', results.map(r => r.element).join(', '));
    console.log('\n📋 RESUMO POR ELEMENTO:');
    results.forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.element}: "${r.originalText}"`);
      console.log(`   - Conceitos buscados: ${concepts[r.element]?.length || 0}`);
      console.log(`   - Termos MeSH encontrados: ${r.terms.length}`);
      if (r.terms.length > 0) {
        console.log('   - Top 3 termos:');
        r.terms.slice(0, 3).forEach((term, i) => {
          console.log(`     ${i + 1}. "${term.term}" (${term.relevanceScore}%)`);
        });
      }
    });
    console.log('\n🎯 Total de termos MeSH únicos:', uniqueMeshTerms.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 API MeSH - FIM DO PROCESSAMENTO\n');

      
    res.status(200).json({ 
      results, 
      allMeshTerms: uniqueMeshTerms,
      debug: fullDebug 
    });
  } catch (error) {
    console.error('❌ Erro na busca MeSH:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar termos MeSH',
      details: error.message,
      debug: { 
        '❌ ERRO': error.toString(),
        '📍 STACK': error.stack 
      }
    });
  }
}