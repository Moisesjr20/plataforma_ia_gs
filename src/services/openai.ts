import { AIAgent } from '@/types';

// Configuração para chamadas diretas à API OpenAI via fetch
const OPENAI_API_BASE = 'https://api.openai.com/v1';

async function makeOpenAIRequest(endpoint: string, data: any) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Chave da API OpenAI não configurada');
  }

  const response = await fetch(`${OPENAI_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro da API OpenAI: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

export async function getEmbedding(text: string) {
  const data = {
    model: 'text-embedding-ada-002',
    input: text,
  };

  const response = await makeOpenAIRequest('/embeddings', data);
  return response.data[0].embedding;
}

export async function getChatCompletion(messages: any[]) {
  // Validação das mensagens
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Lista de mensagens não pode estar vazia');
  }

  // Validação de cada mensagem
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      throw new Error('Mensagem inválida encontrada');
    }
    if (!message.role || typeof message.role !== 'string') {
      throw new Error('Role da mensagem é obrigatório');
    }
    if (!message.content || typeof message.content !== 'string' || message.content.trim() === '') {
      throw new Error(`Conteúdo da mensagem com role '${message.role}' não pode estar vazio`);
    }
  }

  const data = {
    model: 'gpt-3.5-turbo',
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content.trim()
    })),
  };

  const response = await makeOpenAIRequest('/chat/completions', data);
  return response.choices[0].message.content;
}

class OpenAIService {
  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateResponse(content: string, agent: AIAgent, ragContext?: string): Promise<string> {
    // Validação rigorosa do conteúdo
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new Error('Conteúdo da mensagem não pode estar vazio');
    }

    // Validação do agente
    if (!agent || !agent.systemPrompt) {
      throw new Error('Agente inválido ou sem prompt do sistema');
    }

    const systemPrompt = ragContext 
      ? `${agent.systemPrompt}\n\nContexto adicional da base de conhecimento:\n${ragContext}`
      : agent.systemPrompt;

    // Validação final dos prompts
    if (!systemPrompt || systemPrompt.trim() === '') {
      throw new Error('Prompt do sistema não pode estar vazio');
    }

    const messages = [
      { role: 'system', content: systemPrompt.trim() },
      { role: 'user', content: content.trim() }
    ];

    return await getChatCompletion(messages);
  }
}

export const openaiService = new OpenAIService();