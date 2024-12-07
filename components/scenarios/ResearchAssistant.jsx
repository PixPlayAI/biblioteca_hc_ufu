//frontend/src/components/scenarios/ResearchAssistant.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { generateScenarioContent } from '../../lib/api';
import FeedbackModal from '../FeedbackModal';
import { Hourglass } from 'lucide-react';

// Update translations with new elements
const translations = {
  // Existing translations
  population: { term: 'Population/Patient', translation: 'População/Paciente' },
  intervention: { term: 'Intervention', translation: 'Intervenção' },
  comparison: { term: 'Comparison', translation: 'Comparação' },
  outcome: { term: 'Outcome', translation: 'Desfecho' },
  exposure: { term: 'Exposure', translation: 'Exposição' },
  timeframe: { term: 'Time', translation: 'Tempo' },

  // New translations
  condition: { term: 'Condition', translation: 'Condição' },
  context: { term: 'Context', translation: 'Contexto' },
  studyDesign: { term: 'Study Design', translation: 'Desenho do Estudo' },
  riskFactor: { term: 'Risk Factor', translation: 'Fator de Risco' },
  phenomenonOfInterest: { term: 'Phenomenon of Interest', translation: 'Fenômeno de Interesse' },
  concept: { term: 'Concept', translation: 'Conceito' },
  evaluation: { term: 'Evaluation', translation: 'Avaliação' },
  researchType: { term: 'Research Type', translation: 'Tipo de Pesquisa' },
  sample: { term: 'Sample', translation: 'Amostra' },
  index: { term: 'Index Test', translation: 'Teste Índice' },
  reference: { term: 'Reference Test', translation: 'Teste de Referência' },
  environment: { term: 'Environment', translation: 'Ambiente' },
};

// Helper function to map similar elements
const mapElementValue = (elements, targetKey, alternativeKeys) => {
  // If the target key already has a value, return it
  if (elements[targetKey] && elements[targetKey] !== '') {
    return elements[targetKey];
  }

  // Look for a value in alternative keys
  for (const altKey of alternativeKeys) {
    if (elements[altKey] && elements[altKey] !== '') {
      console.log(`Found value for ${targetKey} in ${altKey}:`, elements[altKey]);
      return elements[altKey];
    }
  }

  return '';
};

// Helper function to normalize elements
const normalizeElements = (format, elements) => {
  console.log('Normalizing elements for format:', format);
  console.log('Original elements:', elements);

  // Define element mappings
  const elementMappings = {
    exposure: ['intervention', 'condition'], // 'exposure' can come from 'intervention' or 'condition'
    intervention: ['exposure'], // 'intervention' can come from 'exposure'
    comparison: ['control'], // 'comparison' can come from 'control'
    // Adicione outras mapeamentos conforme necessário
  };

  const normalized = { ...elements };

  // Apply mappings
  Object.entries(elementMappings).forEach(([targetKey, alternativeKeys]) => {
    normalized[targetKey] = mapElementValue(elements, targetKey, alternativeKeys);
  });

  console.log('Normalized elements:', normalized);
  return normalized;
};

// Helper function to ensure all format elements are present
const ensureAllFormatElements = (format, elements) => {
  console.log('Ensuring all elements for format:', format);

  // First normalize the elements
  const normalizedElements = normalizeElements(format, elements);
  console.log('After normalization:', normalizedElements);

  // Define required elements for each format
  const formatRequirements = {
    PECO: ['population', 'exposure', 'comparison', 'outcome'],
    PEO: ['population', 'exposure', 'outcome'],
    PICO: ['population', 'intervention', 'comparison', 'outcome'],
    PICOT: ['population', 'intervention', 'comparison', 'outcome', 'timeframe'],
    SPIDER: ['sample', 'phenomenonOfInterest', 'design', 'evaluation', 'researchType'],
    PICOS: ['population', 'intervention', 'comparison', 'outcome', 'studyDesign'],
    PIRO: ['population', 'index', 'reference', 'outcome'],
    PCC: ['population', 'concept', 'context'],
    PICOTE: ['population', 'intervention', 'comparison', 'outcome', 'timeframe', 'environment'],
    CoCoPop: ['condition', 'context', 'population'],
    // Adicione outros formatos conforme necessário
  };

  const requirements = formatRequirements[format] || [];
  const finalElements = { ...normalizedElements };

  // Ensure all required elements exist
  requirements.forEach((key) => {
    if (!finalElements[key]) {
      console.log(`Adding missing required element: ${key}`);
      finalElements[key] = '';
    }
  });

  console.log('Final elements:', finalElements);
  return finalElements;
};

// Function to get ordered elements in the correct order
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

    // SPIDER
    SPIDER: {
      order: ['sample', 'phenomenonOfInterest', 'studyDesign', 'evaluation', 'researchType'],
      letters: {
        sample: 'S',
        phenomenonOfInterest: 'P',
        studyDesign: 'D',
        evaluation: 'E',
        researchType: 'R',
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

    // PICOTE
    PICOTE: {
      order: ['population', 'intervention', 'comparison', 'outcome', 'timeframe', 'evaluation'],
      letters: {
        population: 'P',
        intervention: 'I',
        comparison: 'C',
        outcome: 'O',
        timeframe: 'T',
        evaluation: 'E',
      },
    },

    // CoCoPop
    CoCoPop: {
      order: ['context', 'condition', 'population'],
      letters: {
        context: 'C',
        condition: 'C',
        population: 'P',
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

    // PIRO
    PIRO: {
      order: ['population', 'intervention', 'riskFactor', 'outcome'],
      letters: {
        population: 'P',
        intervention: 'I',
        riskFactor: 'R',
        outcome: 'O',
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

    // Sem sigla (genérico)
    GENERIC: {
      order: ['population', 'condition', 'intervention', 'outcome', 'timeframe'],
      letters: {
        population: 'P',
        condition: 'C',
        intervention: 'I',
        outcome: 'O',
        timeframe: 'T',
      },
    },
  };

  const formatConfig = formatOrder[format];
  if (!formatConfig) return [];

  const ordered = formatConfig.order.map((key) => ({
    key,
    letter: formatConfig.letters[key],
    value: elements[key] || '',
  }));

  console.log('Ordered elements:', ordered);
  return ordered;
};

// Updated validateResponse function
export const validateResponse = (response) => {
  console.log('Validating response:', response);

  const requiredFields = ['quality', 'analysis', 'nextQuestion', 'canGenerateFinal'];

  // Validate basic structure
  for (const field of requiredFields) {
    if (!(field in response)) {
      console.error(`Missing required field: ${field}`);
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  // Ensure all format-specific elements are present
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

// Quality indicator component
const QualityIndicator = ({ score }) => (
  <div className="mt-2">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium">Qualidade da Resposta</span>
      <span className="text-sm font-bold">{score.toFixed(1)}/10</span>
    </div>
    <Progress
      value={score * 10}
      className="h-2"
      indicatorClassName={score >= 7 ? 'bg-green-500' : 'bg-yellow-500'}
    />
  </div>
);

// ElementDisplay component
const ElementDisplay = ({ letter, term, translation, description }) => (
  <div className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
    <span className="text-3xl font-bold text-blue-600 min-w-[2rem]">{letter}</span>
    <div>
      <div className="font-medium">
        {term} <span className="text-gray-600">({translation})</span>
      </div>
      <p className="text-sm text-gray-700 mt-1">{description || 'Não especificado'}</p>
    </div>
  </div>
);

// Updated DetailedElements component// Updated DetailedElements component
const DetailedElements = ({ elements, format, variant = 'default', descriptions = {} }) => {
  console.log('DetailedElements Input:', { elements, format, variant, descriptions });

  // Get normalized elements but don't modify the keys yet
  const normalizedElements = ensureAllFormatElements(format, elements);
  const orderedElements = getOrderedElements(format, normalizedElements);

  // Map description for each element, using the descriptions object directly
  const elementsWithDescriptions = orderedElements.map(({ key, letter }) => ({
    key,
    letter,
    description: descriptions[key] || elements[key] || 'Não especificado',
  }));

  if (variant === 'formatted') {
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
        <div key={key} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-blue-600 min-w-[2rem]">{letter}</span>
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
// Updated AIAnalysis component
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Status da sua Pergunta de Pesquisa
          </h3>
          <div className="space-y-4">
            {orderedElements.map(({ key, letter, value }) => (
              <div key={key} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-3xl font-bold text-blue-600 min-w-[2rem]">{letter}</span>
                <div>
                  <div className="font-medium">
                    {translations[key]?.term}{' '}
                    <span className="text-gray-600">({translations[key]?.translation})</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{value || 'Não especificado'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {analysis.observations && (
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Próximos Passos:</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.observations}</p>
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

// QualityIndicator propTypes
QualityIndicator.propTypes = {
  score: PropTypes.number.isRequired,
};

// ElementDisplay propTypes
// Updated ElementDisplay PropTypes
ElementDisplay.propTypes = {
  letter: PropTypes.string.isRequired,
  term: PropTypes.string.isRequired,
  translation: PropTypes.string.isRequired,
  description: PropTypes.string,
};
ElementDisplay.defaultProps = {
  description: '',
};

// ConversationHistory component
const ConversationHistory = ({ conversations }) => (
  <div className="space-y-4">
    {conversations.map((conv, index) => (
      <Card key={index}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{conv.question}</p>
              {conv.context && <p className="text-sm text-gray-600 mt-1">{conv.context}</p>}
            </div>
            <div className="pl-4 border-l-2 border-blue-500">
              <p className="text-gray-900">{conv.answer}</p>
              {conv.quality < 10 && <QualityIndicator score={conv.quality} />}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// ConversationHistory propTypes
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

// FinalResult component
const FinalResult = ({ result, conversations, onReset }) => {
  console.log('FinalResult rendering with:', result);
  console.log('Result elements:', result.elements);
  console.log('Result descriptions:', result.elementDescriptions);

  // Ensure we're using explicit elements if available, otherwise use implicit
  const elementsToUse = result.elements?.explicit || result.elements?.implicit || {};
  const descriptionsToUse =
    result.elementDescriptions?.explicit || result.elementDescriptions?.implicit || {};

  // Map uppercase keys (P, E, C, O, etc.) to lowercase keys (population, exposure, comparison, etc.)
  const keyMapping = {
    P: 'population', // Usado por vários formatos
    E: 'exposure', // Usado por PEO, PECO, PICOTE
    C: 'comparison', // Usado por PICO, PICOT, PECO, PICOTE
    O: 'outcome', // Usado por PICO, PICOT, PECO, PIRO
    I: 'intervention', // Usado por PICO, PICOT, PICOTE, PIRO
    T: 'timeframe', // Usado por PICOT, PICOTE ou sem sigla
    S: 'studyDesign', // Usado por PICO, PICOT, PICOS, SPIDER
    R: 'riskFactor', // Usado por PIRO
    D: 'phenomenonOfInterest', // Usado por SPIDER
    N: 'concept', // Usado por PCC
    F: 'evaluation', // Usado por SPIDER
    X: 'condition', // Usado por CoCoPop
    U: 'context', // Usado por PCC, CoCoPop
    L: 'sample', // Usado por SPIDER
    H: 'index', // Usado por PIRO (substituição de 'intervention' para se alinhar ao formato)
    K: 'environment', // Adicionado para PICOTE
  };

  // Convert uppercase keys to lowercase
  const normalizedElements = Object.entries(elementsToUse).reduce((acc, [key, value]) => {
    const normalizedKey = keyMapping[key] || key.toLowerCase();
    acc[normalizedKey] = value;
    return acc;
  }, {});

  const normalizedDescriptions = Object.entries(descriptionsToUse).reduce((acc, [key, value]) => {
    const normalizedKey = keyMapping[key] || key.toLowerCase();
    acc[normalizedKey] = value;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <ConversationHistory conversations={conversations} />
      <Card>
        <CardHeader>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Pergunta de Pesquisa Estruturada</h2>
            {result.format && (
              <>
                <p className="text-gray-600">Formato: {result.format}</p>
                <DetailedElements
                  elements={normalizedElements}
                  format={result.format}
                  variant="formatted"
                  descriptions={normalizedDescriptions}
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg text-blue-900 text-center">{result.question}</p>
          </div>
          {result.explanation && (
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">Explicação Detalhada:</h3>
              <p className="text-gray-700">{result.explanation}</p>
            </div>
          )}
          <div className="flex justify-center pt-4">
            <button
              onClick={onReset}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
            >
              Iniciar Nova Pesquisa
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// FinalResult propTypes
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
};

// ResearchAssistant component
const ResearchAssistant = ({ isDark }) => {
  const [suggestionMode, setSuggestionMode] = useState(false);
  const [suggestedElement, setSuggestedElement] = useState(null);
  // eslint-disable-next-line no-unused-vars
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
      } else if (validatedResponse.nextQuestion) {
        setNextQuestion(validatedResponse.nextQuestion);
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
          <p className="text-sm text-gray-600 mb-4">
            Com base no seu contexto, estas são algumas opções que poderiam se adequar ao seu
            estudo. Você pode escolher uma delas, propor uma alternativa ou negar a sugestão.
          </p>
          {nextQuestion.suggestions?.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setCurrentInput(suggestion)}
              className="block w-full text-left p-3 rounded-lg border hover:bg-gray-50
                      transition-colors mb-2"
            >
              {suggestion}
            </button>
          ))}
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-lg border mt-4"
            placeholder="Digite sua resposta ou escolha uma sugestão acima..."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2">{nextQuestion.text}</h3>
        {nextQuestion.context && (
          <p className="text-sm text-gray-600 mb-4">{nextQuestion.context}</p>
        )}
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="w-full min-h-[120px] p-4 rounded-lg border"
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
    return <FinalResult result={finalResult} conversations={conversations} onReset={handleReset} />;
  }

  return (
    <div className={`max-w-[1200px] mx-auto p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConversationHistory conversations={conversations} />
          <Card>
            <CardContent className="p-6">
              {renderQuestionContent()}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !currentInput.trim()}
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center gap-2"
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
          <div className="sticky top-16 z-10">
            {currentAnalysis && <AIAnalysis analysis={currentAnalysis} />}
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

// ResearchAssistant propTypes
ResearchAssistant.propTypes = {
  isDark: PropTypes.bool.isRequired,
};

// Exportando o componente principal
export default ResearchAssistant;
