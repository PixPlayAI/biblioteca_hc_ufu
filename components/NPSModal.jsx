//components/NPSModal.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Star, X, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { markNPSAsSubmitted, checkNPSStatus } from '../lib/npsManager';

const getRatingColor = (index, isSelected) => {
  const colors = {
    0: { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    1: { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    2: { bg: 'bg-red-400', hover: 'hover:bg-red-500' },
    3: { bg: 'bg-orange-400', hover: 'hover:bg-orange-500' },
    4: { bg: 'bg-orange-400', hover: 'hover:bg-orange-500' },
    5: { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
    6: { bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
    7: { bg: 'bg-lime-400', hover: 'hover:bg-lime-500' },
    8: { bg: 'bg-lime-500', hover: 'hover:bg-lime-600' },
    9: { bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    10: { bg: 'bg-green-600', hover: 'hover:bg-green-700' },
  };

  return isSelected
    ? colors[index].bg
    : `bg-secondary hover:bg-secondary/80 ${colors[index].hover}`;
};

const NPSQuestion = ({ question, value, onChange }) => {
  return (
    <div className="space-y-3">
      <p className="font-medium text-foreground">{question}</p>
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              'w-10 h-10 rounded-lg transition-all font-medium',
              getRatingColor(i, value === i),
              value === i
                ? 'text-white ring-2 ring-offset-2 ring-offset-background'
                : 'text-foreground',
              'transform hover:scale-105 active:scale-95'
            )}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Não satisfatório</span>
        <span>Muito satisfatório</span>
      </div>
    </div>
  );
};

const NPSModal = ({ isOpen, onClose, isDark, source, onComplete }) => {
  const [scores, setScores] = useState({
    methodologySupport: null,
    clarity: null,
    overall: null,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const hasSubmitted = checkNPSStatus();
      if (hasSubmitted) {
        setHasSubmittedBefore(true);
        setShowThankYou(true);
        if (source?.type === 'forced' && onComplete) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    } else {
      setScores({
        methodologySupport: null,
        clarity: null,
        overall: null,
      });
      setComment('');
      setIsSubmitting(false);
      setShowThankYou(false);
    }
  }, [isOpen, source, onComplete]);

  const isFormValid =
    scores.methodologySupport !== null && scores.clarity !== null && scores.overall !== null;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const requestBody = {
        scores,
        comment,
        source,
        timestamp: new Date().toISOString(),
      };

      console.log('Enviando NPS - Request Body:', requestBody);

      const response = await fetch('/api/send-nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Resposta do servidor NPS:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${responseData.error || 'Unknown error'}`);
      }

      markNPSAsSubmitted();
      setShowThankYou(true);

      if (source?.type === 'forced' && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro completo ao enviar NPS:', {
        message: error.message,
        stack: error.stack,
        error,
      });
      alert('Erro ao enviar avaliação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalMessage = () => {
    if (source?.type === 'forced') {
      return (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Nota Importante:</strong> Para{' '}
            {source.id.includes('email')
              ? 'receber o resultado por email'
              : 'entrar em contato com a biblioteca'}
            , pedimos que primeiro responda estas três breves perguntas sobre sua experiência.
          </p>
        </div>
      );
    }
    return null;
  };

  if (showThankYou) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto shadow-xl transform transition-all my-4 bg-card text-card-foreground">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center">
              <Star className="w-12 h-12 text-yellow-500 mb-2" />
              <h2 className="text-xl font-bold">
                {hasSubmittedBefore ? 'Avaliação Já Realizada! 🌟' : 'Agradecemos seu Feedback! 🎉'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasSubmittedBefore
                ? 'Você já nos enviou sua avaliação anteriormente. Agradecemos muito seu interesse em contribuir!'
                : 'Sua avaliação é muito importante para nós. Com ela, podemos continuar melhorando a plataforma para melhor atender suas necessidades de pesquisa.'}
            </p>
            <button
              onClick={onClose}
              className={cn(
                'w-full px-6 py-3 rounded-lg transition-all transform hover:scale-105 text-base font-medium',
                'bg-primary text-primary-foreground'
              )}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-auto shadow-xl transform transition-all my-4 bg-card text-card-foreground">
        {getModalMessage()}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold">Avalie sua Experiência ⭐</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <NPSQuestion
              question="📋 Como você avalia o suporte do assistente na estruturação da sua pergunta de pesquisa em diferentes formatos metodológicos (PICO, PICOT, etc.)?"
              value={scores.methodologySupport}
              onChange={(value) => setScores((prev) => ({ ...prev, methodologySupport: value }))}
            />

            <NPSQuestion
              question="💡 O quão clara e útil foi a orientação fornecida pelo assistente durante o processo de construção da sua pergunta?"
              value={scores.clarity}
              onChange={(value) => setScores((prev) => ({ ...prev, clarity: value }))}
            />

            <NPSQuestion
              question="🎯 De modo geral, qual é a probabilidade de você recomendar este assistente para outros pesquisadores da área da saúde?"
              value={scores.overall}
              onChange={(value) => setScores((prev) => ({ ...prev, overall: value }))}
            />

            <div className="space-y-2">
              <label className="font-medium text-foreground">
                💭 Deixe seu comentário ou sugestão (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none"
                placeholder="Sua opinião é muito importante para continuarmos melhorando o assistente..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={cn(
                'px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2',
                isFormValid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

NPSQuestion.propTypes = {
  question: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

NPSModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  source: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.oneOf(['spontaneous', 'forced']),
  }),
  onComplete: PropTypes.func,
};

export default NPSModal;
