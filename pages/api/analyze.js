import { SYSTEM_PROMPT } from '../../lib/systemPrompt';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não está configurada');
    return res.status(500).json({ error: 'OpenAI API key not configured.' });
  }

  const {
    history = [],
    currentInput,
    currentStep = 0,
    suggestionMode = false,
    suggestedElement = null,
  } = req.body.content || {};

  const promptMessage = `HISTÓRICO DA CONVERSA:
${history
  .map((h, i) => `ETAPA ${i + 1}: Pergunta: ${h.question}, Resposta: ${h.answer}`)
  .join('\n')}

RESPOSTA ATUAL (Etapa ${currentStep + 1}): "${currentInput}"`;

  try {
    console.log('📝 Enviando solicitação para OpenAI com o prompt:', promptMessage);

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT + '\nResponda APENAS em JSON.',
          },
          { role: 'user', content: promptMessage },
        ],
        temperature: 0,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 55000,
      }
    );

    const openaiContent = openaiResponse.data.choices?.[0]?.message?.content;
    console.log('📥 Resposta da OpenAI:', openaiResponse.data);

    if (!openaiContent) {
      console.error('❌ Resposta vazia da OpenAI');
      return res.status(500).json({ error: 'Empty response from OpenAI.' });
    }

    try {
      const parsedContent = JSON.parse(openaiContent);
      return res.json(parsedContent);
    } catch (e) {
      console.error('❌ Erro ao parsear resposta da OpenAI:', openaiContent);
      return res.status(500).json({ error: 'Error parsing OpenAI response.' });
    }
  } catch (e) {
    console.error('❌ Erro ao solicitar OpenAI:', e.response?.data || e.message);
    return res.status(500).json({ error: 'Error requesting OpenAI.' });
  }
}
