// components/EmailModal.jsx

import PropTypes from 'prop-types';
import { useState } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

const EmailModal = ({ isOpen, onClose, isDark, emailContent, onSendEmail }) => {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleSendEmail = async () => {
    if (!isValidEmail) return;

    setIsSending(true);
    try {
      await onSendEmail(email, emailContent);
      setSentToEmail(email);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsValidEmail(false);
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showConfirmation) {
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
              <Check size={48} className="text-green-500 mb-2" />
              <h2 className="text-xl font-bold">Email Enviado!</h2>
            </div>
            <p className="text-sm">
              Enviamos os resultados para <strong>{sentToEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Por favor, verifique também sua pasta de spam caso não encontre o email em sua caixa
              de entrada.
            </p>
            <button
              onClick={handleClose}
              className={cn(
                'w-full px-6 py-3 rounded-lg transition-all transform hover:scale-105 text-base font-medium',
                isDark
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              )}
            >
              OK, entendi
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
        <div className="space-y-6 text-left">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold"> Enviar resultado via Email</h2>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Prévia do Email */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                📬 <strong>Prévia do Email</strong>
              </h3>
              <div className="bg-muted/20 rounded-lg p-4 max-h-60 overflow-y-auto text-left space-y-2">
                {emailContent.split('\n').map((line, index) => (
                  <p key={index} className="text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Seu endereço de email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border',
                    'bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    isValidEmail ? 'border-green-500' : 'border-input'
                  )}
                  placeholder="seu@email.com"
                />
                {isValidEmail && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-end">
            <button
              onClick={handleSendEmail}
              disabled={!isValidEmail || isSending}
              className={cn(
                'px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2',
                isValidEmail
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Mail className="w-5 h-5" />
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EmailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  emailContent: PropTypes.string.isRequired,
  onSendEmail: PropTypes.func.isRequired,
};

export default EmailModal;
