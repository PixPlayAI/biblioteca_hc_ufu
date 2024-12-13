//components/FloatingActionButtons.jsx
import PropTypes from 'prop-types';
import { MessageCircleQuestion, ThumbsUp, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import EmailModal from './EmailModal';
import NPSModal from './NPSModal';
import { NPS_SOURCES, checkNPSStatus } from '../lib/npsManager';

const FloatingActionButtons = ({
  isDark,
  variant = 'default',
  className = '',
  conversations = [],
  finalResult = null,
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNPSModalOpen, setIsNPSModalOpen] = useState(false);
  const [currentNPSSource, setCurrentNPSSource] = useState(null);

  const formatConversationHistory = () => {
    if (!conversations.length) return '';

    return conversations
      .map(
        (conv, index) => `
🔹 *Pergunta ${index + 1}:* ${conv.question}
${conv.context ? `_Contexto:_ ${conv.context}\n` : ''}*Resposta:* ${conv.answer}
`
      )
      .join('\n');
  };

  const formatFinalResult = () => {
    if (!finalResult) return '';

    return `
📋 *RESULTADO FINAL*
------------------
*Formato:* ${finalResult.format}
*Pergunta Estruturada:* ${finalResult.question}
${finalResult.explanation ? `\n*Explicação:* ${finalResult.explanation}` : ''}
`;
  };

  const isMobile = () => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  };

  const handleWhatsAppClick = (customMessage) => {
    if (checkNPSStatus()) {
      const conversationHistory = formatConversationHistory();
      const formattedResult = formatFinalResult();

      let message = '';

      if (variant === 'final') {
        message = `Oi tudo bem? Utilizei o aplicativo o 🎯 Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde e consegui o seguinte resultado, podem me ajudar?\n\n`;
        message += `*HISTÓRICO DA CONSTRUÇÃO*\n`;
        message += `------------------\n`;
        message += conversationHistory;
        message += `\n${formattedResult}`;
      } else {
        message = `Oi tudo bem? Estou usando o aplicativo da biblioteca, o 🎯 Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde, e estou com dificuldades... Podem me ajudar?\n\n`;
        message += `*HISTÓRICO DA INTERAÇÃO ATÉ O MOMENTO*\n`;
        message += `------------------\n`;
        message += conversationHistory;
      }

      const phoneNumber = '553432182451';
      const encodedMessage = encodeURIComponent(message);
      const baseUrl = isMobile()
        ? 'https://api.whatsapp.com/send'
        : 'https://web.whatsapp.com/send';
      const whatsappUrl = `${baseUrl}?phone=${phoneNumber}&text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      return;
    } else {
      // Caso contrário, mostra o modal do NPS
      const source =
        variant === 'final'
          ? NPS_SOURCES.CHAT_RESULT
          : customMessage
            ? NPS_SOURCES.NEED_HELP
            : NPS_SOURCES.LIBRARY_HELP;
      setCurrentNPSSource(source);
      setIsNPSModalOpen(true);
    }

    // Caso contrário, abra o modal do NPS com a origem apropriada
    const source =
      variant === 'final'
        ? NPS_SOURCES.CHAT_RESULT
        : customMessage
          ? NPS_SOURCES.NEED_HELP
          : NPS_SOURCES.LIBRARY_HELP;

    setCurrentNPSSource(source);
    setIsNPSModalOpen(true);
  };

  const handleEmailClick = () => {
    if (checkNPSStatus()) {
      setIsEmailModalOpen(true);
    } else {
      setCurrentNPSSource(NPS_SOURCES.EMAIL_RESULT);
      setIsNPSModalOpen(true);
    }
  };

  const handleFeedbackClick = () => {
    setCurrentNPSSource(variant === 'inline' ? NPS_SOURCES.LIKE_BUTTON : NPS_SOURCES.APP_FEEDBACK);
    setIsNPSModalOpen(true);
  };

  const handleSendEmail = async (email, content) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, content }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const formatEmailContent = () => {
    let content = '';

    if (variant === 'final' && finalResult) {
      content = `Resultado da Pesquisa - Assistente Digital HC-UFU\n\n`;
      content += `${formatConversationHistory()}\n`;
      content += `${formatFinalResult()}`;
    }

    return content;
  };

  if (variant === 'final') {
    return (
      <>
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          isDark={isDark}
          emailContent={formatEmailContent()}
          onSendEmail={handleSendEmail}
        />
        <div className={`flex flex-col md:flex-row justify-center gap-4 ${className}`}>
          <Card
            className="hover:scale-105 transition-transform duration-200 cursor-pointer w-full md:max-w-xs"
            onClick={handleEmailClick}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Enviar para meu email</h3>
                <p className="text-sm text-muted-foreground">Receba o resultado por email</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:scale-105 transition-transform duration-200 cursor-pointer w-full md:max-w-xs"
            onClick={handleWhatsAppClick}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-[#25D366] p-2 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Conversar sobre o resultado</h3>
                <p className="text-sm text-muted-foreground">Fale com a biblioteca do HC-UFU</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <NPSModal
          isOpen={isNPSModalOpen}
          onClose={() => setIsNPSModalOpen(false)}
          isDark={isDark}
          source={currentNPSSource}
          onComplete={() => {
            setIsNPSModalOpen(false);
            if (currentNPSSource?.type === 'forced') {
              if (currentNPSSource.id === 'email_result') {
                setIsEmailModalOpen(true);
              } else {
                handleWhatsAppClick(true);
              }
            }
          }}
        />
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          isDark={isDark}
          emailContent={formatEmailContent()}
          onSendEmail={handleSendEmail}
        />
        <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
          <button
            onClick={() => handleWhatsAppClick(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:scale-105 transition-transform duration-200 w-full sm:w-auto"
          >
            <MessageCircleQuestion className="w-5 h-5" />
            <span className="text-sm">Precisa de ajuda?</span>
          </button>
          <button
            onClick={handleFeedbackClick}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-transform duration-200 w-full sm:w-auto"
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm">Está gostando?</span>
          </button>
        </div>
        <NPSModal
          isOpen={isNPSModalOpen}
          onClose={() => setIsNPSModalOpen(false)}
          isDark={isDark}
          source={currentNPSSource}
          onComplete={() => {
            setIsNPSModalOpen(false);
            if (currentNPSSource?.type === 'forced') {
              handleWhatsAppClick(true);
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        isDark={isDark}
        emailContent={formatEmailContent()}
        onSendEmail={handleSendEmail}
      />
      <div className={`space-y-4 p-2 sm:p-0 ${className}`}>
        <Card
          className="hover:scale-105 transition-transform duration-200 cursor-pointer"
          onClick={() => handleWhatsAppClick(false)}
        >
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="bg-[#25D366] p-2 rounded-full">
              <MessageCircleQuestion className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Pedir ajuda para a biblioteca</h3>
              <p className="text-sm text-muted-foreground">
                Clique para falar com a biblioteca do HC-UFU via WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:scale-105 transition-transform duration-200 cursor-pointer"
          onClick={handleFeedbackClick}
        >
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full">
              <ThumbsUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">O que está achando do app?</h3>
              <p className="text-sm text-muted-foreground">Compartilhe sua experiência conosco</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <NPSModal
        isOpen={isNPSModalOpen}
        onClose={() => setIsNPSModalOpen(false)}
        isDark={isDark}
        source={currentNPSSource}
        onComplete={() => {
          setIsNPSModalOpen(false);
          if (currentNPSSource?.type === 'forced') {
            handleWhatsAppClick(false);
          }
        }}
      />
    </>
  );
};

FloatingActionButtons.propTypes = {
  isDark: PropTypes.bool.isRequired,
  variant: PropTypes.oneOf(['default', 'inline', 'final']),
  className: PropTypes.string,
  conversations: PropTypes.array,
  finalResult: PropTypes.object,
};

export default FloatingActionButtons;
