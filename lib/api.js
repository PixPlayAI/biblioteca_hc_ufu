import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 100000, // Ajustar para o mesmo tempo que o backend
});

export const generateScenarioContent = async (context) => {
  const response = await api.post('/analyze', {
    content: {
      history: context.history || [],
      currentInput: context.currentInput,
      currentStep: context.currentStep || 0,
      suggestionMode: context.suggestionMode || false,
      suggestedElement: context.suggestedElement || null,
    },
  });

  return response.data;
};

export default api;
