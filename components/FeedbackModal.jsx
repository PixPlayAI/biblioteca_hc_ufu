// src/components/FeedbackModal.jsx
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, onReset, errorMessage, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-lg p-4 md:p-6 w-full max-w-md mx-auto shadow-xl
          transform transition-all scale-95 md:scale-100
          overflow-y-auto max-h-[90vh]
        `}
      >
        <div className="text-center space-y-4">
          {/* Ícone e Título */}
          <div className="flex flex-col items-center">
            <XCircle size={32} className="text-yellow-500 mb-2" />
            <div className="text-xl md:text-2xl font-bold text-yellow-500">
              😔 Resposta Insuficiente
            </div>
          </div>

          {/* Mensagem Personalizada */}
          <div className="text-sm md:text-base px-2 md:px-4 text-left space-y-2">
            <p className="mb-4">{errorMessage}</p>
          </div>

          {/* Botões */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <button
              onClick={onReset}
              className={`
                w-full md:w-auto px-6 py-3 rounded-lg
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                ${
                  isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }
              `}
            >
              Iniciar Novo Processo
            </button>
            <button
              onClick={onClose}
              className={`
                w-full md:w-auto px-6 py-3 rounded-lg
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              Corrigir Resposta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default FeedbackModal;
