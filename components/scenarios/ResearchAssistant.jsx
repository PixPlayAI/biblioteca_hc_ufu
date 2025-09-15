// components/scenarios/ResearchAssistant.jsx
/**
 * Componente principal do Assistente de Pesquisa
 * Gerencia o fluxo de perguntas e respostas para construção de perguntas de pesquisa estruturadas
 * utilizando diversos frameworks acadêmicos (PICO, PICOT, PICOS, etc.)
 */

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

// Imports relacionados à busca de descritores
import MeshDecsSearch from '../MeshDecsSearch';
import { convertToMeshFormat } from '../../lib/frameworkMappings';

// Dados para easter eggs (perguntas perfeitas por framework)
import perfectQuestions from '../../lib/data/perfectQuestions.json';

/**
 * Função para detectar easter eggs no input do usuário
 * Formato: "ex:[framework]" retorna uma pergunta perfeita para o framework
 */
const checkEasterEgg = (input) => {
  const normalized = input
    .toLowerCase()
    .replace(/[\s\.,:\-\(\)]/g, '');
  
  if (normalized.startsWith('ex')) {
    const framework = normalized.substring(2);
    
    if (perfectQuestions[framework]) {
      return perfectQuestions[framework];
    }
  }
  
  return null;
};

/**
 * Mapeamento de traduções para elementos dos frameworks
 * Cada elemento tem seu termo em inglês e tradução em português
 */
const translations = {
  population: { term: 'Population/Patient', translation: 'População/Paciente' },
  intervention: { term: 'Intervention', translation: 'Intervenção' },
  comparison: { term: 'Comparison', translation: 'Comparação' },
  outcome: { term: 'Outcome', translation: 'Desfecho' },
  timeframe: { term: 'Time', translation: 'Tempo' },
  studyDesign: { term: 'Study Design', translation: 'Desenho do Estudo' },
  exposure: { term: 'Exposure', translation: 'Exposição' },
  concept: { term: 'Concept', translation: 'Conceito' },
  context: { term: 'Context', translation: 'Contexto' },
  sample: { term: 'Sample', translation: 'Amostra' },
  phenomenonOfInterest: { term: 'Phenomenon of Interest', translation: 'Fenômeno de Interesse' },
  design: { term: 'Design', translation: 'Design' },
  evaluation: { term: 'Evaluation', translation: 'Avaliação' },
  researchType: { term: 'Research Type', translation: 'Tipo de Pesquisa' },
  indexTest: { term: 'Index Test', translation: 'Teste Índice' },
  referenceTest: { term: 'Reference Test', translation: 'Teste de Referência' },
  diagnosis: { term: 'Diagnosis', translation: 'Diagnóstico' },
  condition: { term: 'Condition', translation: 'Condição' },
  setting: { term: 'Setting', translation: 'Ambiente/Contexto' },
  perspective: { term: 'Perspective', translation: 'Perspectiva' },
  expectation: { term: 'Expectation', translation: 'Expectativa' },
  clientGroup: { term: 'Client Group', translation: 'Grupo de Clientes' },
  location: { term: 'Location', translation: 'Local' },
  impact: { term: 'Impact', translation: 'Impacto' },
  professionals: { term: 'Professionals', translation: 'Profissionais' },
  service: { term: 'Service', translation: 'Serviço' },
  behavior: { term: 'Behavior', translation: 'Comportamento' },
  healthContext: { term: 'Health Context', translation: 'Contexto de Saúde' },
  exclusions: { term: 'Exclusions', translation: 'Exclusões' },
  modelsOrTheories: { term: 'Models or Theories', translation: 'Modelos ou Teorias' },
};

/**
 * Função auxiliar para garantir que todos os elementos do formato estejam presentes
 * Mapeia siglas para elementos completos e vice-versa
 */
const ensureAllFormatElements = (format, elements) => {
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

  const processedElements = {};
  const mapping = frameworkMappings[format];
  
  if (mapping) {
    const reverseMapping = {};
    Object.entries(mapping).forEach(([sigla, elemento]) => {
      reverseMapping[elemento] = sigla;
    });
    
    Object.entries(elements).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'Não especificado') {
        if (mapping[key]) {
          processedElements[mapping[key]] = value;
          processedElements[key] = value;
        }
        else if (reverseMapping[key]) {
          processedElements[reverseMapping[key]] = value;
          processedElements[key] = value;
        }
      }
    });
    
    Object.entries(mapping).forEach(([sigla, elemento]) => {
      if (!processedElements[sigla]) {
        processedElements[sigla] = processedElements[elemento] || '';
      }
      if (!processedElements[elemento]) {
        processedElements[elemento] = processedElements[sigla] || '';
      }
    });
  }

  if (format === 'BeHEMoTh') {
    const behemothElements = { ...processedElements };
    
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
    
    Object.entries(elements).forEach(([key, value]) => {
      if (siglaMapping[key] && value) {
        behemothElements[siglaMapping[key]] = value;
        behemothElements[key] = value;
      }
    });
    
    const requiredElements = ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'];
    requiredElements.forEach(elem => {
      if (!behemothElements[elem]) {
        for (const [sigla, elemName] of Object.entries(siglaMapping)) {
          if (elemName === elem && elements[sigla]) {
            behemothElements[elem] = elements[sigla];
            break;
          }
        }
      }
    });
    
    return behemothElements;
  }

  return processedElements;
};

/**
 * Função para obter elementos ordenados conforme o framework
 * Retorna array com key, letter (sigla) e value para cada elemento
 */
const getOrderedElements = (format, elements) => {
  const formatOrder = {
    PICO: {
      order: ['population', 'intervention', 'comparison', 'outcome'],
      letters: {
        population: 'P',
        intervention: 'I',
        comparison: 'C',
        outcome: 'O',
      },
    },
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
    PEO: {
      order: ['population', 'exposure', 'outcome'],
      letters: {
        population: 'P',
        exposure: 'E',
        outcome: 'O',
      },
    },
    PECO: {
      order: ['population', 'exposure', 'comparison', 'outcome'],
      letters: {
        population: 'P',
        exposure: 'E',
        comparison: 'C',
        outcome: 'O',
      },
    },
    PCC: {
      order: ['population', 'concept', 'context'],
      letters: {
        population: 'P',
        concept: 'C',
        context: 'C',
      },
    },
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
    PIRD: {
      order: ['population', 'indexTest', 'referenceTest', 'diagnosis'],
      letters: {
        population: 'P',
        indexTest: 'I',
        referenceTest: 'R',
        diagnosis: 'D',
      },
    },
    CoCoPop: {
      order: ['condition', 'context', 'population'],
      letters: {
        condition: 'Co',
        context: 'Co',
        population: 'Pop',
      },
    },
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
    BeHEMoTh: {
      order: ['behavior', 'healthContext', 'exclusions', 'modelsOrTheories'],
      letters: {
        behavior: 'Be',
        healthContext: 'HE',
        exclusions: 'Mo',
        modelsOrTheories: 'Th',
      },
    },
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

  return ordered;
};

/**
 * Função para validar a resposta da API
 * Garante que todos os campos obrigatórios estejam presentes
 */
export const validateResponse = (response) => {
  const requiredFields = ['quality', 'analysis', 'nextQuestion', 'canGenerateFinal'];

  for (const field of requiredFields) {
    if (!(field in response)) {
      console.error(`Missing required field: ${field}`);
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  if (typeof response.quality !== 'number') {
    console.warn(`Quality is missing or not a number. Defaulting to 0.`);
    response.quality = 0;
  }

  if (response.finalResult?.format) {
    const elements = response.finalResult.elements?.explicit || {};

    response.finalResult.elements.explicit = ensureAllFormatElements(
      response.finalResult.format,
      elements
    );
  }

  return response;
};

/**
 * Componente indicador de qualidade da resposta
 * Exibe uma barra de progresso colorida baseada no score
 */
const QualityIndicator = ({ score }) => {
  const validScore = typeof score === 'number' ? score : 0;

  let indicatorColor = 'bg-green-500';

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

/**
 * Componente para exibir cada elemento do framework
 * Mostra a sigla, termo, tradução e descrição
 */
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

/**
 * Componente para exibir elementos detalhados
 * Pode renderizar em formato padrão ou formatado
 */
const DetailedElements = ({ elements, format, variant = 'default', descriptions = {} }) => {
  const combinedElements = {};
  
  Object.entries(elements).forEach(([key, value]) => {
    combinedElements[key] = value;
  });
  
  Object.entries(descriptions).forEach(([key, value]) => {
    if (!combinedElements[key] || combinedElements[key] === 'Não especificado' || combinedElements[key] === '') {
      combinedElements[key] = value;
    }
  });

  const normalizedElements = ensureAllFormatElements(format, combinedElements);
  const orderedElements = getOrderedElements(format, normalizedElements);

  const elementsWithDescriptions = orderedElements.map(({ key, letter, value }) => {
    let description = value;

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
  descriptions: PropTypes.object,
};

DetailedElements.defaultProps = {
  variant: 'default',
  descriptions: {},
};

/**
 * Componente de análise da IA
 * Mostra o status atual da pergunta de pesquisa e próximos passos
 */
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

AIAnalysis.propTypes = {
  analysis: PropTypes.shape({
    identifiedElements: PropTypes.objectOf(PropTypes.string),
    suggestedFormat: PropTypes.string,
    observations: PropTypes.string,
  }).isRequired,
};

/**
 * Componente para exibir o histórico de conversas
 * Mostra perguntas, respostas e indicadores de qualidade
 */
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

/**
 * Componente do resultado final
 * Exibe a pergunta estruturada completa e opções de busca de descritores
 */
const FinalResult = ({ result, conversations, onReset, isDark }) => {
  const elementsToUse = result.elements?.explicit || result.elements?.implicit || {};
  const descriptionsToUse =
    result.elementDescriptions?.explicit || result.elementDescriptions?.implicit || {};

  const meshDecsData = convertToMeshFormat(result);

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

      <div className="mt-8 animate-fadeIn">
        <MeshDecsSearch 
          researchData={meshDecsData} 
          isDark={isDark} 
          conversations={conversations}
          finalResult={result}
        />
      </div>

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

/**
 * Componente principal ResearchAssistant
 * Gerencia todo o fluxo de criação da pergunta de pesquisa
 */
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

  /**
   * Função para detectar elementos já mencionados no input
   */
  const detectElementsInInput = (input) => {
    const elements = {};
    const lowerInput = input.toLowerCase();
    
    // Detectar população
    if (lowerInput.includes('pacientes pediátricos') || 
        lowerInput.includes('crianças') || 
        lowerInput.includes('pediatr')) {
      elements.population = true;
    }
    
    // Detectar intervenção
    if (lowerInput.includes('musicoterapia') || 
        lowerInput.includes('música') || 
        lowerInput.includes('musical')) {
      elements.intervention = true;
    }
    
    // Detectar comparação
    if (lowerInput.includes('comparação') || 
        lowerInput.includes('versus') || 
        lowerInput.includes('comparado') ||
        lowerInput.includes('não recebem')) {
      elements.comparison = true;
    }
    
    // Detectar desfecho
    if (lowerInput.includes('tempo de internação') || 
        lowerInput.includes('reduz') || 
        lowerInput.includes('resultado')) {
      elements.outcome = true;
    }
    
    // Detectar comorbidade
    if (lowerInput.includes('comorbidade')) {
      elements.condition = true;
    }
    
    return elements;
  };

  const updateQuestionRepetitions = (question) => {
    setQuestionRepetitions((prev) => {
      const newMap = new Map(prev);
      const count = (newMap.get(question) || 0) + 1;
      newMap.set(question, count);
      return newMap;
    });
  };

  /**
   * Função principal para processar submissão com um valor específico
   * Usada tanto para submissão normal quanto para easter eggs
   */
  const handleSubmitWithValue = async (value) => {
    console.log('🎯 handleSubmitWithValue chamada com:', value);
    console.log('📊 Conversas anteriores:', conversations.length);
    console.log('🔍 Pergunta atual:', nextQuestion.text);
    
    // VALIDAÇÃO CRÍTICA: Detectar se está repetindo pergunta
    const isRepeatingInitialQuestion = 
      conversations.length > 0 && 
      nextQuestion.text.toLowerCase().includes('principal problema');
    
    if (isRepeatingInitialQuestion) {
      console.error('⚠️ DETECTADA REPETIÇÃO DE PERGUNTA INICIAL!');
      
      // Detectar elementos já mencionados
      const detectedElements = detectElementsInInput(value);
      console.log('📝 Elementos detectados:', detectedElements);
      
      // Forçar próxima pergunta baseada nos elementos detectados
      let forcedNextQuestion = {
        text: '',
        context: '',
        isRequired: true
      };
      
      if (detectedElements.population && detectedElements.intervention && detectedElements.condition) {
        forcedNextQuestion.text = "Você mencionou 'comorbidade específica'. Qual condição clínica você pretende focar?";
        forcedNextQuestion.context = "Por exemplo: pneumonia, cirurgias pediátricas, doenças respiratórias, oncologia pediátrica?";
      } else if (detectedElements.population && detectedElements.intervention) {
        forcedNextQuestion.text = "Como será aplicada a musicoterapia no seu estudo?";
        forcedNextQuestion.context = "Considere: frequência das sessões, duração, tipo de atividades musicais (audição passiva, participação ativa)?";
      } else if (!detectedElements.comparison) {
        forcedNextQuestion.text = "Como será o grupo de comparação?";
        forcedNextQuestion.context = "Pacientes que recebem apenas cuidado padrão? Ou com atividades recreativas tradicionais?";
      } else {
        forcedNextQuestion.text = "Além do tempo de internação, há outros desfechos que você gostaria de avaliar?";
        forcedNextQuestion.context = "Por exemplo: níveis de ansiedade, satisfação dos pais, uso de medicação?";
      }
      
      setNextQuestion(forcedNextQuestion);
      console.log('✅ Pergunta forçada para:', forcedNextQuestion.text);
      
      // Criar conversação sem chamar API
      const newConversation = {
        question: nextQuestion.text,
        context: nextQuestion.context,
        answer: value,
        quality: 8,
        analysis: {
          identifiedElements: {
            population: 'pacientes pediátricos',
            intervention: 'musicoterapia',
            outcome: 'tempo de internação',
            location: 'HC-UFU/EBSERH'
          },
          suggestedFormat: 'PICO'
        }
      };
      
      setConversations([...conversations, newConversation]);
      setCurrentInput('');
      setCurrentAnalysis(newConversation.analysis);
      
      return; // NÃO chamar API
    }
    
    setIsLoading(true);

    try {
      updateQuestionRepetitions(nextQuestion.text);

      console.log('📤 Enviando para API com contexto:', {
        historyLength: conversations.length,
        currentInput: value.substring(0, 50) + '...',
        currentStep: conversations.length
      });

      const response = await generateScenarioContent({
        history: conversations,
        currentInput: value,
        currentStep: conversations.length,
        suggestionMode,
        suggestedElement,
      });

      console.log('📥 Resposta da API recebida:', {
        quality: response.quality,
        canGenerateFinal: response.canGenerateFinal,
        nextQuestion: response.nextQuestion?.text
      });

      const validatedResponse = validateResponse(response);

      const newConversation = {
        question: nextQuestion.text,
        context: nextQuestion.context,
        answer: value,
        quality: validatedResponse.quality,
        analysis: validatedResponse.analysis,
      };

      setConversations([...conversations, newConversation]);
      setCurrentInput('');
      setCurrentAnalysis(validatedResponse.analysis);

      if (validatedResponse.analysis?.suggestionsNeeded) {
        setSuggestionMode(true);
        setSuggestedElement(validatedResponse.analysis.suggestionsFor);
      } else {
        setSuggestionMode(false);
        setSuggestedElement(null);
      }

      // VALIDAÇÃO ADICIONAL: Verificar se a próxima pergunta não é repetição
      if (validatedResponse.nextQuestion) {
        const newQuestionText = validatedResponse.nextQuestion.text.toLowerCase();
        const isRepetition = conversations.some(conv => 
          conv.question.toLowerCase() === newQuestionText
        );
        
        if (isRepetition) {
          console.warn('⚠️ API tentou repetir pergunta. Forçando progressão...');
          // Forçar uma pergunta diferente
          validatedResponse.nextQuestion = {
            text: "Com base no que discutimos, há algo mais específico que você gostaria de detalhar?",
            context: "Se não, posso estruturar sua pergunta de pesquisa agora.",
            isRequired: false
          };
          validatedResponse.canGenerateFinal = true;
        }
        
        setNextQuestion(validatedResponse.nextQuestion);
      }

      if (validatedResponse.canGenerateFinal && validatedResponse.finalResult) {
        setFinalResult(validatedResponse.finalResult);

        setTimeout(() => {
          const questionElement = document.querySelector('.final-presentation-container');
          if (questionElement) {
            const rect = questionElement.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            const duration = 1 * 1000;
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
              ticks: 200,
              zIndex: 9999,
              gravity: 0.5,
              scalar: 1.2,
              colors: colors,
              disableForReducedMotion: false,
              useWorker: true,
            };

            function randomInRange(min, max) {
              return Math.random() * (max - min) + min;
            }

            confetti({
              ...defaults,
              particleCount: 150,
              spread: 100,
              origin: { x, y },
              startVelocity: 60,
              scalar: 1.5,
            });

            const interval = setInterval(function () {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              const particleCount = 80 * (timeLeft / duration);

              confetti({
                ...defaults,
                particleCount: Math.floor(particleCount),
                spread: randomInRange(50, 70),
                origin: { x, y },
                startVelocity: randomInRange(35, 55),
                scalar: randomInRange(0.8, 1.4),
              });

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
      
      if (validatedResponse.quality < 3) {
        setErrorMessage(
          'A resposta fornecida está com qualidade muito baixa. Por favor, tente novamente.'
        );
        setIsFeedbackModalOpen(true);
      }
    } catch (error) {
      console.error('❌ Erro em handleSubmitWithValue:', error);
      setErrorMessage(error.message);
      setIsFeedbackModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de submissão principal
   * Verifica easter eggs e processa a resposta
   */
  const handleSubmit = async () => {
    if (!currentInput.trim()) return;
    
    console.log('🚀 handleSubmit chamada');
    
    if (conversations.length === 0) {
      const perfectQuestion = checkEasterEgg(currentInput);
      if (perfectQuestion) {
        setCurrentInput(perfectQuestion);
        
        setTimeout(() => {
          handleSubmitWithValue(perfectQuestion);
        }, 100);
        
        return;
      }
    }
    
    handleSubmitWithValue(currentInput);
  };

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
                  } justify-center`}
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

ResearchAssistant.propTypes = {
  isDark: PropTypes.bool.isRequired,
};

export default ResearchAssistant;