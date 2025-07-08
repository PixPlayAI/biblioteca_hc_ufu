// components/SearchStringGenerator.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Sparkles,
  Loader2,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Database,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Microscope,
  ExternalLink,
  Search,
  Clock,
  Plus,
  RefreshCw,
  CloudOff,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getElementLabel } from '../lib/frameworkMappings';

const SearchStringGenerator = ({ meshContent, researchData, isDark }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchStrings, setSearchStrings] = useState(null);
  const [error, setError] = useState(null);
  const [copiedString, setCopiedString] = useState(null);
  const [collapsedDatabases, setCollapsedDatabases] = useState({});
  const [hasGenerated, setHasGenerated] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [processingTime, setProcessingTime] = useState(null);
  const [dots, setDots] = useState('');
  const [generatedDatabases, setGeneratedDatabases] = useState(new Set());
  const [currentDatabase, setCurrentDatabase] = useState(null);
  const [showDatabaseButtons, setShowDatabaseButtons] = useState(false);
  const [databaseErrors, setDatabaseErrors] = useState({});
  const [retryingDatabase, setRetryingDatabase] = useState(null);

  // Configuração das bases de dados com URLs
  const databases = [
    {
      key: 'PubMed',
      value: 'pubmed',
      name: 'PubMed',
      color: 'blue',
      baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/?term=',
      needsAuth: false,
    },
    {
      key: 'SciELO',
      value: 'scielo',
      name: 'SciELO',
      color: 'amber',
      baseUrl: 'https://search.scielo.org/?q=',
      needsAuth: false,
    },
    {
      key: 'Europe_PMC',
      value: 'europe_pmc',
      name: 'Europe PMC',
      color: 'green',
      baseUrl: 'https://europepmc.org/search?query=',
      needsAuth: false,
    },
    {
      key: 'CrossRef',
      value: 'crossref',
      name: 'CrossRef',
      color: 'purple',
      baseUrl: 'https://search.crossref.org/?q=',
      needsAuth: false,
    },
    {
      key: 'DOAJ',
      value: 'doaj',
      name: 'DOAJ',
      color: 'orange',
      baseUrl: 'https://doaj.org/search/articles?q=',
      needsAuth: false,
    },
    {
      key: 'Cochrane_Library',
      value: 'cochrane',
      name: 'Cochrane Library',
      color: 'red',
      baseUrl: 'https://www.cochranelibrary.com/search?q=',
      needsAuth: false,
    },
    {
      key: 'LILACS_BVS',
      value: 'lilacs',
      name: 'LILACS (via BVS)',
      color: 'teal',
      baseUrl: 'https://pesquisa.bvsalud.org/portal/?q=',
      needsAuth: false,
    },
    {
      key: 'Scopus',
      value: 'scopus',
      name: 'Scopus',
      color: 'indigo',
      baseUrl: 'https://www.scopus.com/search/form.uri?display=basic#basic',
      needsAuth: true,
      authMessage: 'Requer login institucional',
    },
    {
      key: 'Web_of_Science',
      value: 'web_of_science',
      name: 'Web of Science',
      color: 'pink',
      baseUrl: 'https://www.webofscience.com/wos/woscc/basic-search',
      needsAuth: true,
      authMessage: 'Requer login institucional',
    },
  ];

  // UseEffect para animar os pontos
  useEffect(() => {
    let interval;
    if (!isGenerating && !hasGenerated && meshContent && !error) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    } else {
      setDots('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, hasGenerated, meshContent, error]);

  // Função para gerar URL de busca
  const generateSearchUrl = (database, searchString) => {
    if (database.needsAuth) {
      return database.baseUrl;
    }

    // Tratamento especial para Cochrane
    if (database.key === 'Cochrane_Library') {
      return `${database.baseUrl}${encodeURIComponent(searchString)}`;
    }

    // Para as outras bases, encode a string completa
    return `${database.baseUrl}${encodeURIComponent(searchString)}`;
  };

  // Função para processar uma base específica
  const processDatabase = async (database) => {
    const startTime = Date.now();
    setCurrentDatabase(database.name);
    setStatusMessage(`Gerando strings para ${database.name}...`);
    setRetryingDatabase(null);

    // Limpar erro anterior desta base
    setDatabaseErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[database.key];
      return newErrors;
    });

    try {
      const response = await fetch('/api/generate-search-strings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meshContent, 
          database: database.value 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data) {
        // Mesclar resultados
        setSearchStrings(prevStrings => {
          if (!prevStrings) {
            return data.data;
          }
          
          // Mesclar as strings específicas e amplas
          return {
            search_strings: {
              specific: {
                ...prevStrings.search_strings.specific,
                ...data.data.search_strings.specific
              },
              broad: {
                ...prevStrings.search_strings.broad,
                ...data.data.search_strings.broad
              }
            }
          };
        });

        // Adicionar à lista de bases geradas
        setGeneratedDatabases(prev => new Set([...prev, database.key]));

        const partTime = Math.round((Date.now() - startTime) / 1000);
        setProcessingTime(prev => (prev || 0) + partTime);

        console.log(`Base ${database.name} concluída!`);
        return true; // Sucesso
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao gerar strings:', err);
      
      // Armazenar erro específico da base
      setDatabaseErrors(prev => ({
        ...prev,
        [database.key]: err.message || 'Erro ao gerar strings de busca'
      }));

      // Se for PubMed, definir erro global também
      if (database.value === 'pubmed') {
        setError(err.message || 'Erro ao gerar strings de busca');
      }

      return false; // Erro
    }
  };

  // Função para gerar strings do PubMed automaticamente
  const generatePubMedStrings = async () => {
    setIsGenerating(true);
    setError(null);
    setSearchStrings(null);
    setStatusMessage('Conectando ao servidor...');
    setProcessingTime(null);
    setGeneratedDatabases(new Set());
    setShowDatabaseButtons(false);
    setDatabaseErrors({});

    try {
      // Processar apenas PubMed
      const pubmedDb = databases.find(db => db.value === 'pubmed');
      const success = await processDatabase(pubmedDb);
      
      if (success) {
        setHasGenerated(true);
        setShowDatabaseButtons(true);
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      setCurrentDatabase(null);
    }
  };

  // Função para gerar strings de uma base específica
  const generateDatabaseStrings = async (database) => {
    if (generatedDatabases.has(database.key) || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const success = await processDatabase(database);
      
      if (success) {
        console.log(`Strings geradas para ${database.name}`);
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      setCurrentDatabase(null);
    }
  };

  // Função para tentar novamente
  const retryDatabase = async (database) => {
    setRetryingDatabase(database.key);
    await generateDatabaseStrings(database);
  };

  // Gera automaticamente PubMed quando recebe meshContent
  useEffect(() => {
    if (meshContent && !hasGenerated && !isGenerating) {
      generatePubMedStrings();
    }
  }, [meshContent]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedString(id);
    setTimeout(() => setCopiedString(null), 2000);
  };

  const toggleDatabase = (dbKey) => {
    setCollapsedDatabases((prev) => ({
      ...prev,
      [dbKey]: !prev[dbKey],
    }));
  };

  // Função para verificar se deve mostrar a base
  const shouldShowDatabase = (db) => {
    return generatedDatabases.has(db.key);
  };

  // Função para obter informação de tempo
  const getTimeInfo = () => {
    if (!processingTime) return null;
    return `${processingTime}s`;
  };

  // Função para obter o estilo do botão
  const getButtonStyle = (database) => {
    const isGenerated = generatedDatabases.has(database.key);
    const hasError = databaseErrors[database.key];
    const isProcessing = isGenerating && currentDatabase === database.name;
    
    if (hasError) {
      return {
        background: 'linear-gradient(to right, rgb(239, 68, 68), rgb(220, 38, 38))',
        cursor: 'pointer'
      };
    }
    if (isGenerated) {
      return {
        background: 'linear-gradient(to right, rgb(156, 163, 175), rgb(107, 114, 128))',
        cursor: 'not-allowed',
        opacity: '0.6'
      };
    }
    if (isGenerating) {
      return {
        background: 'linear-gradient(to right, rgb(209, 213, 219), rgb(156, 163, 175))',
        cursor: 'not-allowed',
        opacity: '0.7'
      };
    }
    return {
      background: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
      cursor: 'pointer'
    };
  };

  // Componente de erro amigável
  const ErrorDisplay = ({ database, errorMessage }) => (
    <div className={cn(
      'p-6 rounded-lg text-center space-y-4',
      isDark ? 'bg-gray-800' : 'bg-orange-50'
    )}>
      <div className="flex justify-center">
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center',
          isDark ? 'bg-orange-900/20' : 'bg-orange-100'
        )}>
          <CloudOff className={cn(
            'w-10 h-10',
            isDark ? 'text-orange-400' : 'text-orange-600'
          )} />
        </div>
      </div>
      
      <div>
        <h3 className={cn(
          'text-lg font-semibold mb-2',
          isDark ? 'text-orange-300' : 'text-orange-800'
        )}>
          Ops! Algo não saiu como esperado
        </h3>
        <p className={cn(
          'text-sm mb-1',
          isDark ? 'text-gray-300' : 'text-gray-700'
        )}>
          Não conseguimos gerar as strings para {database.name} desta vez.
        </p>
        <p className={cn(
          'text-xs opacity-70',
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}>
          Mas não se preocupe, isso acontece às vezes!
        </p>
      </div>

      <button
        onClick={() => retryDatabase(database)}
        disabled={retryingDatabase === database.key}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
          'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
          'text-white shadow-lg hover:shadow-xl transform hover:scale-105',
          retryingDatabase === database.key && 'opacity-70 cursor-not-allowed'
        )}
      >
        {retryingDatabase === database.key ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
        <span>
          {retryingDatabase === database.key 
            ? 'Tentando novamente...' 
            : 'Vamos tentar de novo! Vai dar certo!'
          }
        </span>
        <Zap className="w-4 h-4" />
      </button>

      <p className={cn(
        'text-xs',
        isDark ? 'text-gray-500' : 'text-gray-500'
      )}>
        Detalhes técnicos: {errorMessage}
      </p>
    </div>
  );

  return (
    <div className="space-y-4 mt-6">
      {/* Indicador de status */}
      <div className="flex justify-center">
        {error && !showDatabaseButtons ? (
          // Erro no PubMed - mostrar botão de retry
          <div className="space-y-4">
            <ErrorDisplay 
              database={databases.find(db => db.value === 'pubmed')} 
              errorMessage={error}
            />
          </div>
        ) : (
          // Status normal
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg ${isGenerating ? 'animate-pulse' : ''}`}>
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="flex items-center gap-2">
                    Gerando Strings Personalizadas...
                  </span>
                  {statusMessage && <span className="text-xs opacity-80 mt-1">{statusMessage}</span>}
                </div>
              </>
            ) : hasGenerated ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span>Suas strings de pesquisa foram geradas abaixo</span>
                  {getTimeInfo() && (
                    <span className="text-xs opacity-80 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Tempo total: {getTimeInfo()}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Preparando geração das strings{dots}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Botões para gerar strings de outras bases */}
      {showDatabaseButtons && (
        <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-900/50 border-purple-800/50' : 'bg-purple-50 border-purple-200'}`}>
          <h4 className={`font-semibold text-base mb-4 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
            Gerar Strings para Outras Bases de Dados
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {databases.filter(db => db.value !== 'pubmed').map((db) => {
              const isGenerated = generatedDatabases.has(db.key);
              const hasError = databaseErrors[db.key];
              const isProcessing = isGenerating && currentDatabase === db.name;
              const isRetrying = retryingDatabase === db.key;
              const buttonStyle = getButtonStyle(db);
              
              return (
                <button
                  key={db.key}
                  onClick={() => hasError ? retryDatabase(db) : generateDatabaseStrings(db)}
                  disabled={(isGenerated && !hasError) || isGenerating}
                  className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md transform text-white overflow-hidden hover:shadow-xl hover:scale-105"
                  style={buttonStyle}
                >
                  {isProcessing || isRetrying ? (
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  ) : hasError ? (
                    <RefreshCw className="w-4 h-4 relative z-10" />
                  ) : isGenerated ? (
                    <CheckCheck className="w-4 h-4 relative z-10" />
                  ) : (
                    <Plus className="w-4 h-4 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {hasError ? 'Tentar Novamente' : db.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className={`text-xs mt-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Clique em cada base para gerar suas strings de busca personalizadas
          </p>
        </div>
      )}

      {/* Resultados das strings geradas */}
      {searchStrings && (
        <div className="space-y-4 animate-fadeIn">
          {/* Pergunta de Pesquisa e Elementos */}
          <div className={cn('p-6 rounded-lg', isDark ? 'bg-gray-800' : 'bg-blue-50')}>
            <div className="space-y-4">
              {/* Pergunta de Pesquisa */}
              <div>
                <p className="text-sm font-semibold opacity-70 mb-2">
                  Pergunta de Pesquisa Estruturada ({researchData.format})
                </p>
                <p className="text-base font-medium">{researchData.question}</p>
              </div>
              {/* Elementos Identificados */}
              <div className="border-t pt-4 mt-4 border-opacity-20">
                <p className="text-sm font-semibold opacity-70 mb-3">Elementos Identificados</p>
                <div className="space-y-3">
                  {Object.entries(researchData.elements.explicit).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <span
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        )}
                      >
                        {key}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">
                          {getElementLabel(key, researchData.format)}
                        </div>
                        <p className="text-sm opacity-80 mt-1">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legenda sobre os tipos de strings */}
          <div
            className={cn(
              'p-4 rounded-lg border',
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}
          >
            <h4 className="font-semibold mb-3 text-sm">Tipos de Strings de Busca</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Sugestão de String Ampla</p>
                  <p className="text-xs opacity-70 mt-1">
                    Para revisão abrangente da literatura, capturando o máximo de estudos relevantes
                    sobre o tema
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                  )}
                >
                  <Microscope className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Sugestão de String Específica</p>
                  <p className="text-xs opacity-70 mt-1">
                    Para busca focada e precisa, seguindo rigorosamente os elementos do acrônimo
                    identificado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strings por base de dados */}
          <div className="space-y-3">
            {databases.map((db) => {
              const broadString = searchStrings.search_strings?.broad?.[db.key];
              const specificString = searchStrings.search_strings?.specific?.[db.key];
              const isCollapsed = collapsedDatabases[db.key] === true;
              const hasError = databaseErrors[db.key];

              // Mostrar se tem erro ou se tem strings geradas
              if (!broadString && !specificString && !hasError) return null;

              return (
                <div
                  key={db.key}
                  className={cn(
                    'rounded-lg overflow-hidden border transition-all',
                    isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
                    'hover:shadow-md'
                  )}
                >
                  {/* Header da base de dados */}
                  <div
                    className={cn(
                      'px-4 py-3 flex items-center justify-between cursor-pointer',
                      'hover:opacity-90 transition-opacity',
                      isDark ? 'bg-gray-800' : 'bg-gray-50'
                    )}
                    onClick={() => toggleDatabase(db.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Database
                        className={cn(
                          'w-5 h-5',
                          db.color === 'blue' && 'text-blue-500',
                          db.color === 'amber' && 'text-amber-500',
                          db.color === 'green' && 'text-green-500',
                          db.color === 'purple' && 'text-purple-500',
                          db.color === 'orange' && 'text-orange-500',
                          db.color === 'red' && 'text-red-500',
                          db.color === 'teal' && 'text-teal-500',
                          db.color === 'indigo' && 'text-indigo-500',
                          db.color === 'pink' && 'text-pink-500'
                        )}
                      />
                      <h5 className="font-medium">{db.name}</h5>
                      {hasError && (
                        <span className="text-xs text-red-500 font-medium">
                          (Erro - Clique para expandir)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronUp className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Conteúdo das strings ou erro - Expandido por padrão */}
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {hasError ? (
                        <div className="p-6">
                          <ErrorDisplay 
                            database={db} 
                            errorMessage={hasError}
                          />
                        </div>
                      ) : (
                        <>
                          {/* String Ampla */}
                          {broadString && (
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                                      'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                    )}
                                  >
                                    <BookOpen className="w-3 h-3" />
                                  </div>
                                  <h6 className="font-medium text-sm">
                                    Sugestão de String Ampla para Revisão de Literatura
                                  </h6>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a href={generateSearchUrl(db, broadString)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                                      'text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Search className="w-3 h-3" />
                                    {db.needsAuth ? db.authMessage : 'Buscar'}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(broadString, `broad-${db.key}`);
                                    }}
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                      isDark
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                                    )}
                                  >
                                    {copiedString === `broad-${db.key}` ? (
                                      <>
                                        <CheckCheck className="w-4 h-4 text-green-500" />
                                        Copiado!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4" />
                                        Copiar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  'p-3 rounded font-mono text-sm overflow-x-auto',
                                  isDark ? 'bg-gray-800' : 'bg-blue-50',
                                  'border',
                                  isDark ? 'border-gray-700' : 'border-blue-200'
                                )}
                              >
                                <pre className="whitespace-pre-wrap break-words text-xs">
                                  {broadString}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* String Específica */}
                          {specificString && (
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                                      'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                                    )}
                                  >
                                    <Microscope className="w-3 h-3" />
                                  </div>
                                  <h6 className="font-medium text-sm">
                                    Sugestão de String Específica para Busca Focada
                                  </h6>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a href={generateSearchUrl(db, specificString)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                                      'text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Search className="w-3 h-3" />
                                    {db.needsAuth ? db.authMessage : 'Buscar'}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(specificString, `specific-${db.key}`);
                                    }}
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                      isDark
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                                    )}
                                  >
                                    {copiedString === `specific-${db.key}` ? (
                                      <>
                                        <CheckCheck className="w-4 h-4 text-green-500" />
                                        Copiado!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4" />
                                        Copiar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  'p-3 rounded font-mono text-sm overflow-x-auto',
                                  isDark ? 'bg-gray-800' : 'bg-purple-50',
                                  'border',
                                  isDark ? 'border-gray-700' : 'border-purple-200'
                                )}
                              >
                                <pre className="whitespace-pre-wrap break-words text-xs">
                                  {specificString}
                                </pre>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

SearchStringGenerator.propTypes = {
  meshContent: PropTypes.string.isRequired,
  researchData: PropTypes.shape({
    format: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    elements: PropTypes.shape({
      explicit: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default SearchStringGenerator;