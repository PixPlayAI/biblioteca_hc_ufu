// src/components/FeedbackModal.jsx
import PropTypes from 'prop-types';
import { XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const FeedbackModal = ({ isOpen, onClose, onReset, errorMessage, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={cn(
          `
          rounded-lg p-4 md:p-6 w-full max-w-md mx-auto shadow-xl
          transform transition-all scale-95 md:scale-100
          overflow-y-auto max-h-[90vh]
          bg-card text-card-foreground
          `
        )}
      >
        <div className="text-center space-y-4">
          {/* Ícone e Título */}
          <div className="flex flex-col items-center">
            <XCircle size={32} className="text-destructive mb-2" />
            <div className="text-xl md:text-2xl font-bold text-destructive">
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
              className={cn(
                `
                w-full md:w-auto px-6 py-3 rounded-lg
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                `,
                isDark
                  ? 'bg-[var(--destructive)] text-[var(--destructive-foreground)]'
                  : 'bg-[var(--destructive)] text-[var(--destructive-foreground)]'
              )}
            >
              Iniciar Novo Processo
            </button>
            <button
              onClick={onClose}
              className={cn(
                `
                w-full md:w-auto px-6 py-3 rounded-lg
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                `,
                isDark
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              )}
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
