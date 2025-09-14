import PropTypes from 'prop-types';
import { Play, Info, Brain, CheckCircle2, Target, Globe, Languages, Sparkles, Search } from 'lucide-react';

const WelcomeModal = ({ isOpen, onStart, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-xl p-6 w-full max-w-3xl mx-auto shadow-xl relative my-8`}
        >
          {/* Header Icon */}
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 hidden md:block">
            <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-full p-4 shadow-lg`}>
              <Brain className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Mobile Header */}
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Brain className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Bem-vindo ao Assistente de Pesquisa em Saúde! 🏥
              </h2>
            </div>

            {/* Desktop Header */}
            <div className="text-center hidden md:block">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Bem-vindo ao Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde do
                HC-UFU/Ebserh! 🏥
              </h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Desenvolvido em parceria entre a <strong>Biblioteca</strong> e a{' '}
                <strong>UGITS</strong>, estamos aqui para ajudar você a transformar suas ideias em
                perguntas de pesquisa claras e eficazes.
              </p>
            </div>

            {/* Introduction Card */}
            <div
              className={`rounded-lg border p-6 ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <Info className={`w-5 h-5 mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Como podemos ajudar você 🤔</h3>
                  <p className="text-sm">
                    Se você está planejando uma pesquisa e precisa de ajuda para definir e estruturar
                    sua pergunta, você está no lugar certo! Nossa plataforma foi desenvolvida para
                    auxiliar pesquisadores como você a:
                  </p>
                  <ul className="space-y-2 text-sm list-none">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <strong>Estruturar suas perguntas de pesquisa</strong> de forma clara, utilizando formatos
                      reconhecidos internacionalmente (PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER, PIRD, CoCoPop, SPICE, ECLIPSE, BeHEMoTh)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <strong>Interagir com IA especializada</strong> que faz perguntas personalizadas para refletir sobre o escopo da
                      sua pesquisa e desenvolver uma pergunta final adequada
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong>Busca Inteligente com IA</strong>
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            NOVO
                          </span>
                        </div>
                        <p className="mt-1">
                          Digite sua ideia em português e receba instantaneamente descritores científicos internacionais
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Buscar descritores controlados</strong> em bases internacionais:
                        <div className="mt-2 space-y-2 ml-2">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">MeSH</span> (Medical Subject Headings) 
                            <span className="text-xs">🇺🇸</span>
                            <span className="text-xs opacity-75">- 30.000+ descritores médicos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-green-500" />
                            <span className="font-medium">DeCS</span> (Descritores em Ciências da Saúde)
                            <div className="flex items-center gap-1 ml-1">
                              <span className="text-xs" title="Português">🇧🇷</span>
                              <span className="text-xs" title="Español">🇪🇸</span>
                              <span className="text-xs" title="English">🇺🇸</span>
                              <span className="text-xs" title="Français">🇫🇷</span>
                            </div>
                            <span className="text-xs opacity-75">- Multilíngue</span>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <strong>Conectar-se com a equipe da biblioteca</strong> para esclarecer dúvidas e obter apoio
                      especializado para conduzir sua pesquisa
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Process Card */}
            <div
              className={`rounded-lg border p-6 ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <Target className={`w-5 h-5 mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Como vamos trabalhar juntos 🛠️</h3>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Processo de Estruturação da Pergunta de Pesquisa:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Compartilhe conosco sua ideia inicial de pesquisa 💭</li>
                      <li>
                        Nossa IA irá guiá-lo através de perguntas para compreender melhor suas necessidades
                        🤖
                      </li>
                      <li>Juntos, refinaremos sua pergunta de pesquisa passo a passo ✨</li>
                      <li>Você receberá uma versão estruturada e bem definida da sua pergunta 🎯</li>
                      <li>
                        Automaticamente, buscaremos descritores <strong>MeSH</strong> e <strong>DeCS</strong> relacionados à sua pergunta estruturada 📖
                      </li>
                      <li>
                        Se desejar, podemos conectar você com a equipe da biblioteca para suporte
                        extra 📚
                      </li>
                    </ol>
                    
                    <div className={`text-sm p-3 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-blue-50'}`}>
                      <p className="font-medium flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Funcionalidade Adicional - Busca Inteligente:
                      </p>
                      <p className="text-xs">
                        Precisa de descritores rapidamente? Use nossa <strong>Busca Inteligente com IA</strong> para 
                        encontrar termos MeSH e DeCS instantaneamente, digitando suas ideias em português comum!
                      </p>
                    </div>
                    
                    <div
                      className={`text-sm p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-green-100'}`}
                    >
                      <p className="font-medium">✨ Estamos aqui para você:</p>
                      <p>
                        Nosso objetivo é ajudá-lo a estruturar seus pensamentos e avançar com
                        confiança em sua pesquisa. Conte conosco para tornar esse processo mais
                        simples e eficiente!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Highlight */}
            <div
              className={`rounded-lg border p-4 ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'
              }`}
            >
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-sm">🌐 Recursos Disponíveis</h4>
                <div className="flex justify-center items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <Brain className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium">IA Assistente</p>
                      <p className="text-xs opacity-75">12 frameworks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium">MeSH</p>
                      <p className="text-xs opacity-75">30.000+ termos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                      <Languages className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium">DeCS</p>
                      <div className="flex gap-1">
                        <span className="text-xs" title="Português">🇧🇷</span>
                        <span className="text-xs" title="Español">🇪🇸</span>
                        <span className="text-xs" title="English">🇺🇸</span>
                        <span className="text-xs" title="Français">🇫🇷</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center space-y-4">
              <button
                onClick={onStart}
                className={`
                  px-6 py-3 rounded-lg transition-all
                  inline-flex items-center justify-center gap-2
                  transform hover:scale-105 text-white font-medium
                  ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                `}
              >
                <Play className="w-5 h-5" />
                Vamos Começar?
              </button>

              {/* Credits */}
              <div className="mt-4 pt-4 border-t border-gray-600 text-center">
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>
                    <span className="font-bold">Biblioteca & UGITS do HC-UFU/Ebserh</span> 📚🔬 —
                    Hospital de Clínicas da UFU
                  </p>
                  <p className="my-1">
                    📍 Av. Pará, 1720 - Umuarama, Uberlândia - MG • Sala 15 (Alojamento de
                    Plantonistas)
                  </p>
                  <p>⏰ Seg-Sex 7h-19h • 📱 (34) 3218-2451 • 📧 seb.hc-ufu@ebserh.gov.br</p>
                  <p className="mt-2 opacity-75">
                    © 2024 HC-UFU/Ebserh. Todos os direitos reservados.
                  </p>
                </div>
              </div>
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