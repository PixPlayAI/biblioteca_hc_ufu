import PropTypes from 'prop-types';
import { Play, Brain, CheckCircle2, Globe, Languages, Sparkles, Search, BookOpen, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const WelcomeModal = ({ isOpen, onStart, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-xl p-6 w-full max-w-3xl mx-auto shadow-xl relative my-8`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Assistente Digital de Pesquisa em Saúde
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              HC-UFU/Ebserh - Biblioteca & UGITS
            </p>
          </div>

          {/* O que é? */}
          <div className={`rounded-lg p-5 mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              O que é esta plataforma?
            </h2>
            <p className="text-sm leading-relaxed">
              Um assistente digital inteligente que ajuda pesquisadores da área da saúde a 
              <strong> estruturar perguntas de pesquisa científica</strong> usando frameworks 
              reconhecidos internacionalmente e a <strong>encontrar descritores controlados</strong> nas 
              principais bases de dados médicas do mundo.
            </p>
          </div>

          {/* Para que serve? */}
          <div className={`rounded-lg p-5 mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Para quem é indicado?
            </h2>
            <div className="space-y-2 text-sm">
              <p>Ideal para pesquisadores, estudantes e profissionais de saúde que precisam:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Transformar uma ideia de pesquisa em uma pergunta bem estruturada</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Encontrar os termos corretos para buscar em bases de dados científicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Melhorar a qualidade e precisão de suas buscas bibliográficas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Principais Funcionalidades */}
          <div className={`rounded-lg p-5 mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Principais Funcionalidades
            </h2>
            
            <div className="space-y-3">
              {/* Funcionalidade 1 */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      Estruturação Inteligente de Perguntas
                    </h3>
                    <p className="text-xs opacity-80">
                      IA guia você através de perguntas personalizadas para criar uma pergunta de pesquisa 
                      usando frameworks como PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER e outros.
                    </p>
                  </div>
                </div>
              </div>

              {/* Funcionalidade 2 */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-purple-500 rounded-lg">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      Busca Inteligente com IA
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        NOVO
                      </span>
                    </h3>
                    <p className="text-xs opacity-80">
                      Digite sua ideia em português comum e receba instantaneamente descritores 
                      científicos traduzidos e validados em múltiplos idiomas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Funcionalidade 3 - COM IMAGENS DE BANDEIRAS */}
              
{/* Funcionalidade 3 - COM IMAGENS DE BANDEIRAS */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      Descritores MeSH e DeCS com Pré-processamento Inteligente
                    </h3>
                    <p className="text-xs opacity-80 mb-2">
                      Nossa IA pré-processa sua ideia antes de buscar, aumentando significativamente 
                      a precisão na identificação dos descritores mais relevantes para sua pesquisa.
                    </p>
                    <div className="space-y-2 text-xs">
                      {/* MeSH */}
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-blue-600 dark:text-blue-400">MeSH</span>
                          <Image src="/flags/us.svg" alt="English" width={16} height={12} className="inline-block" />
                          <span className="text-xs opacity-75">Medical Subject Headings</span>
                        </div>
                        <p className="opacity-80 text-xs">
                          Vocabulário padrão mundial da National Library of Medicine com 30.000+ termos 
                          hierarquizados. Essencial para PubMed e bases internacionais.
                        </p>
                      </div>
                      {/* DeCS */}
                      <div className={`p-2 rounded ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-green-600 dark:text-green-400">DeCS</span>
                          <div className="flex gap-1">
                            <Image src="/flags/br.svg" alt="Português" width={16} height={12} className="inline-block" />
                            <Image src="/flags/es.svg" alt="Español" width={16} height={12} className="inline-block" />
                            <Image src="/flags/us.svg" alt="English" width={16} height={12} className="inline-block" />
                            <Image src="/flags/fr.svg" alt="Français" width={16} height={12} className="inline-block" />
                          </div>
                          <span className="text-xs opacity-75">Descritores em Ciências da Saúde</span>
                        </div>
                        <p className="opacity-80 text-xs">
                          Vocabulário da BIREME/OPAS com 36.000+ termos em 4 idiomas. 
                          Fundamental para LILACS e bases latino-americanas.
                        </p>
                      </div>
                      {/* Benefício */}
                      <div className={`p-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-blue-200 bg-blue-50/50'}`}>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          💡 Por que isso importa?
                        </p>
                        <p className="text-xs opacity-80 mt-1">
                          Sem os descritores corretos, você pode perder até 70% dos artigos relevantes. 
                          Nossa IA garante que você encontre os termos técnicos precisos que as bases de dados científicas exigem.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



            </div>
          </div>

          {/* Como funciona */}
          <div className={`rounded-lg p-5 mb-6 ${isDark ? 'bg-gray-700/50' : 'bg-orange-50'}`}>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Como funciona?
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p className="flex items-center gap-1">
                  Você compartilha sua ideia de pesquisa em português 
                  <Image src="/flags/br.svg" alt="Brasil" width={16} height={12} className="inline-block" />
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p>A IA faz perguntas para entender melhor seu objetivo</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p>Sua pergunta é estruturada em um formato científico</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <p className="flex items-center gap-1 flex-wrap">
                  Descritores MeSH 
                  <Image src="/flags/us.svg" alt="English" width={16} height={12} className="inline-block" />
                  e DeCS 
                  <Image src="/flags/br.svg" alt="Português" width={16} height={12} className="inline-block" />
                  <Image src="/flags/es.svg" alt="Español" width={16} height={12} className="inline-block" />
                  <Image src="/flags/us.svg" alt="English" width={16} height={12} className="inline-block" />
                  <Image src="/flags/fr.svg" alt="Français" width={16} height={12} className="inline-block" />
                  são sugeridos automaticamente
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <p>Você recebe tudo pronto para sua busca bibliográfica!</p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="text-center">
            <button
              onClick={onStart}
              className={`
                px-8 py-3 rounded-lg transition-all
                inline-flex items-center justify-center gap-2
                transform hover:scale-105 text-white font-medium
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                shadow-lg
              `}
            >
              <Play className="w-5 h-5" />
              Começar Agora
            </button>
            
            <p className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tempo médio: 5-10 minutos para estruturar sua pergunta
            </p>
          </div>

          {/* Footer */}
          <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="font-semibold mb-1">
                Biblioteca & UGITS - HC-UFU/Ebserh
              </p>
              <p className="opacity-75">
                📍 Av. Pará, 1720 - Sala 15 | 📱 (34) 3218-2451 | 📧 seb.hc-ufu@ebserh.gov.br
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WelcomeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default WelcomeModal;