import PropTypes from 'prop-types';
import { Play, Info, Brain, CheckCircle2, Target } from 'lucide-react';

const WelcomeModal = ({ isOpen, onStart, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        rounded-xl p-6 w-full max-w-3xl mx-auto shadow-xl relative my-4 md:my-6`}
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
                    Estruturar suas perguntas de pesquisa de forma clara, utilizando formatos
                    reconhecidos (PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER, PIRD, CoCoPop, SPICE, ECLIPSE, BeHEMoTh)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Interagir com perguntas personalizadas que ajudam a refletir sobre o escopo da
                    sua pesquisa, permitindo que você desenvolva uma pergunta final mais adequada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Conectar-se com a equipe da biblioteca para esclarecer dúvidas e obter o apoio
                    necessário para conduzir sua pesquisa
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
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Compartilhe conosco sua ideia inicial de pesquisa 💭</li>
                    <li>
                      Vamos guiá-lo através de perguntas para compreender melhor suas necessidades
                      🤖
                    </li>
                    <li>Juntos, refinaremos sua pergunta de pesquisa passo a passo ✨</li>
                    <li>Você receberá uma versão estruturada e bem definida da sua pergunta 🎯</li>
                    <li>
                      Se desejar, podemos conectar você com a equipe da biblioteca para suporte
                      extra 📚
                    </li>
                  </ol>
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
  );
};

WelcomeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default WelcomeModal;