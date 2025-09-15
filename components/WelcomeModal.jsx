import PropTypes from 'prop-types';
import { Play, Brain, CheckCircle2, Globe, Languages, Sparkles, Search, BookOpen, Users, ArrowRight } from 'lucide-react';

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
              Um assistente digital pioneiro que revoluciona a pesquisa em saúde. Desenvolvido pela 
              parceria entre <strong>Biblioteca e UGITS do HC-UFU</strong>, utiliza inteligência artificial 
              para <strong>estruturar perguntas de pesquisa</strong> em minutos (processo que tradicionalmente 
              leva semanas) e <strong>encontrar descritores científicos</strong> nas principais bases 
              médicas mundiais.
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
                  <span>Transformar ideias vagas em perguntas de pesquisa metodologicamente robustas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Encontrar os descritores corretos para não perder 70% dos artigos relevantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Aprender na prática os 13 frameworks internacionais de pesquisa</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Economizar tempo e garantir qualidade metodológica desde o início</span>
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
                      Estruturação Inteligente de Perguntas com IA
                    </h3>
                    <p className="text-xs opacity-80">
                      Diálogo natural que identifica automaticamente o framework adequado entre 13 opções 
                      (PICO, PICOT, PICOS, PEO, PECO, PCC, SPIDER, PIRD, CoCoPop, SPICE, ECLIPSE, BeHEMoTh) 
                      e guia você até completar todos os elementos metodológicos.
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
                      Digite "pressão alta em idoso" e receba "Hypertension[MeSH]" e "Aged[MeSH]". 
                      A IA traduz seu português comum para termos científicos e busca nas bases oficiais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Funcionalidade 3 - SIMPLIFICADA */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      Acesso a 66.000+ Descritores Científicos
                    </h3>
                    <p className="text-xs opacity-80">
                      Integração direta com as bases MeSH (30.000+ termos médicos em inglês) e 
                      DeCS (36.000 termos em português, espanhol, inglês e francês), garantindo 
                      que você encontre todos os artigos relevantes.
                    </p>
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
                <p>Você compartilha sua ideia de pesquisa em português</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p>A IA faz perguntas contextualizadas para entender seu objetivo</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p>Sua pergunta é estruturada em um dos 13 frameworks científicos</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <p>
                  Descritores MeSH 🇺🇸 e DeCS 🇧🇷🇪🇸🇺🇸🇫🇷 são sugeridos automaticamente
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <p>Você recebe tudo pronto para realizar buscas bibliográficas eficazes!</p>
              </div>
            </div>
          </div>

          {/* Impacto da Plataforma */}
          <div className={`rounded-lg p-4 mb-6 text-center ${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
            <p className="text-sm font-medium">
              🚀 <strong>Transformação comprovada:</strong> De semanas para minutos
            </p>
            <p className="text-xs opacity-80 mt-1">
              100% de adequação metodológica • 300% mais precisão nas buscas • Disponível 24/7
            </p>
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
              Processo guiado de 5-10 minutos • Sem necessidade de conhecimento prévio
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