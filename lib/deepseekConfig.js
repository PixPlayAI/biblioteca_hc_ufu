// lib/deepseekConfig.js
/**
 * Configuração centralizada para a API DeepSeek
 * Facilita a manutenção e mudança de modelos
 */

const DEEPSEEK_CONFIG = {
  // URL base da API
  baseURL: 'https://api.deepseek.com',

  // Endpoint para chat completions
  chatEndpoint: '/chat/completions',

  // Modelos disponíveis
  models: {
    chat: 'deepseek-chat',      // DeepSeek-V3-0324 - modelo mais poderoso
    reasoner: 'deepseek-reasoner' // DeepSeek-R1-0528 - modelo com capacidade de raciocínio
  },

  // Configurações padrão para requisições
  defaultOptions: {
    temperature: 0,
    max_tokens: 4096,
  },

  // Headers padrão
  getHeaders: (apiKey) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }),

  // URL completa para chat
  getChatURL: () => `${DEEPSEEK_CONFIG.baseURL}${DEEPSEEK_CONFIG.chatEndpoint}`,

  // Função helper para criar payload de requisição
  createChatPayload: (messages, options = {}) => ({
    model: options.model || DEEPSEEK_CONFIG.models.chat,
    messages,
    temperature: options.temperature ?? DEEPSEEK_CONFIG.defaultOptions.temperature,
    max_tokens: options.max_tokens || DEEPSEEK_CONFIG.defaultOptions.max_tokens,
    ...(options.response_format && { response_format: options.response_format })
  })
};

/**
 * Função helper para fazer chamadas à API DeepSeek
 * @param {Array} messages - Array de mensagens [{role: 'system'|'user'|'assistant', content: string}]
 * @param {Object} options - Opções adicionais (model, temperature, max_tokens, etc)
 * @returns {Promise} Resposta da API
 */
export async function callDeepSeek(messages, options = {}) {
  const axios = require('axios');
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY não está configurada');
  }

  const payload = DEEPSEEK_CONFIG.createChatPayload(messages, options);
  const headers = DEEPSEEK_CONFIG.getHeaders(apiKey);
  const url = DEEPSEEK_CONFIG.getChatURL();

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error('Erro ao chamar DeepSeek API:', error.response?.data || error.message);
    throw error;
  }
}

export default DEEPSEEK_CONFIG;