// components/SearchStringGenerator.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Sparkles, Loader2, Copy, CheckCheck, ChevronDown, 
  ChevronUp, Database, AlertCircle, CheckCircle2, Target,
  BookOpen, Microscope, ExternalLink, Rocket, Search
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

  // Configuração das bases de dados com URLs
  const databases = [
    { 
      key: 'PubMed', 
      name: 'PubMed', 
      color: 'blue',
      baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/?term=',
      needsAuth: false
    },
    { 
      key: 'SciELO', 
      name: 'SciELO', 
      color: 'amber',
      baseUrl: 'https://search.scielo.org/?q=',
      needsAuth: false
    },
    { 
      key: 'Europe_PMC', 
      name: 'Europe PMC', 
      color: 'green',
      baseUrl: 'https://europepmc.org/search?query=',
      needsAuth: false
    },
    { 
      key: 'CrossRef', 
      name: 'CrossRef', 
      color: 'purple',
      baseUrl: 'https://search.crossref.org/?q=',
      needsAuth: false
    },
    { 
      key: 'DOAJ', 
      name: 'DOAJ', 
      color: 'orange',
      baseUrl: 'https://doaj.org/search/articles?q=',
      needsAuth: false
    },
    { 
      key: 'Cochrane_Library', 
      name: 'Cochrane Library', 
      color: 'red',
      baseUrl: 'https://www.cochranelibrary.com/search?q=',
      needsAuth: false
    },
    { 
      key: 'LILACS_BVS', 
      name: 'LILACS (via BVS)', 
      color: 'teal',
      baseUrl: 'https://pesquisa.bvsalud.org/portal/?q=',
      needsAuth: false
    },
    { 
      key: 'Scopus', 
      name: 'Scopus', 
      color: 'indigo',
      baseUrl: 'https://www.scopus.com/search/form.uri?display=basic#basic',
      needsAuth: true,
      authMessage: 'Requer login institucional'
    },
    { 
      key: 'Web_of_Science', 
      name: 'Web of Science', 
      color: 'pink',
      baseUrl: 'https://www.webofscience.com/wos/woscc/basic-search',
      needsAuth: true,
      authMessage: 'Requer login institucional'
    }
  ];

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

  const generateSearchStrings = async () => {
    setIsGenerating(true);
    setError(null);
    setSearchStrings(null);
    
    try {
      const response = await fetch('/api/generate-search-strings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meshContent })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSearchStrings(data.data);
        setHasGenerated(true);
      } else {
        setError(data.error || 'Erro ao processar resposta da API');
      }
    } catch (err) {
      console.error('Erro ao gerar strings:', err);
      setError(err.message || 'Erro ao gerar strings de busca');
    } finally {
      setIsGenerating(false);
    }
  };

  // Gera automaticamente quando recebe meshContent
  useEffect(() => {
    if (meshContent && !hasGenerated && !isGenerating) {
      generateSearchStrings();
    }
  }, [meshContent]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedString(id);
    setTimeout(() => setCopiedString(null), 2000);
  };

  const toggleDatabase = (dbKey) => {
    setCollapsedDatabases(prev => ({
      ...prev,
      [dbKey]: !prev[dbKey]
    }));
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Indicador de status */}
      <div className="flex justify-center">
        <div className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-xl font-medium",
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "text-white shadow-lg",
          isGenerating && "animate-pulse"
        )}>
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando Strings Personalizadas...
            </>
          ) : hasGenerated ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Suas strings de pesquisa foram geradas abaixo
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Preparando geração das strings...
            </>
          )}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg flex items-center gap-3",
          isDark ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
        )}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Resultados das strings geradas */}
      {searchStrings && (
        <div className="space-y-4 animate-fadeIn">
          {/* Pergunta de Pesquisa e Elementos */}
          <div className={cn(
            "p-6 rounded-lg",
            isDark ? "bg-gray-800" : "bg-blue-50"
          )}>
            <div className="space-y-4">
              {/* Pergunta de Pesquisa */}
              <div>
                <p className="text-sm font-semibold opacity-70 mb-2">Pergunta de Pesquisa Estruturada ({researchData.format})</p>
                <p className="text-base font-medium">
                  {researchData.question}
                </p>
              </div>
              {/* Elementos Identificados */}
              <div className="border-t pt-4 mt-4 border-opacity-20">
                <p className="text-sm font-semibold opacity-70 mb-3">Elementos Identificados</p>
                <div className="space-y-3">
                  {Object.entries(researchData.elements.explicit).map(([key, value]) => (
                    <div key={key} className="element-display-item">
                      <span className="acronym-letter">{key}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">
                          {getElementLabel(key, researchData.format)}
                        </div>
                        <p className="acronym-description mt-1">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legenda sobre os tipos de strings */}
          <div className={cn(
            "p-4 rounded-lg border",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <h4 className="font-semibold mb-3 text-sm">Tipos de Strings de Busca</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="string-type-badge string-type-broad">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Sugestão de String Ampla</p>
                  <p className="text-xs opacity-70 mt-1">
                    Para revisão abrangente da literatura, capturando o máximo de estudos relevantes sobre o tema
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="string-type-badge string-type-specific">
                  <Microscope className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Sugestão de String Específica</p>
                  <p className="text-xs opacity-70 mt-1">
                    Para busca focada e precisa, seguindo rigorosamente os elementos do acrônimo identificado
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
                    "rounded-lg overflow-hidden border transition-all",
                    isDark 
                      ? "bg-gray-900 border-gray-700" 
                      : "bg-white border-gray-200",
                    "hover:shadow-md"
                  )}
                >
                  {/* Header da base de dados */}
                  <div 
                    className={cn(
                      "px-4 py-3 flex items-center justify-between cursor-pointer",
                      "hover:opacity-90 transition-opacity",
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    )}
                    onClick={() => toggleDatabase(db.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Database className={cn(
                        "w-5 h-5",
                        db.color === 'blue' && "text-blue-500",
                        db.color === 'amber' && "text-amber-500",
                        db.color === 'green' && "text-green-500",
                        db.color === 'purple' && "text-purple-500",
                        db.color === 'orange' && "text-orange-500",
                        db.color === 'red' && "text-red-500",
                        db.color === 'teal' && "text-teal-500",
                        db.color === 'indigo' && "text-indigo-500",
                        db.color === 'pink' && "text-pink-500"
                      )} />
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
                        <div className="p-4 string-section">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="string-type-badge string-type-broad">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <h6 className="font-medium text-sm">Sugestão de String Ampla para Revisão de Literatura</h6>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={generateSearchUrl(db, broadString)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                                  "text-white shadow-md hover:shadow-lg transform hover:scale-105",
                                  "search-database-link"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <BookOpen className="w-4 h-4" />
                                {db.needsAuth ? db.authMessage : `Aplicar String Ampla de Busca no ${db.name}`}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(broadString, `broad-${db.key}`);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                  isDark 
                                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
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
                                    Copiar String Ampla
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className={cn(
                            "p-3 rounded font-mono text-sm overflow-x-auto",
                            isDark ? "bg-gray-800" : "bg-blue-50",
                            "border",
                            isDark ? "border-gray-700" : "border-blue-200"
                          )}>
                            <pre className="whitespace-pre-wrap break-words text-xs">
                              {broadString}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* String Específica */}
                      {specificString && (
                        <div className="p-4 string-section">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="string-type-badge string-type-specific">
                                <Microscope className="w-4 h-4" />
                              </div>
                              <h6 className="font-medium text-sm">Sugestão de String Específica para Busca Focada</h6>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={generateSearchUrl(db, specificString)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                  "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
                                  "text-white shadow-md hover:shadow-lg transform hover:scale-105",
                                  "search-database-link"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Microscope className="w-4 h-4" />
                                {db.needsAuth ? db.authMessage : `Aplicar String Específica de Busca no ${db.name}`}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(specificString, `specific-${db.key}`);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                  isDark 
                                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
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
                                    Copiar String Específica
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className={cn(
                            "p-3 rounded font-mono text-sm overflow-x-auto",
                            isDark ? "bg-gray-800" : "bg-purple-50",
                            "border",
                            isDark ? "border-gray-700" : "border-purple-200"
                          )}>
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
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .search-database-link {
          position: relative;
          overflow: hidden;
        }
        
        .search-database-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .search-database-link:hover::before {
          left: 100%;
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
      explicit: PropTypes.object.isRequired
    }).isRequired
  }).isRequired,
  isDark: PropTypes.bool.isRequired
};

export default SearchStringGenerator;