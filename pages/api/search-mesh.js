// pages/api/search-mesh.js
import axios from 'axios';

// Usar DEEPSEEK_API_KEY ao invés de OPENAI_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MESH_API_KEY = process.env.MESH_API_KEY;
const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Verificar variáveis de ambiente no início
if (!DEEPSEEK_API_KEY) {
  console.error('⚠️ AVISO: DEEPSEEK_API_KEY não está configurada!');
}

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
  BeHEMoTh: ['Be', 'HE', 'Mo', 'Th'],
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

// Função para gerar o prompt com tratamento de erro
function generatePrompt(frameworkElements, fullQuestion, frameworkType) {
  try {
    // Definições base por framework
    const frameworkDefinitions = {
      PICO: `PICO - Framework para questões clínicas sobre intervenções:
- P (Population/Patient): População específica ou pacientes com condição clínica
- I (Intervention): Tratamento, terapia, medicamento ou procedimento ATIVO
- C (Comparison): Grupo controle, placebo ou tratamento alternativo
- O (Outcome): Desfecho clínico mensurável`,
      
      PICOT: `PICOT - PICO com elemento temporal:
- P (Population/Patient): População específica ou pacientes
- I (Intervention): Intervenção terapêutica ativa
- C (Comparison): Comparador ou controle
- O (Outcome): Desfecho mensurável
- T (Time): Período de seguimento/acompanhamento (6 meses, 1 ano, etc.)`,
      
      PICOS: `PICOS - PICO com desenho do estudo:
- P (Population/Patient): População do estudo
- I (Intervention): Intervenção avaliada
- C (Comparison): Comparador
- O (Outcome): Desfecho
- S (Study Design): Tipo de estudo (RCT, coorte, caso-controle)`,
      
      PEO: `PEO - Framework para estudos observacionais sem comparação:
- P (Population): População exposta
- E (Exposure): Exposição NATURAL/OCUPACIONAL (não controlada)
- O (Outcome): Desfecho observado`,
      
      PECO: `PECO - PEO com comparação de exposições:
- P (Population): População do estudo
- E (Exposure): Exposição natural/ambiental/ocupacional
- C (Comparison): Grupo não exposto ou diferente exposição
- O (Outcome): Desfecho observado`,
      
      PCC: `PCC - Framework para revisões de escopo:
- P (Population): População de interesse
- C (Concept): Conceito/fenômeno central explorado
- C2 (Context): Contexto geográfico/cultural/temporal`,
      
      SPIDER: `SPIDER - Framework para pesquisa qualitativa:
- S (Sample): Amostra específica do estudo
- PI (Phenomenon of Interest): Experiência/percepção/vivência estudada
- D (Design): Método qualitativo (entrevistas, grupos focais)
- E (Evaluation): O que está sendo avaliado/analisado
- R (Research Type): Tipo de pesquisa qualitativa`,
      
      PIRD: `PIRD - Framework para estudos diagnósticos:
- P (Population): População com suspeita diagnóstica
- I (Index Test): Novo teste diagnóstico em avaliação
- R (Reference Test): Teste padrão-ouro para comparação
- D (Diagnosis): Condição sendo diagnosticada`,
      
      CoCoPop: `CoCoPop - Framework para estudos de prevalência:
- Co (Condition): Doença/condição de saúde específica
- Co2 (Context): Contexto temporal/geográfico/social
- Pop (Population): População onde se mede prevalência`,
      
      SPICE: `SPICE - Framework para avaliação de serviços:
- S (Setting): Local/ambiente do serviço de saúde
- P (Perspective): De quem é a perspectiva (usuários, profissionais)
- I (Intervention): Mudança/implementação no serviço
- C (Comparison): Prática atual/tradicional
- E (Evaluation): Indicadores de qualidade/satisfação`,
      
      ECLIPSE: `ECLIPSE - Framework para políticas de saúde:
- E (Expectation): Objetivo/meta da política
- C (Client Group): Grupo beneficiário
- L (Location): Local/região de implementação
- I (Impact): Impacto organizacional esperado
- P (Professionals): Profissionais envolvidos
- SE (Service): Tipo de serviço de saúde`,
      
      BeHEMoTh: `BeHEMoTh - Framework para comportamento em saúde:
- Be (Behavior): Comportamento de saúde específico
- HE (Health Context): Contexto/ambiente de saúde
- Mo (Exclusions): Exclusões metodológicas
- Th (Models/Theories): Teorias comportamentais aplicadas`
    };

    // Exemplos por framework com foco em abstrações difíceis
    const frameworkExamples = {
      PICO: `Exemplo PICO - "Em adultos obesos (P), dieta low-carb (I) vs dieta low-fat (C) para perda de peso (O)":
{
  "P": ["adults", "obesity", "obese", "overweight", "adult"],
  "I": ["diet, carbohydrate-restricted", "low carbohydrate diet", "ketogenic diet", "carbohydrate restriction", "diet therapy"],
  "C": ["diet, fat-restricted", "low fat diet", "lipid restriction", "dietary fats", "fat intake"],
  "O": ["weight loss", "body weight", "weight reduction", "body mass index", "obesity management"]
}`,
      
      PEO: `Exemplo PEO - "Mulheres grávidas (P) expostas a fumo passivo (E) e baixo peso ao nascer (O)":
{
  "P": ["pregnant women", "pregnancy", "maternal", "expectant mothers", "gestation"],
  "E": ["tobacco smoke pollution", "passive smoking", "secondhand smoke", "environmental tobacco smoke", "smoke exposure"],
  "O": ["infant, low birth weight", "birth weight", "fetal growth retardation", "small for gestational age", "neonatal weight"]
}`,
      
      SPIDER: `Exemplo SPIDER - "Enfermeiras recém-graduadas (S) experiência primeira semana (PI) entrevistas (D) impacto psicológico (E) qualitativa (R)":
{
  "S": ["nurses", "nursing staff", "new graduate nurses", "novice nurses", "nursing personnel"],
  "PI": ["professional adaptation", "work experience", "transition to practice", "first week experience", "workplace adjustment"],
  "D": ["interviews", "qualitative research", "semi-structured interviews", "interview methods", "data collection"],
  "E": ["psychological impact", "stress, psychological", "adaptation, psychological", "emotional adjustment", "mental health"],
  "R": ["qualitative research", "phenomenology", "descriptive study", "interpretive research", "narrative analysis"]
}`,
      
      PIRD: `Exemplo PIRD - "Suspeita infarto (P), troponina point-of-care (I) vs ECG+troponina lab (R) para diagnóstico IAM (D)":
{
  "P": ["myocardial infarction", "acute coronary syndrome", "chest pain", "emergency service", "suspected MI"],
  "I": ["troponin", "point-of-care testing", "rapid diagnostics", "bedside testing", "troponin test"],
  "R": ["electrocardiography", "troponin", "laboratory techniques", "standard diagnosis", "conventional testing"],
  "D": ["myocardial infarction", "acute myocardial infarction", "heart attack", "cardiac diagnosis", "MI diagnosis"]
}`,

      SPICE: `Exemplo SPICE - "Hospital (S), perspectiva dos pacientes (P), implementação de agendamento online (I) vs agendamento presencial (C), satisfação do usuário (E)":
{
  "S": ["hospitals", "health facilities", "medical center", "healthcare setting", "outpatient clinics"],
  "P": ["patients", "patient satisfaction", "patient perspective", "health care consumers", "service users"],
  "I": ["appointments and schedules", "telemedicine", "mobile applications", "online systems", "digital health"],
  "C": ["traditional practice", "conventional methods", "standard care", "usual practice", "routine procedures"],
  "E": ["patient satisfaction", "waiting time", "access to health care", "quality indicators", "service quality"]
}`
    };

    const prompt = `Você é um especialista em extração de conceitos médicos para busca na base de dados MeSH (Medical Subject Headings). Sua tarefa é analisar elementos de frameworks de pesquisa e extrair conceitos que REALMENTE EXISTEM no vocabulário MeSH.

🎯 FRAMEWORK ATUAL: ${frameworkType}

📚 DEFINIÇÃO ESPECÍFICA DOS ELEMENTOS POR FRAMEWORK:

${frameworkDefinitions[frameworkType] || 'Framework não definido'}

⚠️ REGRAS CRÍTICAS DE RELEVÂNCIA:

1. RELEVÂNCIA ABSOLUTA: Cada conceito DEVE estar DIRETAMENTE relacionado ao elemento específico
   - Para P: apenas termos sobre a população descrita
   - Para I: apenas termos sobre a intervenção mencionada
   - Para C: apenas termos sobre o comparador
   - Para O: apenas termos sobre o desfecho
   - E assim por diante para cada elemento

2. PROIBIDO MISTURAR ELEMENTOS:
   ❌ NÃO coloque conceitos de intervenção no elemento População
   ❌ NÃO coloque conceitos de desfecho no elemento Intervenção
   ❌ NÃO misture conceitos entre elementos diferentes

3. VALIDAÇÃO DE RELEVÂNCIA:
   Antes de incluir um conceito, pergunte-se:
   - "Este termo está REALMENTE relacionado ao elemento?"
   - "Este termo aparece na descrição fornecida?"
   - "Este termo faz sentido para o tipo de elemento no framework ${frameworkType}?"

🔍 EXEMPLOS ESPECÍFICOS POR FRAMEWORK:

${frameworkExamples[frameworkType] || ''}

📋 ESTRATÉGIA DE DECOMPOSIÇÃO E ABSTRAÇÃO:

1. CONCEITOS COMPOSTOS: Sempre separe e abstraia
   - "adultos obesos" → ["adults", "obesity", "obese", "overweight", "adult"]
   - "idosos diabéticos" → ["aged", "diabetes mellitus", "elderly", "diabetic", "geriatrics"]
   - "agendamento online" → ["appointments and schedules", "online systems", "internet", "scheduling", "telemedicine"]
   - "aplicativo móvel" → ["mobile applications", "smartphone", "mHealth", "cell phone", "mobile health"]

2. TECNOLOGIA E INOVAÇÃO: Abstraia para conceitos MeSH existentes
   - "agendamento online via aplicativo" → ["appointments and schedules", "telemedicine", "mobile applications", "internet", "patient portals"]
   - "sistema digital" → ["medical informatics", "computerized systems", "electronic health records", "health information systems"]
   - "presencial tradicional" → ["office visits", "traditional practice", "standard care", "conventional therapy", "routine procedures"]

3. ESPECIFICIDADE GRADUAL: Do específico ao geral
   - Específico: "diabetes mellitus, type 2"
   - Médio: "diabetes mellitus"
   - Geral: "metabolic diseases"

4. CONCEITOS ABSTRATOS: Traduza para termos MeSH
   - "satisfação do usuário" → ["patient satisfaction", "consumer satisfaction", "quality of health care", "patient preference", "treatment satisfaction"]
   - "tempo de espera" → ["waiting lists", "time factors", "appointment wait time", "health services accessibility", "time-to-treatment"]
   - "melhora" → ["improvement", "treatment outcome", "quality improvement", "health care quality", "outcome assessment"]

5. SINÔNIMOS MeSH: Inclua variações aceitas
   - Para tecnologia: ["telemedicine", "eHealth", "mHealth", "digital health", "health information technology"]
   - Para satisfação: ["patient satisfaction", "consumer satisfaction", "patient experience", "quality of care", "patient-centered care"]

❌ ERROS COMUNS A EVITAR:

1. TERMOS MUITO ESPECÍFICOS SEM MESH:
   ❌ "agendamento online via WhatsApp"
   ✅ "appointments and schedules", "mobile applications", "instant messaging"

2. CONCEITOS FORA DO ESCOPO:
   ❌ Colocar "exercise" em P quando P descreve apenas "adultos obesos"
   ✅ Manter apenas conceitos sobre obesidade e adultos

3. GENERALIZAÇÃO EXCESSIVA:
   ❌ Usar apenas "disease" quando a condição é "diabetes tipo 2"
   ✅ Usar termos específicos: "diabetes mellitus, type 2"

4. INVENTAR RELAÇÕES:
   ❌ Adicionar "treatment outcome" em P só porque é um estudo clínico
   ✅ Adicionar apenas se O realmente menciona outcomes

5. IGNORAR TECNOLOGIA:
   ❌ Não abstrair "aplicativo móvel" por ser muito moderno
   ✅ Usar "mobile applications", "mHealth", "smartphone", "telemedicine"

🎯 ELEMENTOS A PROCESSAR:
${JSON.stringify(frameworkElements, null, 2)}

📝 PERGUNTA COMPLETA PARA CONTEXTO:
${fullQuestion}

🚨 FORMATO DE RETORNO OBRIGATÓRIO:

Retorne EXATAMENTE um objeto JSON com:
- As MESMAS chaves fornecidas em frameworkElements
- Cada chave com array de 5-7 termos MeSH relevantes (AUMENTADO para melhor cobertura)
- Termos APENAS em inglês
- Termos que EXISTEM no MeSH ou são abstrações válidas
- Conceitos DIRETAMENTE relacionados ao elemento
- Para conceitos modernos/tecnológicos, use abstrações MeSH apropriadas

VALIDAÇÃO FINAL antes de retornar:
✓ Cada conceito está relacionado ao seu elemento?
✓ Evitei misturar conceitos entre elementos?
✓ Usei termos MeSH em inglês?
✓ Tenho 5-7 termos por elemento?
✓ Abstraí conceitos modernos para termos MeSH existentes?
✓ O JSON está válido?

RETORNE APENAS O JSON, SEM EXPLICAÇÕES.`;

    return prompt;
  } catch (error) {
    console.error('❌ Erro ao gerar prompt:', error);
    throw error;
  }
}

// Função aprimorada para extrair conceitos usando DeepSeek
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
  
  // Usar a nova função generatePrompt
  const prompt = generatePrompt(frameworkElements, fullQuestion, frameworkType);
  console.log('📤 Enviando prompt otimizado para DeepSeek');

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em extração de conceitos médicos para busca em bases de dados. Você extrai termos simples e diretos que existem no MeSH ou são abstrações válidas. SEMPRE processe TODOS os elementos fornecidos com 5-7 conceitos cada. Para conceitos modernos ou tecnológicos, use abstrações apropriadas do MeSH. NUNCA retorne arrays vazios ou com menos de 5 conceitos.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Reduzido para mais consistência
        max_tokens: 2000,
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
      
      // Adicionar conceitos de fallback mais inteligentes
      elementosNaoProcessados.forEach(elem => {
        const texto = frameworkElements[elem];
        if (texto) {
          // Estratégia de fallback mais inteligente
          concepts[elem] = generateFallbackConcepts(texto, elem, frameworkType);
          console.log(`🔧 Adicionando conceitos de fallback para ${elem}: ${JSON.stringify(concepts[elem])}`);
        }
      });
    }
    
    // GARANTIR QUE CADA ELEMENTO TENHA PELO MENOS 5 CONCEITOS
    Object.entries(concepts).forEach(([elem, termos]) => {
      if (termos.length < 5) {
        console.warn(`⚠️ Elemento ${elem} tem apenas ${termos.length} conceitos. Expandindo...`);
        const textoOriginal = frameworkElements[elem];
        
        // Adicionar mais conceitos relacionados
        const additionalConcepts = generateAdditionalConcepts(textoOriginal, elem, frameworkType);
        concepts[elem] = [...new Set([...termos, ...additionalConcepts])].slice(0, 7);
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
    
    // Fallback completo se a IA falhar
    console.log('🔧 Aplicando fallback completo...');
    const fallbackConcepts = {};
    Object.entries(frameworkElements).forEach(([elem, texto]) => {
      fallbackConcepts[elem] = generateFallbackConcepts(texto, elem, frameworkType);
    });
    
    return fallbackConcepts;
  }
}

// Nova função para gerar conceitos de fallback inteligentes
function generateFallbackConcepts(text, element, frameworkType) {
  const concepts = [];
  const lowerText = text.toLowerCase();
  
  // Conceitos básicos baseados no texto
  concepts.push(text);
  
  // Mapeamento de conceitos comuns para MeSH
  const conceptMappings = {
    // Tecnologia
    'online': ['telemedicine', 'internet', 'computers', 'online systems'],
    'aplicativo': ['mobile applications', 'smartphone', 'cell phone', 'software'],
    'móvel': ['mobile health', 'mHealth', 'portable electronic applications'],
    'digital': ['digital health', 'electronic health records', 'computerized'],
    'sistema': ['information systems', 'computer systems', 'software'],
    'agendamento': ['appointments and schedules', 'scheduling', 'time management'],
    
    // Métodos tradicionais
    'presencial': ['office visits', 'face-to-face', 'ambulatory care'],
    'tradicional': ['standard therapy', 'conventional treatment', 'usual care'],
    
    // Outcomes
    'satisfação': ['patient satisfaction', 'consumer satisfaction', 'quality of care'],
    'tempo': ['time factors', 'waiting time', 'time-to-treatment'],
    'espera': ['waiting lists', 'appointment wait time', 'access delay'],
    'melhora': ['improvement', 'treatment outcome', 'health care quality'],
    'reduz': ['reduction', 'decrease', 'minimization'],
    
    // Populações
    'usuário': ['patients', 'health care consumers', 'service users'],
    'paciente': ['patients', 'outpatients', 'ambulatory patients'],
    
    // Serviços
    'consulta': ['office visits', 'medical consultation', 'ambulatory care'],
    'marcação': ['appointments', 'scheduling', 'booking']
  };
  
  // Adicionar conceitos baseados em palavras-chave
  Object.entries(conceptMappings).forEach(([keyword, meshTerms]) => {
    if (lowerText.includes(keyword)) {
      concepts.push(...meshTerms);
    }
  });
  
  // Adicionar conceitos específicos por tipo de elemento
  if (frameworkType === 'SPICE') {
    switch(element) {
      case 'I':
        concepts.push('health care reform', 'organizational innovation', 'quality improvement');
        break;
      case 'C':
        concepts.push('comparative study', 'control groups', 'reference standards');
        break;
      case 'E':
        concepts.push('outcome assessment', 'program evaluation', 'health care evaluation');
        break;
    }
  }
  
  // Remover duplicatas e limitar a 7 conceitos
  return [...new Set(concepts)].slice(0, 7);
}

// Nova função para gerar conceitos adicionais
function generateAdditionalConcepts(text, element, frameworkType) {
  const concepts = [];
  
  // Adicionar conceitos genéricos relacionados
  concepts.push(
    'health services',
    'health care delivery',
    'health care quality',
    'health services accessibility',
    'patient care'
  );
  
  return concepts;
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