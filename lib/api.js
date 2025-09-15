// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 100000,
});

// Adicionar interceptor para debug
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const generateScenarioContent = async (context) => {
  try {
    console.log('📤 Enviando para /api/analyze:', context);
    
    const response = await api.post('/analyze', {
      content: {
        history: context.history || [],
        currentInput: context.currentInput,
        currentStep: context.currentStep || 0,
        suggestionMode: context.suggestionMode || false,
        suggestedElement: context.suggestedElement || null,
      },
    });

    console.log('📥 Resposta recebida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro em generateScenarioContent:', error);
    throw error;
  }
};

export default api;