import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { generateScenarioContent } from '../../lib/api';
import FeedbackModal from '../FeedbackModal';
import { Bold, Hourglass, Globe } from 'lucide-react';
import FloatingActionButtons from '../FloatingActionButtons';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';

// Adicionar após os outros imports
import MeshSearch from '../MeshSearch';
import { convertToMeshFormat } from '../../lib/frameworkMappings';

// Traduções atualizadas com todos os elementos dos novos frameworks
const translations = {
  // PICO, PICOT, PICOS
  population: { term: 'Population/Patient', translation: 'População/Paciente' },
  intervention: { term: 'Intervention', translation: 'Intervenção' },
  comparison: { term: 'Comparison', translation: 'Comparação' },
  outcome: { term: 'Outcome', translation: 'Desfecho' },
  timeframe: { term: 'Time', translation: 'Tempo' },
  studyDesign: { term: 'Study Design', translation: 'Desenho do Estudo' },

  // PEO, PECO
  exposure: { term: 'Exposure', translation: 'Exposição' },

  // PCC
  concept: { term: 'Concept', translation: 'Conceito' },
  context: { term: 'Context', translation: 'Contexto' },

  // SPIDER
  sample: { term: 'Sample', translation: 'Amostra' },
  phenomenonOfInterest: { term: 'Phenomenon of Interest', translation: 'Fenômeno de Interesse' },
  design: { term: 'Design', translation: 'Design' },
  evaluation: { term: 'Evaluation', translation: 'Avaliação' },
  researchType: { term: 'Research Type', translation: 'Tipo de Pesquisa' },

  // PIRD
  indexTest: { term: 'Index Test', translation: 'Teste Índice' },
  referenceTest: { term: 'Reference Test', translation: 'Teste de Referência' },
  diagnosis: { term: 'Diagnosis', translation: 'Diagnóstico' },

  // CoCoPop
  condition: { term: 'Condition', translation: 'Condição' },

  // SPICE
  setting: { term: 'Setting', translation: 'Ambiente/Contexto' },
  perspective: { term: 'Perspective', translation: 'Perspectiva' },

  // ECLIPSE
  expectation: { term: 'Expectation', translation: 'Expectativa' },
  clientGroup: { term: 'Client Group', translation: 'Grupo de Clientes' },
  location: { term: 'Location', translation: 'Local' },
  impact: { term: 'Impact', translation: 'Impacto' },
  professionals: { term: 'Professionals', translation: 'Profissionais' },
  service: { term: 'Service', translation: 'Serviço' },

  // BeHEMoTh
  behavior: { term: 'Behavior', translation: 'Comportamento' },
  healthContext: { term: 'Health Context', translation: 'Contexto de Saúde' },
  exclusions: { term: 'Exclusions', translation: 'Exclusões' },
  modelsOrTheories: { term: 'Models or Theories', translation: 'Modelos ou Teorias' },
};

// Função auxiliar para normalizar elementos

// Função auxiliar para garantir que todos os elementos do formato estejam presentes
// Função auxiliar para garantir que todos os elementos do formato estejam presentes
const ensureAllFormatElements = (format, elements) => {
  console.log('Ensuring all elements for format:', format);
  console.log('Original elements:', elements);

  // Mapeamento completo de siglas para elementos por framework
  const frameworkMappings = {
    PICO: {
      'P': 'population',
      'I': 'intervention',
      'C': 'comparison',
      'O': 'outcome'
    },
    PICOT: {
      'P': 'population',
      'I': 'intervention',
      'C': 'comparison',
      'O': 'outcome',
      'T': 'timeframe'
    },
    PICOS: {
      'P': 'population',
      'I': 'intervention',
      'C': 'comparison',
      'O': 'outcome',
      'S': 'studyDesign'
    },
    PEO: {
      'P': 'population',
      'E': 'exposure',
      'O': 'outcome'
    },
    PECO: {
      'P': 'population',
      'E': 'exposure',
      'C': 'comparison',
      'O': 'outcome'
    },
    PCC: {
      'P': 'population',
      'C': 'concept',
      'C2': 'context'
    },
    SPIDER: {
      'S': 'sample',
      'PI': 'phenomenonOfInterest',
      'D': 'design',
      'E': 'evaluation',
      'R': 'researchType'
    },
    PIRD: {
      'P': 'population',
      'I': 'indexTest',
      'R': 'referenceTest',
      'D': 'diagnosis'
    },
    CoCoPop: {
      'Co': 'condition',
      'Co2': 'context',
      'Pop': 'population'
    },
    SPICE: {
      'S': 'setting',
      'P': 'perspective',
      'I': 'intervention',
      'C': 'comparison',
      'E': 'evaluation'
    },
    ECLIPSE: {
      'E': 'expectation',
      'C': 'clientGroup',
      'L': 'location',
      'I': 'impact',
      'P': 'professionals',
      'SE': 'service'
    },
    BeHEMoTh: {
      'Be': 'behavior',
      'HE': 'healthContext',
      'Mo': 'exclusions',
      'Th': 'modelsOrTheories'
    }
  };

  // Processar elementos baseado no framework
  const processedElements = {};
  const mapping = frameworkMappings[format];
  
  if (mapping) {
    // Criar um mapa reverso também (de elemento para sigla)
    const reverseMapping = {};
    Object.entries(mapping).forEach(([sigla, elemento]) => {
      reverseMapping[elemento] = sigla;
    });
    
    // Processar APENAS elementos que pertencem ao framework atual
    Object.entries(elements).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'Não especificado') {
        // Se a chave é uma sigla válida para este framework
        if (mapping[key]) {
          processedElements[mapping[key]] = value;
          processedElements[key] = value;
        }
        // Se a chave é um elemento completo válido para este framework
        else if (reverseMapping[key]) {
          processedElements[reverseMapping[key]] = value;
          processedElements[key] = value;
        }
        // NÃO adicionar elementos que não pertencem ao framework
      }
    });
    
    // Adicionar elementos faltantes como strings vazias
    Object.entries(mapping).forEach(([sigla, elemento]) => {
      if (!processedElements[sigla]) {
        processedElements[sigla] = processedElements[elemento] || '';
      }
      if (!processedElements[elemento]) {
        processedElements[elemento] = processedElements[sigla] || '';
      }
    });
  }

  // Tratamento especial para BeHEMoTh
  if (format === 'BeHEMoTh') {
    const behemothElements = { ...processedElements };
    
    // Mapear siglas para nomes completos
    const siglaMapping = {
      'Be': 'behavior',
      'HE': 'healthContext',
      'Mo': 'exclusions',
      'Th': 'modelsOrTheories',
      'B': 'behavior',
      'H': 'healthContext',
      'E': 'exclusions',
      'M': 'modelsOrTheories'
    };
    
    // Verificar se há elementos com siglas e mapeá-los
    Object.entries(elements).forEach(([key, value]) => {
      if (siglaMapping[key] && value) {
        behemothElements[siglaMapping[key]] = value;
        // Manter também a sigla original
        behemothElements[key] = value;
      }
    });
    
    // Garantir que todos os elementos obrigatórios existam
    const requiredElements = ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'];
    requiredElements.forEach(elem => {
      if (!behemothElements[elem]) {
        // Procurar valor em siglas
        for (const [sigla, elemName] of Object.entries(siglaMapping)) {
          if (elemName === elem && elements[sigla]) {
            behemothElements[elem] = elements[sigla];
            break;
          }
        }
      }
    });
    
    console.log('BeHEMoTh normalized elements:', behemothElements);
    return behemothElements;
  }

  // NÃO APLICAR normalização genérica - apenas retornar elementos processados
  console.log('Final elements:', processedElements);
  return processedElements;
};

// Atualizar a função getOrderedElements para usar as siglas corretas
const getOrderedElements = (format, elements) => {
  console.log('Getting ordered elements for format:', format);
  console.log('Input elements:', elements);

  const formatOrder = {
    // PICO
    PICO: {
      order: ['population', 'intervention', 'comparison', 'outcome'],
      letters: {
        population: 'P',
        intervention: 'I',
        comparison: 'C',
        outcome: 'O',
      },
    },

    // PICOT
    PICOT: {
      order: ['population', 'intervention', 'comparison', 'outcome', 'timeframe'],
      letters: {
        population: 'P',
        intervention: 'I',
        comparison: 'C',
        outcome: 'O',
        timeframe: 'T',
      },
    },

    // PICOS
    PICOS: {
      order: ['population', 'intervention', 'comparison', 'outcome', 'studyDesign'],
      letters: {
        population: 'P',
        intervention: 'I',
        comparison: 'C',
        outcome: 'O',
        studyDesign: 'S',
      },
    },

    // PEO
    PEO: {
      order: ['population', 'exposure', 'outcome'],
      letters: {
        population: 'P',
        exposure: 'E',
        outcome: 'O',
      },
    },

    // PECO
    PECO: {
      order: ['population', 'exposure', 'comparison', 'outcome'],
      letters: {
        population: 'P',
        exposure: 'E',
        comparison: 'C',
        outcome: 'O',
      },
    },

    // PCC
    PCC: {
      order: ['population', 'concept', 'context'],
      letters: {
        population: 'P',
        concept: 'C',
        context: 'C',
      },
    },

    // SPIDER
    SPIDER: {
      order: ['sample', 'phenomenonOfInterest', 'design', 'evaluation', 'researchType'],
      letters: {
        sample: 'S',
        phenomenonOfInterest: 'PI',
        design: 'D',
        evaluation: 'E',
        researchType: 'R',
      },
    },

    // PIRD
    PIRD: {
      order: ['population', 'indexTest', 'referenceTest', 'diagnosis'],
      letters: {
        population: 'P',
        indexTest: 'I',
        referenceTest: 'R',
        diagnosis: 'D',
      },
    },

    // CoCoPop
    CoCoPop: {
      order: ['condition', 'context', 'population'],
      letters: {
        condition: 'Co',
        context: 'Co',
        population: 'Pop',
      },
    },

    // SPICE
    SPICE: {
      order: ['setting', 'perspective', 'intervention', 'comparison', 'evaluation'],
      letters: {
        setting: 'S',
        perspective: 'P',
        intervention: 'I',
        comparison: 'C',
        evaluation: 'E',
      },
    },

    // ECLIPSE
    ECLIPSE: {
      order: ['expectation', 'clientGroup', 'location', 'impact', 'professionals', 'service'],
      letters: {
        expectation: 'E',
        clientGroup: 'C',
        location: 'L',
        impact: 'I',
        professionals: 'P',
        service: 'SE',
      },
    },

    // BeHEMoTh - CORRIGIR AS SIGLAS
    BeHEMoTh: {
      order: ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'],
      letters: {
        behavior: 'Be',
        healthContext: 'HE',
        exclusions: 'Mo',
        modelsOrTheories: 'Th',
      },
    },

    // Sem sigla (genérico)
    'sem sigla': {
      order: [],
      letters: {},
    },
  };

  const formatConfig = formatOrder[format] || formatOrder['sem sigla'];
  if (!formatConfig) return [];

  const ordered = formatConfig.order.map((key) => ({
    key,
    letter: formatConfig.letters[key],
    value: elements[key] || '',
  }));

  console.log('Ordered elements:', ordered);
  return ordered;
};

// Função atualizada para validar a resposta
export const validateResponse = (response) => {
  console.log('Validating response:', response);

  // Se for BeHEMoTh, log especial
  if (response.finalResult?.format === 'BeHEMoTh') {
    console.log('BeHEMoTh detected - checking elements:', response.finalResult.elements);
  }

  const requiredFields = ['quality', 'analysis', 'nextQuestion', 'canGenerateFinal'];

  // Validar estrutura básica
  for (const field of requiredFields) {
    if (!(field in response)) {
      console.error(`Missing required field: ${field}`);
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Garantir que o campo 'quality' esteja presente e seja um número válido
  if (typeof response.quality !== 'number') {
    console.warn(`Quality is missing or not a number. Defaulting to 0.`);
    response.quality = 0; // Defina um valor padrão adequado
  }

  // Garantir que todos os elementos específicos do formato estejam presentes
  if (response.finalResult?.format) {
    console.log('Format detected:', response.finalResult.format);
    const elements = response.finalResult.elements?.explicit || {};
    console.log('Original elements:', elements);

    response.finalResult.elements.explicit = ensureAllFormatElements(
      response.finalResult.format,
      elements
    );
    console.log('Updated elements:', response.finalResult.elements.explicit);
  }

  return response;
};

// Componente de indicador de qualidade
const QualityIndicator = ({ score }) => {
  // Garantir que score seja um número
  const validScore = typeof score === 'number' ? score : 0;

  // Determinar a cor com base no score
  let indicatorColor = 'bg-green-500'; // Padrão: verde

  if (validScore < 4) {
    indicatorColor = 'bg-red-500';
  } else if (validScore < 7) {
    indicatorColor = 'bg-yellow-500';
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Qualidade da Resposta</span>
        <span className="text-sm font-bold">{validScore.toFixed(1)}/10</span>
      </div>
      <Progress value={validScore * 10} className="h-2" indicatorClassName={indicatorColor} />
    </div>
  );
};

QualityIndicator.propTypes = {
  score: PropTypes.number.isRequired,
};

// Componente para exibir cada elemento
const ElementDisplay = ({ letter, term, translation, description }) => (
  <div className="element-display-item">
    <span className="acronym-letter">{letter}</span>
    <div>
      <div className="font-medium">
        {term} <span className="text-muted-foreground">({translation})</span>
      </div>
      <p className="acronym-description mt-1">{description || 'Não especificado'}</p>
    </div>
  </div>
);

ElementDisplay.propTypes = {
  letter: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  translation: PropTypes.string.isRequired,
  description: PropTypes.string,
};

ElementDisplay.defaultProps = {
  description: '',
};

// Componente para exibir elementos detalhados
// Componente para exibir elementos detalhados - CORRIGIDO
// Componente para exibir elementos detalhados - CORRIGIDO
const DetailedElements = ({ elements, format, variant = 'default', descriptions = {} }) => {
  console.log('DetailedElements Input:', { elements, format, variant, descriptions });

  // Criar um objeto que combina elementos e descrições
  const combinedElements = {};
  
  // Primeiro, adicionar todos os elementos
  Object.entries(elements).forEach(([key, value]) => {
    combinedElements[key] = value;
  });
  
  // Depois, adicionar descrições se não houver valor no elemento
  Object.entries(descriptions).forEach(([key, value]) => {
    if (!combinedElements[key] || combinedElements[key] === 'Não especificado' || combinedElements[key] === '') {
      combinedElements[key] = value;
    }
  });

  // Obter elementos normalizados - SEM adicionar elementos extras
  const normalizedElements = ensureAllFormatElements(format, combinedElements);
  const orderedElements = getOrderedElements(format, normalizedElements);


  // Usar o valor do elemento normalizado ou a descrição
  const elementsWithDescriptions = orderedElements.map(({ key, letter, value }) => {
    // Primeiro tenta usar o valor do elemento
    let description = value;

    // Se não tiver valor, tenta a descrição
    if (!description || description === '' || description === 'Não especificado') {
      description = descriptions[key] || descriptions[letter] || 'Não especificado';
    }

    return {
      key,
      letter,
      description,
    };
  });

  if (variant === 'formatted') {
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Elementos do {format}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {elementsWithDescriptions.map(({ key, letter, description }) => (
            <ElementDisplay
              key={key}
              letter={letter}
              term={translations[key]?.term || key}
              translation={translations[key]?.translation || key}
              description={description}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {elementsWithDescriptions.map(({ key, letter, description }) => (
        <div key={key} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 min-w-[2rem]">
              {letter}
            </span>
            <div>
              <span className="font-bold">{translations[key]?.translation || key}:</span>{' '}
              {description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

DetailedElements.propTypes = {
  elements: PropTypes.object.isRequired,
  format: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'formatted']),
  descriptions: PropTypes.object, // Adicionando PropType para descriptions
};

DetailedElements.defaultProps = {
  variant: 'default',
  descriptions: {}, // Adicionando valor padrão para descriptions
};

// Componente AIAnalysis atualizado
const AIAnalysis = ({ analysis }) => {
  if (!analysis?.identifiedElements) return null;

  const normalizedElements = ensureAllFormatElements(
    analysis.suggestedFormat,
    analysis.identifiedElements
  );
  const orderedElements = getOrderedElements(analysis.suggestedFormat, normalizedElements);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Status da sua Pergunta de Pesquisa
          </h3>
          <div className="space-y-4">
            {orderedElements.map(({ key, letter, value }) => (
              <ElementDisplay
                key={key}
                letter={letter}
                term={translations[key]?.term || key}
                translation={translations[key]?.translation || key}
                description={value || 'Não especificado'}
              />
            ))}
          </div>
        </div>
        {analysis.observations && (
          <div>
            <h4 className="font-medium text-primary foreground mb-2">Próximos Passos:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.observations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Definição completa dos PropTypes para o componente AIAnalysis
AIAnalysis.propTypes = {
  analysis: PropTypes.shape({
    identifiedElements: PropTypes.objectOf(PropTypes.string),
    suggestedFormat: PropTypes.string,
    observations: PropTypes.string,
  }).isRequired,
};

// Componente ConversationHistory atualizado
const ConversationHistory = ({ conversations }) => (
  <div className="space-y-4">
    {conversations.map((conv, index) => (
      <Card key={index}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-foreground">{conv.question}</p>
              {conv.context && <p className="text-sm text-muted-foreground mt-1">{conv.context}</p>}
            </div>
            <div className="pl-4 border-l border-primary foreground">
              <p className="text-foreground">{conv.answer}</p>
              <QualityIndicator score={conv.quality} />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

ConversationHistory.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      context: PropTypes.string,
      answer: PropTypes.string.isRequired,
      quality: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Componente FinalResult atualizado

// Componente FinalResult atualizado
const FinalResult = ({ result, conversations, onReset, isDark }) => {
  console.log('FinalResult rendering with:', result);
  console.log('Result elements:', result.elements);
  console.log('Result descriptions:', result.elementDescriptions);

  // Estado para controlar a visibilidade do MeshSearch
  const [showMeshSearch, setShowMeshSearch] = useState(false);

  // Garantir que estamos usando elementos explícitos se disponíveis, caso contrário, implícitos
  const elementsToUse = result.elements?.explicit || result.elements?.implicit || {};
  const descriptionsToUse =
    result.elementDescriptions?.explicit || result.elementDescriptions?.implicit || {};

  // Preparar dados para o MeshSearch no formato esperado
  const meshData = convertToMeshFormat(result);

  console.log('✅ Dados convertidos para MeshSearch:', meshData);

  return (
    <div className="space-y-8">
      <ConversationHistory conversations={conversations} />
      <Card>
        <CardHeader>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Pergunta de Pesquisa Estruturada</h2>
            {result.format && (
              <>
                <p className="text-muted-foreground">Formato: {result.format}</p>
                <DetailedElements
                  elements={elementsToUse}
                  format={result.format}
                  variant="formatted"
                  descriptions={descriptionsToUse}
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <FloatingActionButtons
            variant="final"
            isDark={isDark}
            className="mb-8"
            conversations={conversations}
            finalResult={result}
          />
          <div className="final-presentation-container">
            <p className="text-lg text-center acronym-letter font-bold">{result.question}</p>
          </div>
          {result.explanation && (
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">Explicação Detalhada:</h3>
              <p className="text-muted-foreground">{result.explanation}</p>
            </div>
          )}

          {/* Botão para buscar termos MeSH */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowMeshSearch(!showMeshSearch)}
              className={cn(
                'px-6 py-3 rounded-lg transition-all',
                'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
                'hover:from-blue-600 hover:to-blue-700',
                'shadow-md hover:shadow-lg transform hover:scale-105',
                'flex items-center gap-2 font-medium'
              )}
            >
              <Globe className="w-5 h-5" />
              {showMeshSearch ? 'Ocultar Busca MeSH' : 'Pesquisar Termos MeSH'}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-primary foreground text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
            >
              Iniciar Nova Pesquisa
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Componente MeshSearch integrado */}
      {showMeshSearch && (
        <div className="mt-8 animate-fadeIn">
          <MeshSearch researchData={meshData} isDark={isDark} />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

FinalResult.propTypes = {
  result: PropTypes.shape({
    format: PropTypes.string,
    question: PropTypes.string.isRequired,
    explanation: PropTypes.string,
    elements: PropTypes.shape({
      explicit: PropTypes.object,
      implicit: PropTypes.object,
    }),
    elementDescriptions: PropTypes.shape({
      explicit: PropTypes.object,
      implicit: PropTypes.object,
    }),
  }).isRequired,
  conversations: PropTypes.array.isRequired,
  onReset: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};
// Componente principal ResearchAssistant atualizado
const ResearchAssistant = ({ isDark }) => {
  const [suggestionMode, setSuggestionMode] = useState(false);
  const [suggestedElement, setSuggestedElement] = useState(null);
  const [questionRepetitions, setQuestionRepetitions] = useState(new Map());

  const [conversations, setConversations] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nextQuestion, setNextQuestion] = useState({
    text: 'Qual é o principal problema ou população que você pretende estudar?',
    context:
      'Descreva o foco do seu estudo (ex: uma condição específica, grupo populacional ou situação clínica)',
  });

  useEffect(() => {
    const shouldReset = sessionStorage.getItem('shouldResetForm');
    if (shouldReset) {
      sessionStorage.removeItem('shouldResetForm');
      setConversations([]);
      setCurrentInput('');
      setCurrentAnalysis(null);
      setFinalResult(null);
      setNextQuestion({
        text: 'Qual é o principal problema ou população que você pretende estudar?',
        context:
          'Descreva o foco do seu estudo (ex: uma condição específica, grupo populacional ou situação clínica)',
      });
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 100);
    }
  }, []);

  // Função para contar repetições de perguntas similares
  const updateQuestionRepetitions = (question) => {
    setQuestionRepetitions((prev) => {
      const newMap = new Map(prev);
      const count = (newMap.get(question) || 0) + 1;
      newMap.set(question, count);
      return newMap;
    });
  };

  // Função modificada handleSubmit
  const handleSubmit = async () => {
    if (!currentInput.trim()) return;
    setIsLoading(true);

    try {
      // Atualizar contagem de repetições
      updateQuestionRepetitions(nextQuestion.text);

      const response = await generateScenarioContent({
        history: conversations,
        currentInput,
        currentStep: conversations.length,
        suggestionMode,
        suggestedElement,
      });

      // Validar a resposta recebida
      const validatedResponse = validateResponse(response);

      const newConversation = {
        question: nextQuestion.text,
        context: nextQuestion.context,
        answer: currentInput,
        quality: validatedResponse.quality,
        analysis: validatedResponse.analysis,
      };

      setConversations([...conversations, newConversation]);
      setCurrentInput('');
      setCurrentAnalysis(validatedResponse.analysis);

      // Verificar se devemos entrar em modo de sugestão
      if (validatedResponse.analysis?.suggestionsNeeded) {
        setSuggestionMode(true);
        setSuggestedElement(validatedResponse.analysis.suggestionsFor);
      } else {
        setSuggestionMode(false);
        setSuggestedElement(null);
      }

      if (validatedResponse.canGenerateFinal && validatedResponse.finalResult) {
        setFinalResult(validatedResponse.finalResult);

        // Aguardar um momento para o DOM renderizar o resultado final
        setTimeout(() => {
          // Encontrar o elemento da pergunta de pesquisa
          const questionElement = document.querySelector('.final-presentation-container');
          if (questionElement) {
            const rect = questionElement.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            // Disparar confetti por 1 segundos
            const duration = 1 * 1000; // 1 segundos
            const animationEnd = Date.now() + duration;

            const colors = [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#EC4899',
              '#14B8A6',
            ];

            const defaults = {
              startVelocity: 45,
              spread: 360,
              ticks: 200, // Mais visível
              zIndex: 9999,
              gravity: 0.5,
              scalar: 1.2, // Partículas maiores
              colors: colors,
              disableForReducedMotion: false,
              useWorker: true,
            };

            function randomInRange(min, max) {
              return Math.random() * (max - min) + min;
            }

            // Primeiro burst grande do centro
            confetti({
              ...defaults,
              particleCount: 150,
              spread: 100,
              origin: { x, y },
              startVelocity: 60,
              scalar: 1.5,
            });

            // Confetti contínuo
            const interval = setInterval(function () {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              const particleCount = 80 * (timeLeft / duration);

              // Jorrar do ponto central
              confetti({
                ...defaults,
                particleCount: Math.floor(particleCount),
                spread: randomInRange(50, 70),
                origin: { x, y },
                startVelocity: randomInRange(35, 55),
                scalar: randomInRange(0.8, 1.4),
              });

              // Adicionar alguns fogos laterais para efeito
              if (Math.random() > 0.5) {
                confetti({
                  ...defaults,
                  particleCount: Math.floor(particleCount * 0.3),
                  spread: 120,
                  origin: { x: x - 0.1, y },
                  angle: 60,
                  startVelocity: randomInRange(25, 40),
                });

                confetti({
                  ...defaults,
                  particleCount: Math.floor(particleCount * 0.3),
                  spread: 120,
                  origin: { x: x + 0.1, y },
                  angle: 120,
                  startVelocity: randomInRange(25, 40),
                });
              }
            }, 150);
          }
        }, 100);
      }
      // Exibir FeedbackModal apenas se a qualidade for muito baixa
      if (validatedResponse.quality < 3) {
        setErrorMessage(
          'A resposta fornecida está com qualidade muito baixa. Por favor, tente novamente.'
        );
        setIsFeedbackModalOpen(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setIsFeedbackModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização condicional para sugestões
  const renderQuestionContent = () => {
    if (suggestionMode) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Sugestão para {suggestedElement}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Com base no seu contexto, estas são algumas opções que poderiam se adequar ao seu
            estudo. Você pode escolher uma delas, propor uma alternativa ou negar a sugestão.
          </p>
          {nextQuestion.suggestions?.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setCurrentInput(suggestion)}
              className="block w-full text-left p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
                      transition-colors mb-2"
            >
              {suggestion}
            </button>
          ))}
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-lg border dark:border-gray-700 mt-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Digite sua resposta ou escolha uma sugestão acima..."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2">{nextQuestion.text}</h3>
        {nextQuestion.context && (
          <p className="text-sm text-muted-foreground mb-4">{nextQuestion.context}</p>
        )}
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="w-full min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="Digite sua resposta..."
          autoFocus
        />
      </div>
    );
  };

  const handleReset = () => {
    sessionStorage.setItem('shouldResetForm', 'true');
    setIsFeedbackModalOpen(false);
    window.location.reload();
  };

  if (finalResult) {
    return (
      <FinalResult
        result={finalResult}
        conversations={conversations}
        onReset={handleReset}
        isDark={isDark}
      />
    );
  }

  return (
    <div className={`max-w-[1200px] mx-auto p-2 sm:p-4 text-primary-foreground`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          <ConversationHistory conversations={conversations} />
          <Card>
            <CardContent className="p-3 sm:p-6">
              {renderQuestionContent()}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-4">
                <FloatingActionButtons
                  variant="inline"
                  isDark={isDark}
                  className="w-full sm:w-auto"
                  conversations={conversations}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !currentInput.trim()}
                  className={`btn-enviar w-full sm:w-auto ${
                    isLoading || !currentInput.trim() ? 'disabled' : ''
                  } justify-center`} // Adicionado justify-center aqui
                >
                  {isLoading ? (
                    <>
                      <Hourglass className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-16 z-10 space-y-4">
            {currentAnalysis && <AIAnalysis analysis={currentAnalysis} />}
            <FloatingActionButtons isDark={isDark} conversations={conversations} />
          </div>
        </div>
      </div>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onReset={handleReset}
        errorMessage={errorMessage}
        isDark={isDark}
      />
    </div>
  );
};

// Definição dos PropTypes para ResearchAssistant
ResearchAssistant.propTypes = {
  isDark: PropTypes.bool.isRequired,
};

// Exportando o componente principal
export default ResearchAssistant;
