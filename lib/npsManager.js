//lib/npsManager.js
export const NPS_SOURCES = {
  LIKE_BUTTON: {
    id: 'like_button',
    text: 'Está gostando?',
    description: 'Através de clique no botão "Está gostando?", antes do resultado final',
    type: 'spontaneous',
  },
  APP_FEEDBACK: {
    id: 'app_feedback',
    text: 'O que está achando do app?',
    description:
      'Através de clique no botão "O que está achando do app? Compartilhe sua experiência conosco", antes do resultado final',
    type: 'spontaneous',
  },
  NEED_HELP: {
    id: 'need_help',
    text: 'Precisa de ajuda?',
    description: 'Através de clique no botão "Precisa de ajuda?" antes do resultado final',
    type: 'forced',
  },
  LIBRARY_HELP: {
    id: 'library_help',
    text: 'Pedir ajuda para a biblioteca',
    description:
      'Através de clique no botão "Pedir ajuda para a biblioteca Clique para falar com a biblioteca do HC-UFU via WhatsApp"',
    type: 'forced',
  },
  EMAIL_RESULT: {
    id: 'email_result',
    text: 'Enviar para meu email',
    description:
      'Através de clique no botão "Enviar para meu email Receba o resultado por email" apresentado no resultado final da pergunta de pesquisa estruturada',
    type: 'forced',
  },
  CHAT_RESULT: {
    id: 'chat_result',
    text: 'Conversar sobre o resultado',
    description:
      'Através de clique no botão "Conversar sobre o resultado Fale com a biblioteca do HC-UFU" apresentado no resultado final da pergunta de pesquisa estruturada',
    type: 'forced',
  },
};

export const getNPSSource = (buttonId) => {
  return Object.values(NPS_SOURCES).find((source) => source.id === buttonId) || null;
};

export const checkNPSStatus = () => {
  return sessionStorage.getItem('nps_submitted') === 'true';
};

export const markNPSAsSubmitted = () => {
  sessionStorage.setItem('nps_submitted', 'true');
};
