// components/SearchStringGenerator.jsx
import { useState, useEffect, useRef } from 'react';
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
  Wifi,
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
  const [isConnected, setIsConnected] = useState(false);
  const [dots, setDots] = useState('');
  const [processingPart, setProcessingPart] = useState(null); // 'first', 'second', null
  const [firstPartTime, setFirstPartTime] = useState(null);
  const eventSourceRef = useRef(null);

  // Configuração das bases de dados com URLs
  const databases = [
    {
      key: 'PubMed',
      name: 'PubMed',
      color: 'blue',
      baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/?term=',
      needsAuth: false,
      part: 'first',
    },
    {
      key: 'SciELO',
      name: 'SciELO',
      color: 'amber',
      baseUrl: 'https://search.scielo.org/?q=',
      needsAuth: false,
      part: 'first',
    },
    {
      key: 'Europe_PMC',
      name: 'Europe PMC',
      color: 'green',
      baseUrl: 'https://europepmc.org/search?query=',
      needsAuth: false,
      part: 'first',
    },
    {
      key: 'CrossRef',
      name: 'CrossRef',
      color: 'purple',
      baseUrl: 'https://search.crossref.org/?q=',
      needsAuth: false,
      part: 'first',
    },
    {
      key: 'DOAJ',
      name: 'DOAJ',
      color: 'orange',
      baseUrl: 'https://doaj.org/search/articles?q=',
      needsAuth: false,
      part: 'second',
    },
    {
      key: 'Cochrane_Library',
      name: 'Cochrane Library',
      color: 'red',
      baseUrl: 'https://www.cochranelibrary.com/search?q=',
      needsAuth: false,
      part: 'second',
    },
    {
      key: 'LILACS_BVS',
      name: 'LILACS (via BVS)',
      color: 'teal',
      baseUrl: 'https://pesquisa.bvsalud.org/portal/?q=',
      needsAuth: false,
      part: 'second',
    },
    {
      key: 'Scopus',
      name: 'Scopus',
      color: 'indigo',
      baseUrl: 'https://www.scopus.com/search/form.uri?display=basic#basic',
      needsAuth: true,
      authMessage: 'Requer login institucional',
      part: 'second',
    },
    {
      key: 'Web_of_Science',
      name: 'Web of Science',
      color: 'pink',
      baseUrl: 'https://www.webofscience.com/wos/woscc/basic-search',
      needsAuth: true,
      authMessage: 'Requer login institucional',
      part: 'second',
    },
  ];

  // UseEffect para animar os pontos
  useEffect(() => {
    let interval;
    if (!isGenerating && !hasGenerated && meshContent) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
    } else {
      setDots('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, hasGenerated, meshContent]);

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

  // Função para processar uma parte específica
  const processSearchPart = async (promptType, isFirstPart = true) => {
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-search-strings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meshContent, promptType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setIsConnected(true);

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decodificar e adicionar ao buffer
        buffer += decoder.decode(value, { stream: true });

        // Processar linhas completas
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Guardar última linha incompleta

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              const data = JSON.parse(jsonStr);

              switch (data.type) {
                case 'status':
                  setStatusMessage(data.message);
                  console.log('Status:', data.message);
                  break;

                case 'heartbeat':
                  console.log('Heartbeat recebido:', data.timestamp);
                  break;

                case 'complete':
                  console.log('Evento complete recebido:', data);
                  if (data.success && data.data) {
                    console.log('Dados das strings:', data.data);
                    
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

                    if (isFirstPart) {
                      setFirstPartTime(Math.round((Date.now() - startTime) / 1000));
                    } else {
                      setHasGenerated(true);
                      const totalTime = firstPartTime + Math.round((Date.now() - startTime) / 1000);
                      setProcessingTime(totalTime);
                    }
                    
                    setStatusMessage('');
                    setIsConnected(false);

                    console.log('Parte concluída!', promptType);
                  } else {
                    console.error('Dados incompletos no evento complete:', data);
                  }
                  break;

                case 'progress':
                  setStatusMessage(data.message);
                  console.log('Progresso:', data.message);
                  break;
                  
                case 'error':
                  console.error('Evento de erro recebido:', data);
                  setError(data.error || 'Erro ao processar resposta');
                  setStatusMessage('');
                  setIsConnected(false);
                  break;

                case 'done':
                  setIsConnected(false);
                  break;
              }
            } catch (e) {
              console.error('Erro ao parsear SSE data:', e, 'Linha:', line);
            }
          }
        }
      }

      // Processar qualquer dado restante no buffer
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.type === 'complete' && data.success) {
            setSearchStrings(prevStrings => {
              if (!prevStrings) {
                return data.data;
              }
              
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
          }
        } catch (e) {
          console.error('Erro ao processar buffer final:', e);
        }
      }

      return true; // Sucesso
    } catch (err) {
      console.error('Erro ao gerar strings:', err);
      setError(err.message || 'Erro ao gerar strings de busca');
      setIsConnected(false);
      return false; // Erro
    }
  };

  const generateSearchStrings = async () => {
    setIsGenerating(true);
    setError(null);
    setSearchStrings(null);
    setStatusMessage('Conectando ao servidor...');
    setProcessingTime(null);
    setFirstPartTime(null);
    setIsConnected(false);
    setProcessingPart('first');

    try {
      // Processar primeira parte
      console.log('Processando primeira parte...');
      const firstSuccess = await processSearchPart('primeiraParte', true);
      
      if (firstSuccess) {
        // Processar segunda parte
        console.log('Processando segunda parte...');
        setProcessingPart('second');
        setStatusMessage('Processando bases restantes...');
        await processSearchPart('segundaParte', false);
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      setProcessingPart(null);
    }
  };

  // Gera automaticamente quando recebe meshContent
  useEffect(() => {
    if (meshContent && !hasGenerated && !isGenerating) {
      generateSearchStrings();
    }
  }, [meshContent, hasGenerated, isGenerating]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

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
    if (!searchStrings || !searchStrings.search_strings) return false;
    
    const broadString = searchStrings.search_strings?.broad?.[db.key];
    const specificString = searchStrings.search_strings?.specific?.[db.key];
    
    return broadString || specificString;
  };

  // Função para verificar se deve mostrar indicador de carregamento da segunda parte
  const shouldShowSecondPartLoader = () => {
    return processingPart === 'second' && searchStrings && 
           databases.some(db => db.part === 'first' && shouldShowDatabase(db));
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Indicador de status */}
      <div className="flex justify-center">
        <div
          className={cn(
            'flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all',
            'bg-gradient-to-r from-purple-500 to-pink-500',
            'text-white shadow-lg',
            isGenerating && 'animate-pulse'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="flex items-center gap-2">
                  {processingPart === 'first' 
                    ? 'Gerando Strings Personalizadas (Parte 1/2)...'
                    : processingPart === 'second'
                    ? 'Gerando Strings Personalizadas (Parte 2/2)...'
                    : 'Gerando Strings Personalizadas...'}
                  {isConnected && <Wifi className="w-3 h-3 animate-pulse" />}
                </span>
                {statusMessage && <span className="text-xs opacity-80 mt-1">{statusMessage}</span>}
              </div>
            </>
          ) : hasGenerated ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span>Suas strings de pesquisa foram geradas abaixo</span>
                {processingTime && (
                  <span className="text-xs opacity-80 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Processado em {processingTime}s total ({firstPartTime}s + {processingTime - firstPartTime}s)
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
      </div>

      {/* Erro */}
      {error && (
        <div
          className={cn(
            'p-4 rounded-lg flex items-center gap-3',
            isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
          )}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1 opacity-80">
              O processamento está dividido em duas partes. Por favor, tente novamente.
            </p>
          </div>
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

              if (!broadString && !specificString) return null;

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
                    </div>
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronUp className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Conteúdo das strings - Expandido por padrão */}
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
                              <a
                                href={generateSearchUrl(db, broadString)}
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
                              <a
                                href={generateSearchUrl(db, specificString)}
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
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicador de carregamento da segunda parte */}
            {shouldShowSecondPartLoader() && (
              <div className={cn(
                'p-6 rounded-lg border transition-all',
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
                'animate-pulse'
              )}>
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="font-medium">
                    Processando bases restantes (DOAJ, Cochrane, LILACS, Scopus, Web of Science)...
                  </span>
                </div>
              </div>
            )}
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