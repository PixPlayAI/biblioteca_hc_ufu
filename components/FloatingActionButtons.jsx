//components/FloatingActionButtons.jsx
import PropTypes from 'prop-types';
import { MessageCircleQuestion, ThumbsUp, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const FloatingActionButtons = ({
  isDark,
  variant = 'default',
  className = '',
  conversations = [],
  finalResult = null,
}) => {
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

  const handleWhatsAppClick = (customMessage) => {
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

    const whatsappUrl = `https://web.whatsapp.com/send?phone=553432182451&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleFeedbackClick = () => {
    window.open(
      'https://www.canva.com/design/DAGZHsEGVGw/hHRk3ashIVuplEnP8jNGSw/view?utm_content=DAGZHsEGVGw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf724616ddf',
      '_blank'
    );
  };

  const handleEmailClick = () => {
    window.open(
      'https://www.canva.com/design/DAGZHjJJ-80/AO8UDDeubPDFb5q1GGPr7g/view?utm_content=DAGZHjJJ-80&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hedf49f66b2',
      '_blank'
    );
  };

  if (variant === 'final') {
    return (
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
          onClick={() =>
            handleWhatsAppClick(
              'Oi tudo bem? Utilizei o aplicativo o 🎯 Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde e consegui o seguinte resultado, podem me ajudar? [ESPAÇO PARA EU FUTURAMENTE INTEGRAR COM O RESULTADO]'
            )
          }
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
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        <button
          onClick={() => handleWhatsAppClick()}
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
    );
  }
  // Versão padrão (cards flutuantes)
  return (
    <div className={`space-y-4 p-2 sm:p-0 ${className}`}>
      <Card
        className="hover:scale-105 transition-transform duration-200 cursor-pointer"
        onClick={() => handleWhatsAppClick()}
      >
        <CardContent className="p-3 sm:p-4 flex items-center gap-3">
          {' '}
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
          {' '}
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
