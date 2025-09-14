import PropTypes from 'prop-types';
import { Play, Info, Brain, CheckCircle2, Target, Globe, Languages, Sparkles, Zap, Search } from 'lucide-react';

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

            {/* NEW FEATURE HIGHLIGHT - Busca Inteligente com IA */}
            <div
              className={`rounded-lg border-2 p-4 md:p-6 relative overflow-hidden ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-600' 
                  : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300'
              }`}
            >
              {/* Badge "NOVO" */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse">
                  NOVO
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-800/50' : 'bg-gradient-to-r from-purple-100 to-blue-100'}`}>
                  <Sparkles className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Busca Inteligente com IA
                    </span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </h3>
                  <p className="text-sm">
                    <strong>Revolucionário:</strong> Digite sua ideia de pesquisa em português comum e nossa IA transforma instantaneamente em descritores científicos!
                  </p>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/70'}`}>
                    <p className="text-xs font-medium mb-2">Como funciona:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500">1.</span>
                        <span>Você digita: <em>"pressão alta em idoso"</em></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">2.</span>
                        <span>IA processa: Traduz para inglês científico e extrai conceitos</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">3.</span>
                        <span>Você recebe: "Hypertension" [MeSH] + "Aged" [MeSH] + "Hipertensão" [DeCS] + "Idoso" [DeCS]</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      <Search className="w-3 h-3 inline mr-1" />
                      Busca Direta
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      <Brain className="w-3 h-3 inline mr-1" />
                      IA Avançada
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      <Globe className="w-3 h-3 inline mr-1" />
                      MeSH + DeCS
                    </div>
                  </div>
                </div>
              </div>
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
                    sua pergunta, você está no lugar certo! Nossa plataforma oferece:
                  </p>
                  <ul className="space-y-2 text-sm list-none">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong className="text-purple-600 dark:text-purple-400">Busca Inteligente com IA:</strong> Digite suas ideias em português e receba instantaneamente descritores MeSH e DeCS relevantes
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Estruturar suas perguntas de pesquisa de forma clara, utilizando formatos
                      reconhecidos (PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER, PIRD, CoCoPop, SPICE, ECLIPSE, BeHEMoTh)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Interagir com perguntas personalizadas que ajudam a refletir sobre o escopo da
                      sua pesquisa
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span>Buscar descritores controlados automaticamente após estruturar sua pergunta:</span>
                        <div className="mt-2 space-y-2 ml-2">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">MeSH</span> - 30.000+ descritores médicos
                            <span className="text-xs">🇺🇸</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-green-500" />
                            <span className="font-medium">DeCS</span> - Multilíngue
                            <div className="flex items-center gap-1 ml-1">
                              <span className="text-xs" title="Português">🇧🇷</span>
                              <span className="text-xs" title="Español">🇪🇸</span>
                              <span className="text-xs" title="English">🇺🇸</span>
                              <span className="text-xs" title="Français">🇫🇷</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Conectar-se com a equipe da biblioteca para suporte especializado
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
                    <div className="text-sm">
                      <p className="font-medium mb-2">Você tem duas opções:</p>
                      
                      <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                        <p className="font-medium text-purple-600 dark:text-purple-400 mb-1">
                          🚀 Opção 1: Busca Inteligente Rápida
                        </p>
                        <p className="text-xs">
                          Use a <strong>Busca Inteligente com IA</strong> para encontrar descritores instantaneamente digitando em português
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                          📝 Opção 2: Assistente Completo
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                          <li>Compartilhe sua ideia inicial de pesquisa</li>
                          <li>Responda perguntas guiadas pela IA</li>
                          <li>Refine sua pergunta passo a passo</li>
                          <li>Receba uma pergunta estruturada (PICO, etc.)</li>
                          <li>Busque descritores MeSH/DeCS automaticamente</li>
                        </ol>
                      </div>
                    </div>
                    
                    <div
                      className={`text-sm p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-green-100'}`}
                    >
                      <p className="font-medium">✨ Estamos aqui para você:</p>
                      <p>
                        Nosso objetivo é tornar sua pesquisa bibliográfica mais eficiente e precisa!
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
                <h4 className="font-semibold text-sm">🌐 Recursos de Busca Internacional</h4>
                <div className="flex justify-center items-center gap-4 md:gap-6">
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
                      <p className="text-xs opacity-75">4 idiomas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium">IA</p>
                      <p className="text-xs opacity-75">Tradução automática</p>
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