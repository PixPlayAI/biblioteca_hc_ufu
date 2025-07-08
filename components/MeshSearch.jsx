// components/MeshSearch.jsx
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
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import SearchStringGenerator from './SearchStringGenerator';
import { getElementLabel, getElementColor, getElementSigla } from '../lib/frameworkMappings';

const MeshSearch = ({ researchData, isDark }) => {
  const [meshResults, setMeshResults] = useState(null);
  const [allMeshTerms, setAllMeshTerms] = useState(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshDebug, setMeshDebug] = useState(null);
  const [copiedString, setCopiedString] = useState(null);
  const [collapsedElements, setCollapsedElements] = useState({});
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [uniqueTermsCollapsed, setUniqueTermsCollapsed] = useState(true);

  const searchMeSH = async () => {
    setMeshLoading(true);
    setMeshResults(null);
    setAllMeshTerms(null);
    setMeshDebug(null);

    // Debug detalhado dos dados
    console.log('🚀 MeshSearch - INICIANDO BUSCA MESH');
    console.log('📊 Framework:', researchData.format);
    console.log('❓ Pergunta:', researchData.question);
    console.log('📋 Elementos explícitos completos:', researchData.elements?.explicit);
    console.log('📝 Descrições dos elementos:', researchData.elementDescriptions?.explicit);

    // Log cada elemento individualmente
    if (researchData.elements?.explicit) {
      console.log('🔍 Detalhamento dos elementos:');
      Object.entries(researchData.elements.explicit).forEach(([key, value]) => {
        console.log(`   ${key}: "${value}"`);
      });
    }

    console.log('📦 ResearchData completo:', JSON.stringify(researchData, null, 2));

    try {
      const payload = {
        frameworkElements: researchData.elements.explicit,
        fullQuestion: researchData.question,
        frameworkType: researchData.format,
      };

      console.log('📤 Enviando payload para API:', JSON.stringify(payload, null, 2));

      const response = await axios.post('/api/search-mesh', payload);

      // Debug da resposta
      console.log('📥 Resposta recebida da API:', response.data);
      console.log('✅ Número de resultados:', response.data.results?.length);
      console.log('🎯 Número de termos únicos:', response.data.allMeshTerms?.length);

      // Log dos resultados por elemento
      if (response.data.results) {
        console.log('📊 Resultados por elemento:');
        response.data.results.forEach((result) => {
          console.log(
            `   ${result.element}: "${result.originalText}" (${result.terms.length} termos)`
          );
        });
      }

      setMeshResults(response.data.results);
      setAllMeshTerms(response.data.allMeshTerms);
      setMeshDebug(response.data.debug);

      console.log('✅ MeshSearch - BUSCA CONCLUÍDA COM SUCESSO');
    } catch (error) {
      console.error('❌ Erro na busca MeSH:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      setMeshDebug({
        '❌ ERRO': error.message,
        '📍 DETALHES': error.response?.data,
      });
    } finally {
      setMeshLoading(false);
    }
  };

  // Debug do estado atual
  useEffect(() => {
    if (meshResults && researchData) {
      console.log('MeshSearch - Estado atual:', {
        meshResults,
        researchData,
        elementosExplicit: researchData.elements.explicit,
        primeiroResultado: meshResults[0],
      });
    }
  }, [meshResults, researchData]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedString(id);
    setTimeout(() => setCopiedString(null), 2000);
  };

  // Função para gerar o conteúdo MeSH formatado
  const generateDatabaseContent = () => {
    if (!allMeshTerms || allMeshTerms.length === 0 || !meshResults) return '';

    // Função para obter termos com relevância >= 95% para cada elemento
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

    // Adiciona informações sobre cada elemento do framework
    Object.entries(researchData.elements.explicit).forEach(([key, value]) => {
      const label = getElementLabel(key, researchData.format);

      content += `A ${label} foi: ${value}\n`;

      // Verifica se há termos MeSH com relevância >= 95% para este elemento
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

  // No componente MeshSearch, dentro da função renderResults:
  const renderResults = (results) => {
    if (!results) return null;

    // Debug dos dados disponíveis
    console.log('Dados disponíveis:', {
      results,
      researchData,
      elementosExplicitos: researchData.elements.explicit,
    });

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
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
              {allMeshTerms ? allMeshTerms.length : 0}
            </div>
            <div className="text-sm opacity-70">Termos Únicos</div>
          </div>
        </div>

        {/* Results by Element */}
        {results.map((elementResult, idx) => {
          // CORREÇÃO: Verificar se há termos antes de processar
          const hasTerms = elementResult.terms && elementResult.terms.length > 0;

          let highRelevanceTerms = [];
          let lowRelevanceTerms = [];
          let visibleTerms = [];
          let collapsedTerms = [];

          if (hasTerms) {
            highRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore >= 95);
            lowRelevanceTerms = elementResult.terms.filter((t) => t.relevanceScore < 95);

            // Se todos os termos são < 95%, mostrar o primeiro e colapsar o resto
            visibleTerms =
              highRelevanceTerms.length > 0 ? highRelevanceTerms : [elementResult.terms[0]];
            collapsedTerms =
              highRelevanceTerms.length > 0 ? lowRelevanceTerms : elementResult.terms.slice(1);
          }

          const elementKey = `element-${idx}`;
          const isCollapsed = collapsedElements[elementKey] !== false;

          // Obter o label do elemento baseado no framework
          const elementLabel = getElementLabel(elementResult.element, researchData.format);

          // Obter a sigla correta baseada no framework
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
                {/* Element Header - Com estilo element-display-item */}
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

                {/* Terms */}
                <div className="p-6 space-y-3">
                  {/* CORREÇÃO: Só renderizar se houver termos */}
                  {hasTerms ? (
                    <>
                      {/* Visible Terms */}
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
                                  {term.term}
                                </h5>
                              </div>

                              {term.definition && (
                                <p className="text-sm opacity-80 leading-relaxed">
                                  {term.definition}
                                </p>
                              )}

                              {term.synonyms && term.synonyms.length > 0 && (
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
                              )}

                              <div className="flex items-center gap-4 mt-3 text-xs opacity-60">
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
                                onClick={() =>
                                  copyToClipboard(term.term, `element-${idx}-term-${termIdx}`)
                                }
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

                      {/* Collapsed Terms */}
                      {collapsedTerms.length > 0 && (
                        <>
                          {/* Toggle Button */}
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

                          {/* Collapsed Terms Content */}
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
                                        {term.term}
                                      </h5>
                                    </div>

                                    {term.definition && (
                                      <p className="text-sm opacity-80 leading-relaxed">
                                        {term.definition}
                                      </p>
                                    )}

                                    {term.synonyms && term.synonyms.length > 0 && (
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
                                    )}

                                    <div className="flex items-center gap-4 mt-3 text-xs opacity-60">
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
                                      onClick={() =>
                                        copyToClipboard(
                                          term.term,
                                          `element-${idx}-collapsed-term-${termIdx}`
                                        )
                                      }
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
                    // Mensagem quando não há termos MeSH
                    <div
                      className={cn(
                        'p-6 text-center rounded-lg',
                        isDark ? 'bg-gray-900' : 'bg-gray-50'
                      )}
                    >
                      <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm opacity-70">
                        Nenhum termo MeSH encontrado para este elemento
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

  // Nova função para renderizar o resumo final dos termos MeSH
  const renderFinalSummary = () => {
    if (!allMeshTerms || allMeshTerms.length === 0 || !meshResults) return null;

    const meshContent = generateDatabaseContent();

    return (
      <div
        className={cn(
          'mt-8 rounded-xl overflow-hidden',
          isDark ? 'bg-gray-800' : 'bg-white',
          'shadow-lg'
        )}
      >
        {/* Header - Clicável para expandir/colapsar */}
        <div
          className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setSummaryCollapsed(!summaryCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Resumo Final - Termos MeSH Identificados
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

        {!summaryCollapsed && (
          <div className="p-6 space-y-6">
            {/* Lista consolidada de todos os termos únicos - Colapsável */}
            <div>
              <div
                className={cn(
                  'flex items-center justify-between mb-4 cursor-pointer p-3 -m-3 rounded-lg transition-colors',
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                )}
                onClick={() => setUniqueTermsCollapsed(!uniqueTermsCollapsed)}
              >
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Todos os Termos MeSH Únicos ({allMeshTerms.length})
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-70">
                    {uniqueTermsCollapsed
                      ? `Clique para visualizar os ${allMeshTerms.length} termos únicos`
                      : 'Clique para ocultar'}
                  </span>
                  {uniqueTermsCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </div>
              </div>

              {!uniqueTermsCollapsed && (
                <div className="grid md:grid-cols-2 gap-3">
                  {allMeshTerms.map((term, idx) => {
                    // Busca a pontuação do termo nos resultados
                    let score = 0;
                    meshResults.forEach((result) => {
                      const foundTerm = result.terms.find((t) => t.meshId === term.meshId);
                      if (foundTerm && foundTerm.relevanceScore) {
                        score = foundTerm.relevanceScore;
                      }
                    });

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
                          <span className="font-medium">{term.term}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(term.term, `unique-term-${idx}`)}
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

            {/* Strings de busca por base de dados */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Strings de Busca Personalizadas
              </h4>

              {/* Integração do componente SearchStringGenerator */}
              {meshContent && (
                <SearchStringGenerator
                  meshContent={meshContent}
                  researchData={researchData}
                  isDark={isDark}
                  meshResults={meshResults} // Adicione esta linha
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Search Button Section */}
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
            Buscar Descritores MeSH
          </h3>
          <p className="text-sm opacity-70 mt-1">
            Encontre os melhores termos MeSH para sua estratégia de busca
          </p>
        </div>

        <CardContent className="p-8">
          <div className="flex justify-center">
            {/* MeSH Button */}
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
                    {meshLoading ? 'Buscando...' : 'Buscar no MeSH'}
                  </h4>

                  <p className="text-sm opacity-90 mt-1">Medical Subject Headings</p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* MeSH Results */}
      {(meshResults || meshDebug) && (
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

            <CardContent className="p-6">{renderResults(meshResults)}</CardContent>
          </Card>

          {/* Resumo Final */}
          {renderFinalSummary()}
        </div>
      )}

      <style jsx>{`
        /* CSS adicional para syntax highlighting e animações */
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

        /* Ajuste para element-display-item dentro do MeshSearch */
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

MeshSearch.propTypes = {
  researchData: PropTypes.shape({
    format: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    elements: PropTypes.shape({
      explicit: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default MeshSearch;
