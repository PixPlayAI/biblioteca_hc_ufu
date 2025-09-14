// components/IntelligentSearch.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from './ui/card';
import { 
  Search, 
  Sparkles, 
  Send, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Brain,
  Globe,
  Languages,
  BookOpen,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '../lib/utils';
import MeshDecsSearch from './MeshDecsSearch';

const IntelligentSearch = ({ isDark }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingDescriptors, setIsSearchingDescriptors] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [descriptorData, setDescriptorData] = useState(null);
  const [meshResults, setMeshResults] = useState(null);
  const [decsResults, setDecsResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('both');
  const [showResults, setShowResults] = useState(false);
  const [currentSearchStep, setCurrentSearchStep] = useState('');

  // Exemplos de entrada para ajudar o usuário
  const examples = [
    "Quero estudar o efeito da acupuntura na dor lombar crônica em idosos",
    "Eficácia do uso de aplicativos móveis para controle glicêmico em diabéticos tipo 2",
    "Impacto da telemedicina na adesão ao tratamento de hipertensão em áreas rurais",
    "Prevalência de burnout em profissionais de enfermagem durante a pandemia"
  ];

  const handleSearch = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowResults(false);
    setMeshResults(null);
    setDecsResults(null);
    setCurrentSearchStep('Analisando sua pesquisa...');

    try {
      // Criar timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 58000); // 58 segundos
      
      const response = await fetch('/api/intelligent-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userInput.trim()
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // Se não for JSON, tentar ler como texto
        const text = await response.text();
        console.error('Resposta não-JSON recebida:', text);
        
        // Se for erro de timeout da Vercel
        if (response.status === 504 || text.includes('error') || text.includes('timeout')) {
          throw new Error('A análise demorou muito. Tente com uma pergunta mais simples.');
        }
        
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar busca');
      }
      
      // Validar resposta
      if (!data.analysis || !data.descriptorData) {
        console.warn('Resposta incompleta, usando dados parciais');
      }
      
      setAnalysis(data.analysis);
      setDescriptorData(data.descriptorData);
      setShowResults(true);
      setIsLoading(false);
      setCurrentSearchStep('');

      // Buscar descritores automaticamente se disponível
      if (data.descriptorData && data.descriptorData.frameworkElements) {
        setTimeout(() => {
          searchDescriptors(data.descriptorData, searchType);
        }, 500);
      }

    } catch (err) {
      console.error('❌ Erro na busca:', err);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao processar busca';
      
      if (err.name === 'AbortError') {
        errorMessage = 'A requisição excedeu o tempo limite. Tente novamente.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Tente com uma pergunta mais curta.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setCurrentSearchStep('');
    }
  };

  const searchDescriptors = async (data, type) => {
    if (!data || !data.frameworkElements) {
      console.error('❌ Dados inválidos para busca de descritores');
      return;
    }

    setIsSearchingDescriptors(true);
    console.log('🔍 Iniciando busca de descritores:', { data, type });

    try {
      // Criar timeout controller para cada busca
      const createTimeoutFetch = async (url, body, timeout = 58000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      // Buscar MeSH
      if (type === 'mesh' || type === 'both') {
        setCurrentSearchStep('Buscando descritores MeSH...');
        try {
          const meshResponse = await createTimeoutFetch('/api/search-mesh', data);
          
          if (meshResponse.ok) {
            const contentType = meshResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const meshData = await meshResponse.json();
              console.log('✅ Resultados MeSH recebidos');
              setMeshResults(meshData);
            }
          }
        } catch (meshError) {
          console.error('❌ Erro ao buscar MeSH:', meshError.message);
          if (meshError.name !== 'AbortError') {
            // Continuar mesmo com erro
          }
        }
      }

      // Buscar DeCS
      if (type === 'decs' || type === 'both') {
        setCurrentSearchStep('Buscando descritores DeCS...');
        try {
          const decsResponse = await createTimeoutFetch('/api/search-decs', data);
          
          if (decsResponse.ok) {
            const contentType = decsResponse.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const decsData = await decsResponse.json();
              console.log('✅ Resultados DeCS recebidos');
              setDecsResults(decsData);
            }
          }
        } catch (decsError) {
          console.error('❌ Erro ao buscar DeCS:', decsError.message);
          if (decsError.name !== 'AbortError') {
            // Continuar mesmo com erro
          }
        }
      }
    } finally {
      setIsSearchingDescriptors(false);
      setCurrentSearchStep('');
    }
  };

  // Função para retentar busca de descritores
  const retryDescriptorSearch = () => {
    if (descriptorData) {
      searchDescriptors(descriptorData, searchType);
    }
  };

  const handleExampleClick = (example) => {
    setUserInput(example);
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <Card className={cn(
        'mt-6 overflow-hidden',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
      )}>
        <div className={cn(
          'px-6 py-4',
          isDark 
            ? 'bg-gradient-to-r from-purple-900 to-blue-900'
            : 'bg-gradient-to-r from-purple-500 to-blue-500'
        )}>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Análise Inteligente
          </h3>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Framework detectado */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Framework Detectado</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.detectedFramework || 'PICO'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Confiança</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((analysis.confidence || 0.8) * 100)}%
              </p>
            </div>
          </div>

          {/* Elementos identificados */}
          {analysis.elements && Object.keys(analysis.elements).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Elementos Identificados
              </h4>
              <div className="space-y-3">
                {Object.entries(analysis.elements).map(([key, element]) => (
                  <div key={key} className={cn(
                    'p-4 rounded-lg border',
                    isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                  )}>
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white',
                        'bg-gradient-to-br from-blue-500 to-purple-500'
                      )}>
                        {key}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {element.description || element.concepts?.[0] || 'Não especificado'}
                        </p>
                        {element.concepts && element.concepts.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {element.concepts.slice(0, 5).map((concept, idx) => (
                              <span key={idx} className={cn(
                                'px-2 py-1 rounded-full text-xs',
                                isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-700'
                              )}>
                                {concept}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status da busca de descritores */}
          {isSearchingDescriptors && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>{currentSearchStep || 'Buscando descritores...'}</span>
            </div>
          )}

          {/* Botão para retentar busca de descritores */}
          {!isSearchingDescriptors && descriptorData && !meshResults && !decsResults && (
            <div className="text-center">
              <button
                onClick={retryDescriptorSearch}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                Buscar Descritores
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto p-2 sm:p-4">
      {/* Header da funcionalidade */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Busca Inteligente com IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Digite sua ideia de pesquisa em português comum e nossa IA transformará em descritores científicos padronizados MeSH e DeCS
        </p>
      </div>

      {/* Card principal de entrada */}
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
      )}>
        <CardContent className="p-6">
          {/* Área de entrada */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Descreva sua pesquisa
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ex: Quero estudar o efeito da meditação na ansiedade de estudantes universitários..."
                className={cn(
                  'w-full min-h-[150px] p-4 rounded-lg border transition-colors',
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                )}
                disabled={isLoading}
              />
            </div>

            {/* Exemplos rápidos */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Exemplos rápidos:
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs transition-colors',
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    )}
                    disabled={isLoading}
                  >
                    {example.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de tipo de busca */}
            <div>
              <p className="text-sm font-medium mb-2">Buscar em:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSearchType('mesh')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2',
                    searchType === 'mesh'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                  disabled={isLoading}
                >
                  <Globe className="w-4 h-4" />
                  MeSH
                </button>
                <button
                  onClick={() => setSearchType('decs')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2',
                    searchType === 'decs'
                      ? 'bg-green-500 text-white border-green-500'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                  disabled={isLoading}
                >
                  <Languages className="w-4 h-4" />
                  DeCS
                </button>
                <button
                  onClick={() => setSearchType('both')}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2',
                    searchType === 'both'
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                  disabled={isLoading}
                >
                  <BookOpen className="w-4 h-4" />
                  Ambos
                </button>
              </div>
            </div>

            {/* Botão de busca */}
            <button
              onClick={handleSearch}
              disabled={isLoading || !userInput.trim()}
              className={cn(
                'w-full py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-3',
                'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
                'hover:from-purple-600 hover:to-blue-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transform hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {currentSearchStep || 'Processando com IA...'}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar Descritores
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Mensagem de erro */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      Erro ao processar busca
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                    <button
                      onClick={handleSearch}
                      className="mt-2 text-sm underline text-red-700 dark:text-red-300 hover:text-red-800"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados da análise */}
      {showResults && analysis && renderAnalysisResults()}

      {/* Resultados dos descritores MeSH/DeCS */}
      {showResults && descriptorData && (meshResults || decsResults) && (
        <div className="mt-8">
          <MeshDecsSearch
            researchData={{
              format: analysis.detectedFramework || 'PICO',
              question: analysis.analysis || userInput,
              elements: {
                explicit: descriptorData.frameworkElements || {}
              }
            }}
            isDark={isDark}
            preloadedResults={{
              mesh: meshResults,
              decs: decsResults
            }}
            hideSearchButtons={true}
          />
        </div>
      )}
    </div>
  );
};

IntelligentSearch.propTypes = {
  isDark: PropTypes.bool.isRequired
};

export default IntelligentSearch;