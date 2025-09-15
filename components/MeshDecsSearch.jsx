// components/MeshDecsSearch.jsx
/**
 * Componente para busca de descritores controlados MeSH e DeCS
 * Com animações de loading e layout melhorado
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import {
  Search,
  Globe,
  Loader2,
  CheckCircle,
  Copy,
  CheckCheck,
  Info,
  Sparkles,
  Database,
  Cpu,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Activity,
  Code,
  Terminal,
  GitBranch,
  Timer,
  Hash,
  FileJson,
  Server,
  ChevronRight,
  Package,
  Layers,
  TrendingUp,
  Key,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Tag,
  List,
  TreePine,
  Languages,
  Brain,
  Microscope,
  Stethoscope,
  Heart,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getElementLabel, getElementColor, getElementSigla } from '../lib/frameworkMappings';

// Componente de Erro específico para DeCS
const DecsErrorMessage = ({ isDark, onRetry }) => {
  return (
    <div className={cn(
      "mt-6 rounded-xl overflow-hidden animate-fadeIn",
      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      "border shadow-lg"
    )}>
      {/* Header com gradiente verde */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <WifiOff className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">
            API DeCS Temporariamente Indisponível
          </h3>
        </div>
      </div>
      
      {/* Conteúdo do erro */}
      <div className="p-6">
        <div className={cn(
          "p-4 rounded-lg mb-4",
          isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200",
          "border"
        )}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className={cn(
                "font-medium mb-2",
                isDark ? "text-red-100" : "text-red-900"
              )}>
                A API do DeCS está instável e não retornou os resultados
              </p>
              <p className={cn(
                "text-sm",
                isDark ? "text-red-200" : "text-red-700"
              )}>
                O serviço de Descritores em Ciências da Saúde (DeCS) está temporariamente indisponível. 
                Por favor, tente novamente em alguns minutos.
              </p>
            </div>
          </div>
        </div>

        {/* Card informativo sobre o DeCS */}
        <div className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-gray-700/50" : "bg-green-50"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <Languages className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">
              Sobre o DeCS
            </span>
            <div className="flex gap-1 ml-auto">
              <Image src="/flags/br.svg" alt="Português" width={20} height={15} />
              <Image src="/flags/es.svg" alt="Español" width={20} height={15} />
              <Image src="/flags/us.svg" alt="English" width={20} height={15} />
              <Image src="/flags/fr.svg" alt="Français" width={20} height={15} />
            </div>
          </div>
          <p className="text-sm opacity-80">
            O DeCS é um vocabulário multilíngue da BIREME/OPAS/OMS com mais de 36.000 termos 
            em 4 idiomas, essencial para pesquisas em bases latino-americanas como LILACS e BVS.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onRetry}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium transition-all",
              "bg-gradient-to-r from-green-500 to-green-600 text-white",
              "hover:from-green-600 hover:to-green-700",
              "flex items-center justify-center gap-2"
            )}
          >
            <Languages className="w-4 h-4" />
            Tentar Novamente
          </button>
          <a
            href="https://decs.bvsalud.org"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "py-3 px-4 rounded-lg font-medium transition-all",
              isDark 
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700",
              "flex items-center justify-center gap-2"
            )}
          >
            Acessar DeCS
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

// Componente de Loading com animação
const LoadingAnimation = ({ isLoading, type = 'mesh' }) => {
  const [dots, setDots] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setDots('');
      setProgress(0);
      return;
    }

    // Animação dos pontos
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Progresso simulado
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 15;
      });
    }, 1000);

    // Mensagens rotativas
    const messages = type === 'mesh' 
      ? [
          'Conectando ao NCBI...',
          'Buscando no vocabulário MeSH...',
          'Analisando descritores médicos...',
          'Processando termos encontrados...',
          'Calculando relevância dos termos...',
          'Organizando resultados...'
        ]
      : [
          'Conectando à BIREME...',
          'Buscando no DeCS multilíngue...',
          'Processando termos em português...',
          'Analisando traduções...',
          'Verificando sinônimos...',
          'Preparando resultados...'
        ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2500);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, type]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideIn">
        {/* Header com ícone animado */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 animate-ping">
              <div className={cn(
                "w-20 h-20 rounded-full",
                type === 'mesh' 
                  ? "bg-blue-400/30" 
                  : "bg-green-400/30"
              )} />
            </div>
            <div className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center animate-pulse",
              type === 'mesh'
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-green-500 to-green-600"
            )}>
              {type === 'mesh' ? (
                <Globe className="w-10 h-10 text-white animate-spin-slow" />
              ) : (
                <Languages className="w-10 h-10 text-white animate-wiggle" />
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Buscando {type === 'mesh' ? 'MeSH' : 'DeCS'}
          </h3>
          
          {/* Bandeiras para DeCS */}
          {type === 'decs' && (
            <div className="flex gap-2 mt-2">
              <Image src="/flags/br.svg" alt="Português" width={20} height={15} />
              <Image src="/flags/es.svg" alt="Español" width={20} height={15} />
              <Image src="/flags/us.svg" alt="English" width={20} height={15} />
              <Image src="/flags/fr.svg" alt="Français" width={20} height={15} />
            </div>
          )}
        </div>

        {/* Mensagem de status */}
        <div className="mb-6">
          <p className="text-center text-gray-600 dark:text-gray-300 min-h-[24px]">
            {loadingMessage}{dots}
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-out",
                type === 'mesh'
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Indicadores visuais animados */}
        <div className="flex justify-center gap-2">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-8 rounded-full animate-wave",
                  type === 'mesh' ? "bg-blue-500" : "bg-green-500"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Dica informativa */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 {type === 'mesh' 
              ? 'MeSH contém mais de 30.000 descritores médicos' 
              : 'DeCS está disponível em 4 idiomas'}
          </p>
        </div>
      </div>
    </div>
  );
};

const MeshDecsSearch = ({ researchData, isDark, conversations, finalResult, preloadedResults, hideSearchButtons }) => {
  // ========== Estados para MeSH ==========
  const [meshResults, setMeshResults] = useState(null);
  const [allMeshTerms, setAllMeshTerms] = useState(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshDebug, setMeshDebug] = useState(null);
  
  // ========== Estados para DeCS ==========
  const [decsResults, setDecsResults] = useState(null);
  const [allDecsTerms, setAllDecsTerms] = useState(null);
  const [decsLoading, setDecsLoading] = useState(false);
  const [decsError, setDecsError] = useState(false);
  
  // ========== Estados gerais ==========
  const [activeView, setActiveView] = useState('selection');
  const [copiedString, setCopiedString] = useState(null);
  const [collapsedElements, setCollapsedElements] = useState({});
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [uniqueTermsCollapsed, setUniqueTermsCollapsed] = useState(false);
  const [error, setError] = useState(null);

  // UseEffect para carregar resultados pré-carregados
  useEffect(() => {
    if (preloadedResults) {
      if (preloadedResults.mesh) {
        setMeshResults(preloadedResults.mesh.results || preloadedResults.mesh);
        setAllMeshTerms(preloadedResults.mesh.allMeshTerms || preloadedResults.mesh);
        if (!hideSearchButtons) {
          setActiveView('mesh');
        }
      }
      if (preloadedResults.decs) {
        setDecsResults(preloadedResults.decs.results || preloadedResults.decs);
        setAllDecsTerms(preloadedResults.decs.allDecsTerms || preloadedResults.decs);
        if (!preloadedResults.mesh && !hideSearchButtons) {
          setActiveView('decs');
        }
      }
      // Se temos resultados pré-carregados e hideSearchButtons está true, 
      // mostrar automaticamente os resultados
      if (hideSearchButtons && (preloadedResults.mesh || preloadedResults.decs)) {
        setActiveView(preloadedResults.mesh ? 'mesh' : 'decs');
      }
    }
  }, [preloadedResults, hideSearchButtons]);

  // Se hideSearchButtons está true e não temos resultados ainda, não mostrar nada
  if (hideSearchButtons && !meshResults && !decsResults && !meshLoading && !decsLoading) {
    return null;
  }

  /**
   * Função para buscar termos MeSH
   */
  const searchMeSH = async () => {
    setMeshLoading(true);
    setMeshResults(null);
    setAllMeshTerms(null);
    setMeshDebug(null);
    setError(null);
    setActiveView('mesh');

    try {
      const payload = {
        frameworkElements: researchData.elements.explicit,
        fullQuestion: researchData.question,
        frameworkType: researchData.format,
      };

      console.log('📤 Enviando payload para busca MeSH:', payload);

      const response = await fetch('/api/search-mesh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da busca MeSH:', data);

      setMeshResults(data.results);
      setAllMeshTerms(data.allMeshTerms);
      setMeshDebug(data.debug);

    } catch (error) {
      console.error('❌ Erro na busca MeSH:', error);
      setError({
        type: 'mesh',
        message: error.message
      });
      setMeshDebug({
        'ERRO': error.message,
        'STACK': error.stack,
      });
    } finally {
      setMeshLoading(false);
    }
  };

  /**
   * Função para buscar termos DeCS
   */
  const searchDeCS = async () => {
    setDecsLoading(true);
    setDecsResults(null);
    setAllDecsTerms(null);
    setError(null);
    setDecsError(false);
    setActiveView('decs');

    try {
      const payload = {
        frameworkElements: researchData.elements.explicit,
        fullQuestion: researchData.question,
        frameworkType: researchData.format,
      };

      console.log('📤 Enviando payload para busca DeCS:', payload);

      const response = await fetch('/api/search-decs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na API DeCS: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da busca DeCS:', data);

      // Verifica se a resposta está vazia ou inválida
      if (!data || (!data.results && !data.allDecsTerms)) {
        throw new Error('API DeCS não retornou dados válidos');
      }

      setDecsResults(data.results);
      setAllDecsTerms(data.allDecsTerms);

    } catch (error) {
      console.error('❌ Erro na busca DeCS:', error);
      setDecsError(true);
      setActiveView('decs'); // Mantém na view do DeCS para mostrar o erro
    } finally {
      setDecsLoading(false);
    }
  };

  /**
   * Helpers para internacionalização
   */
  const getFlagEmoji = (language) => {
    const flags = {
      pt: '🇧🇷',
      es: '🇪🇸',
      en: '🇺🇸',
      fr: '🇫🇷'
    };
    return flags[language] || '🌍';
  };

  const getLanguageName = (language) => {
    const names = {
      pt: 'Português',
      es: 'Español',
      en: 'English',
      fr: 'Français'
    };
    return names[language] || language.toUpperCase();
  };

  /**
   * Função para copiar texto para a área de transferência
   */
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedString(id);
    setTimeout(() => setCopiedString(null), 2000);
  };

  /**
   * Renderiza os resultados da busca (MeSH ou DeCS)
   */
  const renderResults = (results, isDeCS = false) => {
    if (!results) return null;

    return (
      <div className="space-y-6">
        {/* Cards de estatísticas com novo design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn(
            'p-4 rounded-xl text-center transition-all hover:scale-105',
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100'
          )}>
            <Microscope className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-sm opacity-70">Elementos {researchData.format}</div>
          </div>
          
          <div className={cn(
            'p-4 rounded-xl text-center transition-all hover:scale-105',
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-green-50 to-green-100'
          )}>
            <Brain className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {results.reduce((acc, r) => acc + r.terms.length, 0)}
            </div>
            <div className="text-sm opacity-70">Termos Encontrados</div>
          </div>
          
          <div className={cn(
            'p-4 rounded-xl text-center transition-all hover:scale-105',
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-purple-50 to-purple-100'
          )}>
            <Stethoscope className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...results.flatMap((r) => r.terms.map((t) => t.relevanceScore || 0)), 0) || 0}%
            </div>
            <div className="text-sm opacity-70">Maior Relevância</div>
          </div>
          
          <div className={cn(
            'p-4 rounded-xl text-center transition-all hover:scale-105',
            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-orange-50 to-orange-100'
          )}>
            <Heart className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">
              {isDeCS ? (allDecsTerms ? allDecsTerms.length : 0) : (allMeshTerms ? allMeshTerms.length : 0)}
            </div>
            <div className="text-sm opacity-70">Termos Únicos</div>
          </div>
        </div>

        {/* Resultados por elemento do framework */}
        {results.map((elementResult, idx) => {
          const hasTerms = elementResult.terms && elementResult.terms.length > 0;
          let highRelevanceTerms = [];
          let lowRelevanceTerms = [];
          let visibleTerms = [];
          let collapsedTerms = [];

          if (hasTerms) {
            highRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore >= 95);
            lowRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore < 95);
            visibleTerms = highRelevanceTerms.length > 0 ? highRelevanceTerms : [elementResult.terms[0]];
            collapsedTerms = highRelevanceTerms.length > 0 ? lowRelevanceTerms : elementResult.terms.slice(1);
          }

          const elementKey = `element-${idx}`;
          const isCollapsed = collapsedElements[elementKey] !== false;
          const elementLabel = getElementLabel(elementResult.element, researchData.format);
          const elementSigla = getElementSigla(elementResult.element, researchData.format) || elementResult.element;

          return (
            <div key={idx} className="mesh-result-card">
              <div className={cn(
                'rounded-xl overflow-hidden transition-all hover:shadow-xl',
                isDark ? 'bg-gray-800' : 'bg-white',
                'shadow-sm'
              )}>
                {/* Cabeçalho do elemento com gradiente */}
                <div className={cn(
                  'p-6 border-b',
                  isDark 
                    ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800' 
                    : isDeCS
                      ? 'border-green-100 bg-gradient-to-r from-green-50 to-green-100'
                      : 'border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="element-display-item flex-1">
                      <span className={cn(
                        "acronym-letter",
                        isDeCS ? "bg-green-500" : "bg-blue-500"
                      )}>{elementSigla}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{elementLabel}</div>
                        <p className="acronym-description mt-1">
                          {elementResult.originalText || 'Descrição não disponível'}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    )}>
                      {elementResult.terms.length} termos
                    </span>
                  </div>
                </div>

                {/* Lista de termos */}
                <div className="p-6 space-y-3">
                  {hasTerms ? (
                    <>
                      {/* Termos visíveis */}
                      {visibleTerms.map((term, termIdx) => (
                        <div
                          key={termIdx}
                          className={cn(
                            'term-card p-4 rounded-lg border transition-all hover:transform hover:scale-[1.02]',
                            isDark
                              ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                <h5 className="font-semibold text-lg term-highlight">
                                  {isDeCS ? (
                                    <div className="space-y-1">
                                      {term.terms && Object.entries(term.terms).map(([lang, termText]) => (
                                        termText && (
                                          <div key={lang} className="flex items-center gap-2">
                                            <Image 
                                              src={`/flags/${lang === 'pt' ? 'br' : lang === 'en' ? 'us' : lang}.svg`} 
                                              alt={getLanguageName(lang)} 
                                              width={20} 
                                              height={15} 
                                              className="inline-block"
                                            />
                                            <span>{termText}</span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  ) : (
                                    term.term
                                  )}
                                </h5>
                              </div>

                              {/* Definições */}
                              {isDeCS && term.definitions ? (
                                <div className="space-y-2">
                                  {Object.entries(term.definitions).map(([lang, def]) => (
                                    def && (
                                      <div key={lang} className="text-sm opacity-80">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Image 
                                            src={`/flags/${lang === 'pt' ? 'br' : lang === 'en' ? 'us' : lang}.svg`} 
                                            alt={getLanguageName(lang)} 
                                            width={16} 
                                            height={12} 
                                            className="inline-block"
                                          />
                                          <span className="font-medium">{getLanguageName(lang)}:</span>
                                        </div>
                                        <p className="mt-1 ml-6">{def}</p>
                                      </div>
                                    )
                                  ))}
                                </div>
                              ) : (
                                term.definition && (
                                  <p className="text-sm opacity-80 leading-relaxed">
                                    {term.definition}
                                  </p>
                                )
                              )}

                              {/* Metadados */}
                              <div className="flex items-center gap-4 mt-3 text-xs opacity-60">
                                {isDeCS ? (
                                  <>
                                    {term.decsId && (
                                      <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        <strong>DeCS ID: {term.decsId}</strong>
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {term.meshId && (
                                      <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        <strong>MeSH ID: {term.meshId}</strong>
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              {/* Badge de relevância */}
                              {term.relevanceScore && (
                                <div className={cn(
                                  'relevance-badge px-3 py-1.5 rounded-lg font-bold text-sm',
                                  term.relevanceScore >= 90
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                    : term.relevanceScore >= 80
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                )}>
                                  {term.relevanceScore}%
                                </div>
                              )}

                              {/* Botão copiar */}
                              <button
                                onClick={() => {
                                  const textToCopy = isDeCS && term.terms ? 
                                    Object.values(term.terms).filter(t => t).join(' | ') : 
                                    term.term;
                                  copyToClipboard(textToCopy, `element-${idx}-term-${termIdx}`);
                                }}
                                className={cn(
                                  'p-1.5 rounded transition-all copy-button',
                                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                )}
                                title="Copiar termo"
                              >
                                {copiedString === `element-${idx}-term-${termIdx}` ? (
                                  <CheckCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 opacity-50" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Botão para expandir/colapsar */}
                      {collapsedTerms.length > 0 && (
                        <>
                          <button
                            onClick={() =>
                              setCollapsedElements({
                                ...collapsedElements,
                                [elementKey]: !isCollapsed,
                              })
                            }
                            className={cn(
                              'w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                              isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            )}
                          >
                            {isCollapsed ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                            {isCollapsed
                              ? `Ver ${collapsedTerms.length} termos adicionais`
                              : `Ocultar ${collapsedTerms.length} termos`}
                          </button>

                          {/* Termos colapsados */}
                          {!isCollapsed &&
                            collapsedTerms.map((term, termIdx) => (
                              <div
                                key={`collapsed-${termIdx}`}
                                className={cn(
                                  'term-card p-4 rounded-lg border transition-all',
                                  isDark
                                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <h5 className="font-semibold">
                                      {isDeCS && term.terms ? 
                                        Object.values(term.terms).filter(t => t)[0] : 
                                        term.term}
                                    </h5>
                                    {term.definition && (
                                      <p className="text-sm opacity-80">
                                        {term.definition}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-start gap-2">
                                    {term.relevanceScore && (
                                      <div className={cn(
                                        'px-2 py-1 rounded text-xs font-bold',
                                        term.relevanceScore >= 80
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-500 text-white'
                                      )}>
                                        {term.relevanceScore}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </>
                  ) : (
                    <div className={cn(
                      'p-6 text-center rounded-lg',
                      isDark ? 'bg-gray-900' : 'bg-gray-50'
                    )}>
                      <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm opacity-70">
                        Nenhum termo {isDeCS ? 'DeCS' : 'MeSH'} encontrado para este elemento
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Loading Animation Overlay */}
      <LoadingAnimation isLoading={meshLoading} type="mesh" />
      <LoadingAnimation isLoading={decsLoading} type="decs" />

      {/* Seção de busca principal com design melhorado */}
      <Card className={cn(
        'overflow-hidden transition-all',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
      )}>
        <div className={cn(
          'px-6 py-5',
          isDark
            ? 'bg-gradient-to-r from-gray-900 to-gray-800'
            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500'
        )}>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Search className="w-6 h-6" />
            </div>
            Buscar Descritores Controlados
          </h3>
          <p className="text-white/90 mt-2">
            Encontre sugestões de termos MeSH e DeCS para sua estratégia de busca
          </p>
        </div>

        <CardContent className="p-8">
          {/* Navegação entre visualizações */}
          {(meshResults || decsResults || decsError) && !hideSearchButtons && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setActiveView('selection')}
                className={cn(
                  'px-6 py-3 rounded-xl transition-all font-medium',
                  activeView === 'selection'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                ← Voltar à Seleção
              </button>
              {meshResults && (
                <button
                  onClick={() => setActiveView('mesh')}
                  className={cn(
                    'px-6 py-3 rounded-xl transition-all font-medium',
                    activeView === 'mesh'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Resultados MeSH
                </button>
              )}
              {(decsResults || decsError) && (
                <button
                  onClick={() => setActiveView('decs')}
                  className={cn(
                    'px-6 py-3 rounded-xl transition-all font-medium',
                    activeView === 'decs'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  <Languages className="w-4 h-4 inline mr-2" />
                  {decsError ? 'Erro DeCS' : 'Resultados DeCS'}
                </button>
              )}
            </div>
          )}

          {/* Área de seleção de busca com novo design */}
          {activeView === 'selection' && !hideSearchButtons && (
            <div className="flex flex-col md:flex-row justify-center gap-6">
              {/* Card MeSH */}
              <button
                onClick={searchMeSH}
                disabled={meshLoading}
                className={cn(
                  'group relative overflow-hidden rounded-2xl transition-all duration-300',
                  'hover:shadow-2xl transform hover:scale-105',
                  'min-w-[300px] p-8',
                  meshLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Background gradient animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
                
                <div className="relative z-10 text-white">
                  {/* Ícone */}
                  <div className="mb-4 inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Globe className="w-12 h-12" />
                  </div>
                  
                  {/* Título e descrição */}
                  <h4 className="font-bold text-2xl mb-2">
                    {meshResults ? 'Buscar Novamente' : 'Buscar'} MeSH
                  </h4>
                  <p className="text-white/90 mb-4">
                    Medical Subject Headings
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>30.000+ descritores</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Padrão internacional</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>PubMed/MEDLINE</span>
                    </div>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 flex items-center justify-center gap-2 font-medium">
                    <span>Iniciar busca</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Card DeCS */}
              <button
                onClick={searchDeCS}
                disabled={decsLoading}
                className={cn(
                  'group relative overflow-hidden rounded-2xl transition-all duration-300',
                  'hover:shadow-2xl transform hover:scale-105',
                  'min-w-[300px] p-8',
                  decsLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Background gradient animado */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
                
                <div className="relative z-10 text-white">
                  {/* Ícone */}
                  <div className="mb-4 inline-flex p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Languages className="w-12 h-12" />
                  </div>
                  
                  {/* Título e descrição */}
                  <h4 className="font-bold text-2xl mb-2">
                    {decsResults ? 'Buscar Novamente' : 'Buscar'} DeCS
                  </h4>
                  <p className="text-white/90 mb-4">
                    Descritores em Ciências da Saúde
                  </p>
                  
                  {/* Bandeiras dos idiomas */}
                  <div className="flex justify-center gap-2 mb-4">
                    <Image src="/flags/br.svg" alt="Português" width={24} height={18} />
                    <Image src="/flags/es.svg" alt="Español" width={24} height={18} />
                    <Image src="/flags/us.svg" alt="English" width={24} height={18} />
                    <Image src="/flags/fr.svg" alt="Français" width={24} height={18} />
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Multilíngue (4 idiomas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>BIREME/OPAS/OMS</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>BVS/LILACS</span>
                    </div>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 flex items-center justify-center gap-2 font-medium">
                    <span>Iniciar busca</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Mensagem de erro para MeSH */}
          {error && error.type === 'mesh' && (
            <div className={cn(
              "mt-6 p-4 rounded-lg",
              "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            )}>
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-blue-900 dark:text-blue-100">
                    Erro na busca MeSH
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {error.message}
                  </p>
                  <button
                    onClick={searchMeSH}
                    className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados MeSH */}
      {activeView === 'mesh' && meshResults && (
        <div className="space-y-6 animate-fadeIn">
          <Card className={cn('overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6" />
                Medical Subject Headings (MeSH)
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Vocabulário controlado da National Library of Medicine
              </p>
            </div>
            <CardContent className="p-6">{renderResults(meshResults, false)}</CardContent>
          </Card>
        </div>
      )}

      {/* Resultados DeCS ou Erro DeCS */}
      {activeView === 'decs' && (
        <>
          {decsError ? (
            <DecsErrorMessage isDark={isDark} onRetry={searchDeCS} />
          ) : (
            decsResults && (
              <div className="space-y-6 animate-fadeIn">
                <Card className={cn('overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
                  <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Languages className="w-6 h-6" />
                      Descritores em Ciências da Saúde (DeCS)
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm opacity-90">
                        Vocabulário estruturado e multilíngue criado pela BIREME
                      </p>
                      <div className="flex gap-1 ml-auto">
                        <Image src="/flags/br.svg" alt="Português" width={20} height={15} />
                        <Image src="/flags/es.svg" alt="Español" width={20} height={15} />
                        <Image src="/flags/us.svg" alt="English" width={20} height={15} />
                        <Image src="/flags/fr.svg" alt="Français" width={20} height={15} />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">{renderResults(decsResults, true)}</CardContent>
                </Card>
              </div>
            )
          )}
        </>
      )}

      {/* Estilos CSS para animações */}
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
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }

        .term-highlight {
          position: relative;
        }

        .relevance-badge {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .copy-button:active {
          transform: scale(0.95);
        }

        .mesh-result-card .element-display-item {
          background-color: transparent;
          padding: 0;
          width: 100%;
        }

        .mesh-result-card .element-display-item:hover {
          transform: none;
          box-shadow: none;
        }

        .acronym-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

// Definição dos PropTypes
MeshDecsSearch.propTypes = {
  researchData: PropTypes.shape({
    format: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    elements: PropTypes.shape({
      explicit: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  isDark: PropTypes.bool.isRequired,
  conversations: PropTypes.array,
  finalResult: PropTypes.object,
  preloadedResults: PropTypes.object,
  hideSearchButtons: PropTypes.bool
};

export default MeshDecsSearch;