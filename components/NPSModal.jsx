import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Star, X, Send } from 'lucide-react';
import { cn } from '../lib/utils';

const NPSQuestion = ({ question, value, onChange }) => {
  return (
    <div className="space-y-3">
      <p className="font-medium text-foreground">{question}</p>
      <div className="flex flex-wrap gap-2">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              'w-10 h-10 rounded-lg transition-all',
              value === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            )}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
};

NPSQuestion.propTypes = {
  question: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

const NPSModal = ({ isOpen, onClose, isDark }) => {
  const [scores, setScores] = useState({
    experience: null,
    usability: null,
    recommendation: null,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const hasSubmitted = sessionStorage.getItem('nps_submitted');
      if (hasSubmitted) {
        setHasSubmittedBefore(true);
        setShowThankYou(true);
      }
    }
  }, [isOpen]);

  const isFormValid =
    scores.experience !== null && scores.usability !== null && scores.recommendation !== null;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores,
          comment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      // Mark as submitted in sessionStorage
      sessionStorage.setItem('nps_submitted', 'true');
      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting NPS:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  if (showThankYou) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className={cn(
            'rounded-lg p-6 w-full max-w-md mx-auto shadow-xl transform transition-all',
            'bg-card text-card-foreground'
          )}
        >
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
                : 'Sua avaliação é muito importante para nós. Com ela, podemos continuar melhorando a plataforma para melhor atender suas necessidades.'}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={cn(
          'rounded-lg p-6 w-full max-w-2xl mx-auto shadow-xl transform transition-all',
          'bg-card text-card-foreground'
        )}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold">Avalie sua Experiência ⭐</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <NPSQuestion
              question="🎯 Em uma escala de 0 a 10, como você avalia sua experiência geral com o assistente?"
              value={scores.experience}
              onChange={(value) => setScores((prev) => ({ ...prev, experience: value }))}
            />

            <NPSQuestion
              question="💡 O quão fácil foi utilizar a ferramenta para estruturar sua pergunta de pesquisa?"
              value={scores.usability}
              onChange={(value) => setScores((prev) => ({ ...prev, usability: value }))}
            />

            <NPSQuestion
              question="📢 Qual a probabilidade de você recomendar este assistente para outros pesquisadores?"
              value={scores.recommendation}
              onChange={(value) => setScores((prev) => ({ ...prev, recommendation: value }))}
            />

            <div className="space-y-2">
              <label className="font-medium text-foreground">
                💭 Deixe seu comentário ou sugestão (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-none"
                placeholder="Sua opinião é muito importante para nós..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
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

NPSModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default NPSModal;
