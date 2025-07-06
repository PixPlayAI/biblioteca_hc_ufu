// lib/frameworkMappings.js

// Mapeamento de elementos completos para suas siglas
export const elementMappings = {
  // PICO, PICOT, PICOS
  population: 'P',
  intervention: 'I',
  comparison: 'C',
  outcome: 'O',
  timeframe: 'T',
  studyDesign: 'S',
  
  // PEO, PECO
  exposure: 'E',
  
  // PCC
  concept: 'C',
  context: 'C',
  
  // SPIDER
  sample: 'S',
  phenomenonOfInterest: 'PI',
  design: 'D',
  evaluation: 'E',
  researchType: 'R',
  
  // PIRD
  indexTest: 'I',
  referenceTest: 'R',
  diagnosis: 'D',
  
  // CoCoPop
  condition: 'Co',
  // context já mapeado acima
  // population já mapeado acima
  
  // SPICE
  setting: 'S',
  perspective: 'P',
  // intervention, comparison, evaluation já mapeados
  
  // ECLIPSE
  expectation: 'E',
  clientGroup: 'C',
  location: 'L',
  impact: 'I',
  professionals: 'P',
  service: 'SE',
  
  // BeHEMoTh
  behavior: 'Be',
  healthContext: 'HE',
  exclusions: 'Mo',
  modelsOrTheories: 'Th'
};

// Mapeamento reverso - de siglas para elementos
export const reverseMappings = {
  // PICO, PICOT, PICOS
  'P': 'population',
  'I': 'intervention',
  'C': 'comparison',
  'O': 'outcome',
  'T': 'timeframe',
  'S': 'studyDesign',
  
  // PEO, PECO
  'E': 'exposure',
  
  // SPIDER
  'PI': 'phenomenonOfInterest',
  'D': 'design',
  'R': 'researchType',
  
  // CoCoPop
  'Co': 'condition',
  'Pop': 'population',
  
  // SPICE (alguns já mapeados acima)
  
  // ECLIPSE
  'L': 'location',
  'SE': 'service',
  
  // BeHEMoTh
  'Be': 'behavior',
  'HE': 'healthContext',
  'Mo': 'exclusions',
  'Th': 'modelsOrTheories'
};

// Mapeamento completo de labels por framework
export const frameworkLabels = {
  PICO: {
    P: 'População',
    I: 'Intervenção',
    C: 'Comparação',
    O: 'Desfecho'
  },
  PICOT: {
    P: 'População',
    I: 'Intervenção',
    C: 'Comparação',
    O: 'Desfecho',
    T: 'Tempo'
  },
  PICOS: {
    P: 'População',
    I: 'Intervenção',
    C: 'Comparação',
    O: 'Desfecho',
    S: 'Desenho do Estudo'
  },
  PEO: {
    P: 'População',
    E: 'Exposição',
    O: 'Desfecho'
  },
  PECO: {
    P: 'População',
    E: 'Exposição',
    C: 'Comparação',
    O: 'Desfecho'
  },
  PCC: {
    P: 'População',
    C: 'Conceito',
    C2: 'Contexto' // Usando C2 para diferenciar
  },
  SPIDER: {
    S: 'Amostra',
    PI: 'Fenômeno de Interesse',
    D: 'Design',
    E: 'Avaliação',
    R: 'Tipo de Pesquisa'
  },
  PIRD: {
    P: 'População',
    I: 'Teste Índice',
    R: 'Teste de Referência',
    D: 'Diagnóstico'
  },
  CoCoPop: {
    Co: 'Condição',
    Co2: 'Contexto', // Usando Co2 para diferenciar
    Pop: 'População'
  },
  SPICE: {
    S: 'Ambiente/Contexto',
    P: 'Perspectiva',
    I: 'Intervenção',
    C: 'Comparação',
    E: 'Avaliação'
  },
  ECLIPSE: {
    E: 'Expectativa',
    C: 'Grupo de Clientes',
    L: 'Local',
    I: 'Impacto',
    P: 'Profissionais',
    SE: 'Serviço'
  },
  BeHEMoTh: {
    Be: 'Comportamento',
    HE: 'Contexto de Saúde',
    Mo: 'Exclusões',
    Th: 'Modelos ou Teorias'
  }
};

// Função melhorada para obter label em português baseado na sigla e framework
export function getElementLabel(sigla, framework) {
  // Se o framework não existir, retorna a sigla
  if (!framework || !frameworkLabels[framework]) {
    console.warn(`Framework não reconhecido: ${framework}`);
    return sigla;
  }
  
  // Busca o label específico do framework
  const frameworkSpecificLabels = frameworkLabels[framework];
  
  // Retorna o label específico ou a sigla se não encontrar
  return frameworkSpecificLabels[sigla] || sigla;
}

// lib/frameworkMappings.js

// Adicionar mapeamento de siglas por framework (mais específico)
export const frameworkElementMapping = {
  PICO: {
    P: 'population',
    I: 'intervention', 
    C: 'comparison',
    O: 'outcome'
  },
  PICOT: {
    P: 'population',
    I: 'intervention',
    C: 'comparison', 
    O: 'outcome',
    T: 'timeframe'
  },
  PICOS: {
    P: 'population',
    I: 'intervention',
    C: 'comparison',
    O: 'outcome',
    S: 'studyDesign'
  },
  PEO: {
    P: 'population',
    E: 'exposure',
    O: 'outcome'
  },
  PECO: {
    P: 'population',
    E: 'exposure',
    C: 'comparison',
    O: 'outcome'
  },
  PCC: {
    P: 'population',
    C: 'concept',
    C2: 'context'
  },
  SPIDER: {
    S: 'sample',
    PI: 'phenomenonOfInterest',
    D: 'design',
    E: 'evaluation',
    R: 'researchType'
  },
  PIRD: {
    P: 'population',
    I: 'indexTest',
    R: 'referenceTest',
    D: 'diagnosis'
  },
  CoCoPop: {
    Co: 'condition',
    Co2: 'context',
    Pop: 'population'
  },
  SPICE: {
    S: 'setting',
    P: 'perspective',
    I: 'intervention',
    C: 'comparison',
    E: 'evaluation'
  },
  ECLIPSE: {
    E: 'expectation',
    C: 'clientGroup',
    L: 'location',
    I: 'impact',
    P: 'professionals',
    SE: 'service'
  },
  BeHEMoTh: {
    Be: 'behavior',
    HE: 'healthContext',
    Mo: 'exclusions',
    Th: 'modelsOrTheories'
  }
};

// Função para obter a sigla correta baseada no elemento e framework
export function getElementSigla(elementKey, framework) {
  const mapping = frameworkElementMapping[framework];
  if (!mapping) return elementKey;
  
  // Procura qual sigla corresponde ao elemento
  for (const [sigla, element] of Object.entries(mapping)) {
    if (element === elementKey) return sigla;
  }
  
  // Se não encontrar, retorna a chave em maiúscula
  return elementKey.toUpperCase();
}

// Atualizar a função convertToMeshFormat

// Atualizar a função convertToMeshFormat
export function convertToMeshFormat(researchData) {
  console.log('🔄 convertToMeshFormat - INÍCIO da conversão');
  console.log('📊 Framework:', researchData.format);
  
  const convertedElements = {};
  const frameworkMapping = frameworkElementMapping[researchData.format] || {};
  
  // Pega os elementos explícitos e suas descrições
  const elements = researchData.elements?.explicit || {};
  const descriptions = researchData.elementDescriptions?.explicit || {};
  
  console.log('🔍 Elementos originais:', elements);
  console.log('📝 Mapeamento do framework:', frameworkMapping);
  
  // Tratamento especial para ECLIPSE
  if (researchData.format === 'ECLIPSE') {
    // Verificar se há elementos com a sigla S que deveriam ser SE
    if (elements['S'] && !elements['SE']) {
      elements['SE'] = elements['S'];
      delete elements['S'];
    }
    if (descriptions['S'] && !descriptions['SE']) {
      descriptions['SE'] = descriptions['S'];
      delete descriptions['S'];
    }
  }
  
  // Para cada elemento do framework - PROCESSAR APENAS ELEMENTOS VÁLIDOS
  const validElements = frameworkElementMapping[researchData.format] || {};
  const validKeys = new Set(Object.keys(validElements));
  const validElementNames = new Set(Object.values(validElements));
  
  Object.entries(elements).forEach(([key, value]) => {
    // Verificar se a chave é válida para este framework
    if (!validKeys.has(key) && !validElementNames.has(key)) {
      console.warn(`⚠️ Ignorando elemento "${key}" - não é válido para ${researchData.format}`);
      return;
    }
    
    let sigla = key;
    let descricao = value || descriptions[key] || '';
    
    // Se a chave já é uma sigla (está no mapeamento do framework)
    if (frameworkMapping[key]) {
      sigla = key;
      console.log(`✅ Usando sigla direta: ${sigla} = "${descricao}"`);
    } else {
      // Se é um nome de elemento, busca a sigla correspondente
      sigla = getElementSigla(key, researchData.format);
      console.log(`🔄 Convertendo ${key} para sigla ${sigla}`);
    }
    
    if (sigla && descricao) {
      convertedElements[sigla] = descricao;
    }
  });
  
  const resultado = {
    format: researchData.format,
    question: researchData.question,
    elements: {
      explicit: convertedElements
    }
  };
  
  console.log('🎯 Resultado final:', resultado);
  return resultado;
}

// Função para obter a cor do elemento baseado na sigla e posição
export function getElementColor(sigla, index, framework) {
  // Cores específicas por framework e elemento
  const colorMappings = {
    ECLIPSE: {
      E: 'from-purple-500 to-purple-600',
      C: 'from-orange-500 to-orange-600',
      L: 'from-teal-500 to-teal-600',
      I: 'from-blue-500 to-blue-600',
      P: 'from-green-500 to-green-600',
      SE: 'from-red-500 to-red-600'
    },
    PICO: {
      P: 'from-blue-500 to-blue-600',
      I: 'from-green-500 to-green-600',
      C: 'from-orange-500 to-orange-600',
      O: 'from-purple-500 to-purple-600'
    },
    // Adicione mais frameworks conforme necessário
  };
  
  // Se houver mapeamento específico para o framework, use-o
  if (framework && colorMappings[framework] && colorMappings[framework][sigla]) {
    return colorMappings[framework][sigla];
  }
  
  // Caso contrário, use cores padrão baseadas no índice
  const defaultColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-teal-500 to-teal-600'
  ];
  
  return defaultColors[index % defaultColors.length];
}