// components/IntelligentSearch.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
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
  Lightbulb,
  Copy,
  CheckCheck,
  Info,
  WifiOff,
  RefreshCcw
} from 'lucide-react';
import { cn } from '../lib/utils';

// Componente de erro específico para DeCS
const DecsApiError = ({ isDark, onRetry }) => {
  return (
    <div className={cn(
      "mt-6 rounded-2xl overflow-hidden",
      isDark ? "bg-gray-800" : "bg-white",
      "border-2 border-red-200 dark:border-red-800"
    )}>
      {/* Header com gradiente */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <WifiOff className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">API DeCS Temporariamente Instável</h3>
            <p className="text-white/90 text-sm mt-1">
              O serviço de busca DeCS está temporariamente indisponível
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        <div className={cn(
          "p-4 rounded-lg mb-4",
          isDark ? "bg-red-900/20" : "bg-red-50"
        )}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-900 dark:text-red-100">
                A API do DeCS está instável e não retornou os resultados esperados. 
                Este é um problema temporário do servidor da BIREME.
              </p>
            </div>
          </div>
        </div>

        {/* Informações sobre o DeCS com bandeiras */}
        <div className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-gray-700/50" : "bg-green-50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">
              Sobre o DeCS
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Descritores em Ciências da Saúde - Vocabulário multilíngue da BIREME/OPAS/OMS
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Disponível em:</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <Image src="/flags/br.svg" alt="Português" width={20} height={15} />
                <span className="text-xs">Português</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/flags/es.svg" alt="Español" width={20} height={15} />
                <span className="text-xs">Español</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/flags/us.svg" alt="English" width={20} height={15} />
                <span className="text-xs">English</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/flags/fr.svg" alt="Français" width={20} height={15} />
                <span className="text-xs">Français</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sugestões */}
        <div className="mt-4">
          <p className="text-sm font-medium mb-3">O que você pode fazer:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Tente novamente em alguns minutos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Use a busca MeSH enquanto isso (funciona normalmente)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>Acesse diretamente: <a href="https://decs.bvsalud.org" target="_blank" rel="noopener noreferrer" className="underline">decs.bvsalud.org</a></span>
            </li>
          </ul>
        </div>

        {/* Botão de retry */}
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
              "text-white flex items-center justify-center gap-2"
            )}
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};

const IntelligentSearch = ({ isDark }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingMesh, setIsSearchingMesh] = useState(false);
  const [isSearchingDecs, setIsSearchingDecs] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [meshResults, setMeshResults] = useState(null);
  const [decsResults, setDecsResults] = useState(null);
  const [decsError, setDecsError] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('both');
  const [copiedString, setCopiedString] = useState(null);

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
    setAnalysis(null);
    setMeshResults(null);
    setDecsResults(null);
    setDecsError(false);

    try {
      const response = await fetch('/api/intelligent-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userInput.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao processar busca');
      }
      
      const data = await response.json();
      setAnalysis(data);
      
      if (data.searchTerms && data.searchTerms.length > 0) {
        searchDescriptors(data.searchTerms, searchType);
      }
      
    } catch (err) {
      console.error('❌ Erro na busca:', err);
      setError(err.message || 'Erro ao processar busca');
    } finally {
      setIsLoading(false);
    }
  };

  const searchDescriptors = async (searchTerms, type) => {
    if (!searchTerms || searchTerms.length === 0) return;

    // Buscar MeSH usando a nova API
    if (type === 'mesh' || type === 'both') {
      setIsSearchingMesh(true);
      try {
        const meshResponse = await fetch('/api/intelligent-search-mesh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerms })
        });
        
        if (meshResponse.ok) {
          const meshData = await meshResponse.json();
          setMeshResults(meshData);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar MeSH:', error);
      } finally {
        setIsSearchingMesh(false);
      }
    }

    // Buscar DeCS com simulação de erro temporário
    if (type === 'decs' || type === 'both') {
      setIsSearchingDecs(true);
      setDecsError(false);
      
      try {
        // TEMPORÁRIO: Simular erro após 10 segundos
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('API instável'));
          }, 10000);
        });

        const decsResponse = await fetch('/api/intelligent-search-decs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerms })
        });
        
        if (decsResponse.ok) {
          const decsData = await decsResponse.json();
          setDecsResults(decsData);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar DeCS:', error);
        setDecsError(true);
        setDecsResults(null);
      } finally {
        setIsSearchingDecs(false);
      }
    }
  };

  const retryDecsSearch = () => {
    if (analysis && analysis.searchTerms) {
      searchDescriptors(analysis.searchTerms, 'decs');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedString(id);
    setTimeout(() => setCopiedString(null), 2000);
  };

  const handleExampleClick = (example) => {
    setUserInput(example);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Busca Inteligente com IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Digite sua ideia de pesquisa em português e nossa IA extrairá conceitos, traduzirá para inglês científico e buscará descritores MeSH e DeCS
        </p>
      </div>

      {/* Card principal */}
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
      )}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Área de entrada */}
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

            {/* Exemplos */}
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

            {/* Seletor de tipo de busca com bandeiras */}
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
                  <Image src="/flags/us.svg" alt="English" width={16} height={12} />
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
                  <div className="flex gap-0.5">
                    <Image src="/flags/br.svg" alt="PT" width={14} height={10} />
                    <Image src="/flags/es.svg" alt="ES" width={14} height={10} />
                    <Image src="/flags/us.svg" alt="EN" width={14} height={10} />
                    <Image src="/flags/fr.svg" alt="FR" width={14} height={10} />
                  </div>
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
                  Processando com IA...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar Descritores
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Erro */}
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados da análise */}
      {analysis && (
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
              Conceitos Extraídos e Traduzidos
            </h3>
          </div>

          <CardContent className="p-6">
            {/* Lista de conceitos */}
            {analysis.analysis && analysis.analysis.concepts && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-3">Conceitos Identificados:</h4>
                {analysis.analysis.concepts.map((concept, idx) => (
                  <div key={idx} className={cn(
                    'p-4 rounded-lg border',
                    isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                  )}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Original:</span>
                          <p className="font-medium">{concept.original}</p>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Inglês científico:</span>
                          <p className="font-medium text-blue-600 dark:text-blue-400">{concept.english}</p>
                        </div>
                        {concept.synonyms && concept.synonyms.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sinônimos:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {concept.synonyms.map((syn, i) => (
                                <span key={i} className={cn(
                                  'px-2 py-1 rounded-full text-xs',
                                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-700'
                                )}>
                                  {syn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(concept.english, `concept-${idx}`)}
                        className={cn(
                          'p-2 rounded transition-all',
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        )}
                        title="Copiar termo em inglês"
                      >
                        {copiedString === `concept-${idx}` ? (
                          <CheckCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo */}
            {analysis.analysis && analysis.analysis.summary && (
              <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium mb-2">Resumo da Pesquisa:</h4>
                <p className="text-sm">{analysis.analysis.summary}</p>
              </div>
            )}

            {/* Status das buscas */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {isSearchingMesh && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span>Buscando MeSH...</span>
                </div>
              )}
              {isSearchingDecs && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  <span>Buscando DeCS...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro específico do DeCS */}
      {decsError && (searchType === 'decs' || searchType === 'both') && (
        <DecsApiError isDark={isDark} onRetry={retryDecsSearch} />
      )}

      {/* Resultados MeSH */}
      {meshResults && meshResults.allMeshTerms && meshResults.allMeshTerms.length > 0 && (
        <Card className={cn(
          'mt-6 overflow-hidden',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
        )}>
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Descritores MeSH Encontrados ({meshResults.totalTerms})
              <Image src="/flags/us.svg" alt="English" width={20} height={15} className="ml-2" />
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              {meshResults.allMeshTerms.slice(0, 10).map((term, idx) => (
                <div key={idx} className={cn(
                  'p-4 rounded-lg border',
                  isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-lg flex items-center gap-2">
                        {term.term}
                        <Image src="/flags/us.svg" alt="English" width={16} height={12} />
                      </h5>
                      {term.definition && (
                        <p className="text-sm opacity-80 mt-2">{term.definition}</p>
                      )}
                      {term.synonyms && term.synonyms.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Sinônimos:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {term.synonyms.slice(0, 3).map((syn, i) => (
                              <span key={i} className="text-xs opacity-70">{syn}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs opacity-60">
                        MeSH ID: {term.meshId}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        'px-3 py-1 rounded-lg font-bold text-sm',
                        term.relevanceScore >= 90
                          ? 'bg-green-500 text-white'
                          : term.relevanceScore >= 80
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                      )}>
                        {term.relevanceScore}%
                      </div>
                      <button
                        onClick={() => copyToClipboard(term.term, `mesh-${idx}`)}
                        className={cn(
                          'p-1.5 rounded transition-all',
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        )}
                        title="Copiar termo"
                      >
                        {copiedString === `mesh-${idx}` ? (
                          <CheckCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados DeCS */}
      {decsResults && decsResults.allDecsTerms && decsResults.allDecsTerms.length > 0 && (
        <Card className={cn(
          'mt-6 overflow-hidden',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
        )}>
          <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Languages className="w-6 h-6" />
              Descritores DeCS Encontrados ({decsResults.totalTerms})
              <div className="flex gap-1 ml-2">
                <Image src="/flags/br.svg" alt="Português" width={20} height={15} />
                <Image src="/flags/es.svg" alt="Español" width={20} height={15} />
                <Image src="/flags/us.svg" alt="English" width={20} height={15} />
                <Image src="/flags/fr.svg" alt="Français" width={20} height={15} />
              </div>
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              {decsResults.allDecsTerms.slice(0, 10).map((term, idx) => (
                <div key={idx} className={cn(
                  'p-4 rounded-lg border',
                  isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {term.terms && (
                        <div className="space-y-1">
                          {term.terms.pt && (
                            <div className="flex items-center gap-2">
                              <Image src="/flags/br.svg" alt="Português" width={16} height={12} />
                              <span className="font-semibold">{term.terms.pt}</span>
                            </div>
                          )}
                          {term.terms.en && (
                            <div className="flex items-center gap-2">
                              <Image src="/flags/us.svg" alt="English" width={16} height={12} />
                              <span>{term.terms.en}</span>
                            </div>
                          )}
                          {term.terms.es && (
                            <div className="flex items-center gap-2">
                              <Image src="/flags/es.svg" alt="Español" width={16} height={12} />
                              <span>{term.terms.es}</span>
                            </div>
                          )}
                          {term.terms.fr && (
                            <div className="flex items-center gap-2">
                              <Image src="/flags/fr.svg" alt="Français" width={16} height={12} />
                              <span>{term.terms.fr}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {term.definitions && term.definitions.pt && (
                        <p className="text-sm opacity-80 mt-2">{term.definitions.pt}</p>
                      )}
                      <div className="mt-2 text-xs opacity-60">
                        DeCS ID: {term.decsId}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        'px-3 py-1 rounded-lg font-bold text-sm',
                        term.relevanceScore >= 90
                          ? 'bg-green-500 text-white'
                          : term.relevanceScore >= 80
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                      )}>
                        {term.relevanceScore}%
                      </div>
                      <button
                        onClick={() => copyToClipboard(
                          term.terms?.pt || term.terms?.en || '',
                          `decs-${idx}`
                        )}
                        className={cn(
                          'p-1.5 rounded transition-all',
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                        )}
                        title="Copiar termo"
                      >
                        {copiedString === `decs-${idx}` ? (
                          <CheckCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

IntelligentSearch.propTypes = {
  isDark: PropTypes.bool.isRequired
};

export default IntelligentSearch;