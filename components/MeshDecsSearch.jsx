// components/MeshDecsSearch.jsx
/**
 * Componente para busca de descritores controlados MeSH e DeCS
 * Permite pesquisar termos em ambas as bases de dados para auxiliar na construção
 * de estratégias de busca em bases de dados biomédicas
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
} from 'lucide-react';
import { cn } from '../lib/utils';
import SearchStringGenerator from './SearchStringGenerator';
import { getElementLabel, getElementColor, getElementSigla } from '../lib/frameworkMappings';
import FloatingActionButtons from './FloatingActionButtons';

const MeshDecsSearch = ({ researchData, isDark, conversations, finalResult }) => {
  // ========== Estados para MeSH ==========
  const [meshResults, setMeshResults] = useState(null);
  const [allMeshTerms, setAllMeshTerms] = useState(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshDebug, setMeshDebug] = useState(null);
  
  // ========== Estados para DeCS ==========
  const [decsResults, setDecsResults] = useState(null);
  const [allDecsTerms, setAllDecsTerms] = useState(null);
  const [decsLoading, setDecsLoading] = useState(false);
  
  // ========== Estados gerais ==========
  const [activeView, setActiveView] = useState('selection'); // 'selection', 'mesh', 'decs'
  const [copiedString, setCopiedString] = useState(null);
  const [collapsedElements, setCollapsedElements] = useState({});
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [uniqueTermsCollapsed, setUniqueTermsCollapsed] = useState(false);

  /**
   * Função para buscar termos MeSH
   * Utiliza a API NCBI E-utilities para pesquisar no vocabulário MeSH
   */
  const searchMeSH = async () => {
    setMeshLoading(true);
    setMeshResults(null);
    setAllMeshTerms(null);
    setMeshDebug(null);
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
      setMeshDebug({
        'ERRO': error.message,
        'STACK': error.stack,
      });
      // Adicionar feedback visual para o usuário
      alert(`Erro ao buscar termos MeSH: ${error.message}`);
    } finally {
      setMeshLoading(false);
    }
  };

  /**
   * Função para buscar termos DeCS
   * Utiliza a API da BIREME para pesquisar no vocabulário DeCS multilíngue
   */
  const searchDeCS = async () => {
    setDecsLoading(true);
    setDecsResults(null);
    setAllDecsTerms(null);
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
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da busca DeCS:', data);

      setDecsResults(data.results);
      setAllDecsTerms(data.allDecsTerms);

    } catch (error) {
      console.error('❌ Erro na busca DeCS:', error);
      // Adicionar feedback visual para o usuário
      alert(`Erro ao buscar termos DeCS: ${error.message}`);
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
   * Gera conteúdo formatado dos termos MeSH para exportação
   * Usado para criar relatórios com os termos de alta relevância
   */
  const generateDatabaseContent = () => {
    if (!allMeshTerms || allMeshTerms.length === 0 || !meshResults) return '';

    const getHighRelevanceTermsByElement = () => {
      const termsByElement = {};

      meshResults.forEach((result) => {
        const highRelevanceTerms = result.terms.filter((term) => term.relevanceScore >= 95);
        if (highRelevanceTerms.length > 0) {
          termsByElement[result.element] = {
            label: getElementLabel(result.element, researchData.format),
            originalText: result.originalText,
            terms: highRelevanceTerms,
          };
        }
      });

      return termsByElement;
    };

    const highRelevanceTermsByElement = getHighRelevanceTermsByElement();

    let content = `Na pesquisa essa foi a pergunta de pesquisa estruturada:\n`;
    content += `${researchData.question}\n\n`;
    content += `Essa pergunta foi classificada no acrônimo: ${researchData.format}\n\n`;

    Object.entries(researchData.elements.explicit).forEach(([key, value]) => {
      const label = getElementLabel(key, researchData.format);

      content += `A ${label} foi: ${value}\n`;

      if (highRelevanceTermsByElement[key]) {
        content += `E os principais termos MeSH e descrição dos termos relacionados a ${label.toLowerCase()}, foram:\n`;

        highRelevanceTermsByElement[key].terms.forEach((term) => {
          content += `${term.term}: ${term.definition || 'Sem descrição disponível no momento.'}\n`;
        });
      } else {
        content += `Para a ${label.toLowerCase()}, não foram encontrados termos MeSH com alta relevância (>= 95%) nesta busca.\n`;
      }

      content += '\n';
    });

    return content.trim();
  };

  /**
   * Renderiza os resultados da busca (MeSH ou DeCS)
   * @param {Array} results - Array com os resultados da busca
   * @param {boolean} isDeCS - Indica se são resultados DeCS (true) ou MeSH (false)
   */
  const renderResults = (results, isDeCS = false) => {
    if (!results) return null;

    return (
      <div className="space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn('p-4 rounded-lg text-center', isDark ? 'bg-gray-800' : 'bg-blue-50')}>
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-sm opacity-70">Elementos {researchData.format}</div>
          </div>
          <div className={cn('p-4 rounded-lg text-center', isDark ? 'bg-gray-800' : 'bg-green-50')}>
            <div className="text-2xl font-bold text-green-600">
              {results.reduce((acc, r) => acc + r.terms.length, 0)}
            </div>
            <div className="text-sm opacity-70">Termos Encontrados</div>
          </div>
          <div
            className={cn('p-4 rounded-lg text-center', isDark ? 'bg-gray-800' : 'bg-purple-50')}
          >
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...results.flatMap((r) => r.terms.map((t) => t.relevanceScore || 0)), 0) ||
                0}
              %
            </div>
            <div className="text-sm opacity-70">Maior Relevância</div>
          </div>
          <div
            className={cn('p-4 rounded-lg text-center', isDark ? 'bg-gray-800' : 'bg-orange-50')}
          >
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
            // Separar termos por relevância
            highRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore >= 95);
            lowRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore < 95);

            // Determinar quais termos mostrar expandidos por padrão
            visibleTerms =
              highRelevanceTerms.length > 0 ? highRelevanceTerms : [elementResult.terms[0]];
            collapsedTerms =
              highRelevanceTerms.length > 0 ? lowRelevanceTerms : elementResult.terms.slice(1);
          }

          const elementKey = `element-${idx}`;
          const isCollapsed = collapsedElements[elementKey] !== false;

          const elementLabel = getElementLabel(elementResult.element, researchData.format);
          const elementSigla =
            getElementSigla(elementResult.element, researchData.format) || elementResult.element;

          return (
            <div key={idx} className="mesh-result-card">
              <div
                className={cn(
                  'rounded-xl overflow-hidden',
                  isDark ? 'bg-gray-800' : 'bg-white',
                  'shadow-sm hover:shadow-lg transition-shadow'
                )}
              >
                {/* Cabeçalho do elemento */}
                <div
                  className={cn(
                    'p-6 border-b',
                    isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="element-display-item flex-1">
                      <span className="acronym-letter">{elementSigla}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{elementLabel}</div>
                        <p className="acronym-description mt-1">
                          {elementResult.originalText ||
                            researchData.elements.explicit[elementResult.element] ||
                            researchData.elements.explicit[elementSigla] ||
                            'Descrição não disponível'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {elementResult.terms.length} termos
                    </span>
                  </div>
                </div>

                {/* Lista de termos */}
                <div className="p-6 space-y-3">
                  {hasTerms ? (
                    <>
                      {/* Termos visíveis (alta relevância ou primeiro termo) */}
                      {visibleTerms.map((term, termIdx) => (
                        <div
                          key={termIdx}
                          className={cn(
                            'term-card p-4 rounded-lg border transition-all',
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
                                    // Para DeCS, mostrar termos em múltiplos idiomas
                                    <div className="space-y-1">
                                      {term.terms && Object.entries(term.terms).map(([lang, termText]) => (
                                        termText && (
                                          <div key={lang} className="flex items-center gap-2">
                                            <span className="text-sm">{getFlagEmoji(lang)}</span>
                                            <span>{termText}</span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  ) : (
                                    // Para MeSH
                                    term.term
                                  )}
                                </h5>
                              </div>

                              {/* Definições */}
                              {isDeCS && term.definitions ? (
                                // Para DeCS, mostrar definições em múltiplos idiomas
                                <div className="space-y-2">
                                  {Object.entries(term.definitions).map(([lang, def]) => (
                                    def && (
                                      <div key={lang} className="text-sm opacity-80">
                                        <span className="font-medium">{getFlagEmoji(lang)} {getLanguageName(lang)}:</span>
                                        <p className="mt-1">{def}</p>
                                      </div>
                                    )
                                  ))}
                                </div>
                              ) : (
                                // Para MeSH
                                term.definition && (
                                  <p className="text-sm opacity-80 leading-relaxed">
                                    {term.definition}
                                  </p>
                                )
                              )}

                              {/* Sinônimos */}
                              {term.synonyms && (
                                isDeCS ? (
                                  // Para DeCS
                                  Object.entries(term.synonyms).some(([_, syns]) => syns && syns.length > 0) && (
                                    <div className="space-y-2">
                                      {Object.entries(term.synonyms).map(([lang, syns]) => (
                                        syns && syns.length > 0 && (
                                          <div key={lang}>
                                            <span className="text-xs font-medium">{getFlagEmoji(lang)} Sinônimos:</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                              {syns.map((syn, synIdx) => (
                                                <span
                                                  key={synIdx}
                                                  className={cn(
                                                    'px-2 py-1 rounded text-xs',
                                                    isDark ? 'bg-gray-800' : 'bg-gray-200'
                                                  )}
                                                >
                                                  {syn}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  )
                                ) : (
                                  // Para MeSH
                                  term.synonyms.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {term.synonyms.map((syn, synIdx) => (
                                        <span
                                          key={synIdx}
                                          className={cn(
                                            'px-2 py-1 rounded text-xs',
                                            isDark ? 'bg-gray-800' : 'bg-gray-200'
                                          )}
                                        >
                                          {syn}
                                        </span>
                                      ))}
                                    </div>
                                  )
                                )
                              )}

                              {/* Metadados (IDs e hierarquia) */}
                              <div className="flex items-center gap-4 mt-3 text-xs opacity-60">
                                {isDeCS ? (
                                  // Para DeCS
                                  <>
                                    {term.decsId && (
                                      <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        <strong>DeCS ID: {term.decsId}</strong>
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  // Para MeSH
                                  <>
                                    {term.meshId && (
                                      <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        <strong>MeSH ID: {term.meshId}</strong>
                                      </span>
                                    )}
                                    {term.meshUI && (
                                      <span className="flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        <strong>UI: {term.meshUI}</strong>
                                      </span>
                                    )}
                                  </>
                                )}
                                {term.treeNumbers && term.treeNumbers.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <TreePine className="w-3 h-3" />
                                    <strong>Tree: {term.treeNumbers.join(', ')}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              {/* Badge de relevância */}
                              {term.relevanceScore && (
                                <div
                                  className={cn(
                                    'relevance-badge px-3 py-1.5 rounded-lg font-bold text-sm',
                                    term.relevanceScore >= 90
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                      : term.relevanceScore >= 80
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                  )}
                                >
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

                      {/* Botão para expandir/colapsar termos de menor relevância */}
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
                              ? `Clique para visualizar outros ${collapsedTerms.length} termos relacionados`
                              : `Ocultar ${collapsedTerms.length} termos relacionados`}
                          </button>

                          {/* Termos colapsados (baixa relevância) */}
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
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-yellow-500" />
                                      <h5 className="font-semibold text-lg term-highlight">
                                        {isDeCS ? (
                                          <div className="space-y-1">
                                            {term.terms && Object.entries(term.terms).map(([lang, termText]) => (
                                              termText && (
                                                <div key={lang} className="flex items-center gap-2">
                                                  <span className="text-sm">{getFlagEmoji(lang)}</span>
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

                                    {isDeCS && term.definitions ? (
                                      <div className="space-y-2">
                                        {Object.entries(term.definitions).map(([lang, def]) => (
                                          def && (
                                            <div key={lang} className="text-sm opacity-80">
                                              <span className="font-medium">{getFlagEmoji(lang)} {getLanguageName(lang)}:</span>
                                              <p className="mt-1">{def}</p>
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
                                          {term.meshUI && (
                                            <span className="flex items-center gap-1">
                                              <Tag className="w-3 h-3" />
                                              <strong>UI: {term.meshUI}</strong>
                                            </span>
                                          )}
                                        </>
                                      )}
                                      {term.treeNumbers && term.treeNumbers.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <TreePine className="w-3 h-3" />
                                          <strong>Tree: {term.treeNumbers.join(', ')}</strong>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    {term.relevanceScore && (
                                      <div
                                        className={cn(
                                          'relevance-badge px-3 py-1.5 rounded-lg font-bold text-sm',
                                          term.relevanceScore >= 90
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                            : term.relevanceScore >= 80
                                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                        )}
                                      >
                                        {term.relevanceScore}%
                                      </div>
                                    )}

                                    <button
                                      onClick={() => {
                                        const textToCopy = isDeCS && term.terms ? 
                                          Object.values(term.terms).filter(t => t).join(' | ') : 
                                          term.term;
                                        copyToClipboard(textToCopy, `element-${idx}-collapsed-term-${termIdx}`);
                                      }}
                                      className={cn(
                                        'p-1.5 rounded transition-all copy-button',
                                        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                      )}
                                      title="Copiar termo"
                                    >
                                      {copiedString ===
                                      `element-${idx}-collapsed-term-${termIdx}` ? (
                                        <CheckCheck className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4 opacity-50" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </>
                  ) : (
                    // Mensagem quando não há termos encontrados
                    <div
                      className={cn(
                        'p-6 text-center rounded-lg',
                        isDark ? 'bg-gray-900' : 'bg-gray-50'
                      )}
                    >
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

  /**
   * Renderiza o resumo final com todos os termos únicos encontrados
   * @param {boolean} isDeCS - Indica se são resultados DeCS ou MeSH
   */
  const renderFinalSummary = (isDeCS = false) => {
    const terms = isDeCS ? allDecsTerms : allMeshTerms;
    const results = isDeCS ? decsResults : meshResults;
    
    if (!terms || terms.length === 0 || !results) return null;

    return (
      <div
        className={cn(
          'mt-8 rounded-xl overflow-hidden',
          isDark ? 'bg-gray-800' : 'bg-white',
          'shadow-lg'
        )}
      >
        {/* Cabeçalho do resumo (clicável para expandir/colapsar) */}
        <div
          className={cn(
            'px-6 py-4 text-white cursor-pointer hover:opacity-90 transition-opacity',
            isDeCS 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          )}
          onClick={() => setSummaryCollapsed(!summaryCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Resumo Final - Termos {isDeCS ? 'DeCS' : 'MeSH'} Identificados
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Todos os descritores controlados encontrados para sua pesquisa
              </p>
            </div>
            {summaryCollapsed ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronUp className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Conteúdo do resumo */}
        {!summaryCollapsed && (
          <div className="p-6 space-y-6">
            <div>
              {/* Lista de termos únicos (colapsável) */}
              <div
                className={cn(
                  'flex items-center justify-between mb-4 cursor-pointer p-3 -m-3 rounded-lg transition-colors',
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                )}
                onClick={() => setUniqueTermsCollapsed(!uniqueTermsCollapsed)}
              >
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Todos os Termos {isDeCS ? 'DeCS' : 'MeSH'} Únicos ({terms.length})
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-70">
                    {uniqueTermsCollapsed
                      ? `Clique para visualizar os ${terms.length} termos únicos`
                      : 'Clique para ocultar'}
                  </span>
                  {uniqueTermsCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Grid de termos únicos */}
              {!uniqueTermsCollapsed && (
                <div className="grid md:grid-cols-2 gap-3">
                  {terms.map((term, idx) => {
                    let score = term.relevanceScore || 0;
                    
                    // Para DeCS, pegar o termo principal (português por padrão)
                    const displayTerm = isDeCS && term.terms ? 
                      term.terms.pt || term.terms.en || Object.values(term.terms)[0] : 
                      term.term;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-lg border flex items-center justify-between gap-3',
                          isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={cn(
                              'px-2 py-1 rounded-md font-bold text-xs',
                              score >= 90
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : score >= 80
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            )}
                          >
                            {score}%
                          </div>
                          <span className="font-medium">{displayTerm}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(displayTerm, `unique-term-${idx}`)}
                          className={cn(
                            'p-1.5 rounded transition-all copy-button',
                            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                          )}
                        >
                          {copiedString === `unique-term-${idx}` ? (
                            <CheckCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 opacity-50" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Seção de busca principal - com os dois botões já visíveis */}
      <Card className={cn('overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white')}>
        <div
          className={cn(
            'px-6 py-4 border-b',
            isDark
              ? 'border-gray-700 bg-gray-750'
              : 'border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50'
          )}
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6" />
            Buscar Descritores Controlados
          </h3>
          <p className="text-sm opacity-70 mt-1">
            Encontre sugestões de termos MeSH e DeCS para sua estratégia de busca
          </p>
        </div>

        <CardContent className="p-8">
          {/* Navegação entre visualizações */}
          {(meshResults || decsResults) && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setActiveView('selection')}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all',
                  activeView === 'selection'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                Voltar à Seleção
              </button>
              {meshResults && (
                <button
                  onClick={() => setActiveView('mesh')}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-all',
                    activeView === 'mesh'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  Ver Resultados MeSH
                </button>
              )}
              {decsResults && (
                <button
                  onClick={() => setActiveView('decs')}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-all',
                    activeView === 'decs'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  Ver Resultados DeCS
                </button>
              )}
            </div>
          )}

          {/* Área de seleção de busca - sempre visível */}
          {activeView === 'selection' && (
            <div className="flex justify-center gap-6">
              {/* Botão MeSH */}
              <button
                onClick={searchMeSH}
                disabled={meshLoading}
                className={cn(
                  'search-button group relative p-6 rounded-xl transition-all',
                  'hover:shadow-xl transform hover:scale-105',
                  'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
                  'min-w-[280px]',
                  meshLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    {meshLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Globe className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {meshLoading ? 'Buscando...' : meshResults ? 'Buscar Novamente no MeSH' : 'Buscar no MeSH'}
                    </h4>
                    <p className="text-sm opacity-90 mt-1">Medical Subject Headings</p>
                  </div>
                </div>
              </button>

              {/* Botão DeCS */}
              <button
                onClick={searchDeCS}
                disabled={decsLoading}
                className={cn(
                  'search-button group relative p-6 rounded-xl transition-all',
                  'hover:shadow-xl transform hover:scale-105',
                  'bg-gradient-to-br from-green-500 to-green-600 text-white',
                  'min-w-[280px]',
                  decsLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    {decsLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Languages className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {decsLoading ? 'Buscando...' : decsResults ? 'Buscar Novamente no DeCS' : 'Buscar no DeCS'}
                    </h4>
                    <p className="text-sm opacity-90 mt-1">Descritores em Ciências da Saúde</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <span title="Português">🇧🇷</span>
                      <span title="Español">🇪🇸</span>
                      <span title="English">🇺🇸</span>
                      <span title="Français">🇫🇷</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados MeSH */}
      {activeView === 'mesh' && meshResults && (
        <div className="space-y-6">
          <div className="section-divider">
            <span
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
            >
              Resultados MeSH
            </span>
          </div>

          <Card
            className={cn('overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white')}
          >
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

          <div className="flex justify-center my-8">
            <FloatingActionButtons
              variant="final"
              isDark={isDark}
              conversations={conversations}
              finalResult={finalResult}
            />
          </div>

          {renderFinalSummary(false)}

          <div className="flex justify-center mt-8">
            <FloatingActionButtons
              variant="final"
              isDark={isDark}
              conversations={conversations}
              finalResult={finalResult}
            />
          </div>
        </div>
      )}

      {/* Resultados DeCS */}
      {activeView === 'decs' && decsResults && (
        <div className="space-y-6">
          <div className="section-divider">
            <span
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
            >
              Resultados DeCS
            </span>
          </div>

          <Card
            className={cn('overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white')}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Languages className="w-6 h-6" />
                Descritores em Ciências da Saúde (DeCS)
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Vocabulário estruturado e trilíngue criado pela BIREME
              </p>
            </div>

            <CardContent className="p-6">{renderResults(decsResults, true)}</CardContent>
          </Card>

          <div className="flex justify-center my-8">
            <FloatingActionButtons
              variant="final"
              isDark={isDark}
              conversations={conversations}
              finalResult={finalResult}
            />
          </div>

          {renderFinalSummary(true)}

          <div className="flex justify-center mt-8">
            <FloatingActionButtons
              variant="final"
              isDark={isDark}
              conversations={conversations}
              finalResult={finalResult}
            />
          </div>
        </div>
      )}

      {/* Estilos CSS para animações e efeitos visuais */}
      <style jsx>{`
        .term-highlight {
          background: linear-gradient(to right, transparent 0%, yellow 50%, transparent 100%);
          background-size: 200% 100%;
          background-position: -100% 0;
          animation: highlight 2s ease-out;
        }

        @keyframes highlight {
          to {
            background-position: 100% 0;
          }
        }

        .relevance-badge {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .search-button:hover {
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1.05);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        .copy-button:active {
          transform: scale(0.95);
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
        }

        .status-indicator.real {
          background-color: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        pre {
          margin: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .section-divider {
          position: relative;
          text-align: center;
          margin: 2rem 0;
        }

        .section-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: currentColor;
          opacity: 0.2;
          z-index: 0;
        }

        .section-divider > span {
          position: relative;
          z-index: 1;
          background: inherit;
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
      `}</style>
    </div>
  );
};

// Definição dos PropTypes para validação de tipos
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
};

export default MeshDecsSearch;