import { useState, useCallback } from 'react'
import { Message, AIAgent } from '@/types'
import { ragService } from '@/services/rag'
import { openaiService } from '@/services/openai'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string, agent: AIAgent) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      isUser: true,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Obter contexto relevante do RAG
      const ragContext = await ragService.getRelevantContext(content);
      let assistantResponse: string;

      if (openaiService.isConfigured()) {
        // Usar OpenAI diretamente com contexto RAG
        assistantResponse = await openaiService.generateResponse(content, agent, ragContext || undefined);
      } else {
        // Fallback para resposta local se OpenAI não estiver configurada
        assistantResponse = await generateLocalResponse(content, ragContext || '');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        isUser: false,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isUser: false,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateLocalResponse = async (query: string, context: string): Promise<string> => {
    // Resposta local baseada no contexto RAG específico
    const lowerQuery = query.toLowerCase();
    
    // Se há contexto específico, usar as informações do RAG
    if (context && context.trim()) {
      // Perguntas sobre marcos da Imersão Turbinar
      if (lowerQuery.includes('marcos') || lowerQuery.includes('cronograma') || lowerQuery.includes('etapas')) {
        if (context.includes('MARCOS PRINCIPAIS')) {
          return `Claro! A Imersão Turbinar é estruturada em 6 marcos principais ao longo de 12 semanas:

**MARCO 1 - FUNDAÇÃO ESTRATÉGICA** (Semanas 1-2)
Definição da identidade da marca, análise de mercado e estabelecimento de objetivos.

**MARCO 2 - PRESENÇA DIGITAL** (Semanas 3-4)  
Criação/otimização do site e configuração de redes sociais estratégicas.

**MARCO 3 - ESTRATÉGIA DE CONTEÚDO** (Semanas 5-6)
Desenvolvimento do calendário editorial e produção de conteúdo de valor.

**MARCO 4 - GERAÇÃO DE LEADS** (Semanas 7-8)
Criação de iscas digitais e implementação de funis de captura.

**MARCO 5 - CONVERSÃO E VENDAS** (Semanas 9-10)
Desenvolvimento de funis de vendas e páginas otimizadas.

**MARCO 6 - AUTOMAÇÃO E ESCALA** (Semanas 11-12)
Implementação de chatbots e automação de processos.

Gostaria que eu detalhe algum marco específico?`;
        }
      }
      
      // Perguntas sobre metodologia
      if (lowerQuery.includes('metodologia') || lowerQuery.includes('como funciona') || lowerQuery.includes('método')) {
        if (context.includes('METODOLOGIA')) {
          return `A metodologia da Imersão Turbinar é baseada em pilares fundamentais comprovados:

• **Estratégia antes da execução** - Planejamos tudo antes de implementar
• **Foco em resultados mensuráveis** - Cada ação tem métricas claras
• **Implementação prática** - Você aplica o que aprende imediatamente
• **Acompanhamento personalizado** - Suporte durante toda a jornada

É um programa intensivo de 12 semanas que transforma negócios através do marketing digital estratégico. Quer saber mais sobre algum aspecto específico?`;
        }
      }
      
      // Perguntas sobre investimento
      if (lowerQuery.includes('valor') || lowerQuery.includes('preço') || lowerQuery.includes('investimento') || lowerQuery.includes('quanto custa')) {
        if (context.includes('INVESTIMENTO') || context.includes('R$')) {
          return `Sobre o investimento da Imersão Turbinar:

O programa tem um valor de **R$ 2.997** que pode ser parcelado em até **12x de R$ 297** no cartão.

**Condições especiais disponíveis:**
• Desconto para pagamento à vista
• Parcelamento facilitado
• Garantia de satisfação
• Bônus exclusivos inclusos

O investimento se paga rapidamente com a implementação das estratégias. Gostaria de conhecer as condições especiais disponíveis?`;
        }
      }
      
      // Usar contexto geral quando disponível
      return `Com base nas informações que tenho, posso te ajudar com isso! ${context.substring(0, 300)}... 

Gostaria que eu detalhe melhor algum aspecto específico? Estou aqui para esclarecer todas as suas dúvidas!`;
    }
    
    // Saudações quando não há contexto específico
    if (lowerQuery.includes('oi') || lowerQuery.includes('olá') || lowerQuery.includes('como pode me ajudar')) {
      return 'Olá! Fico feliz em poder ajudá-lo! Sou especialista e estou aqui para esclarecer suas dúvidas sobre a Imersão Turbinar, metodologias de marketing digital e como podemos acelerar os resultados do seu negócio. Como posso ajudá-lo hoje?';
    }
    
    // Resposta padrão quando não há contexto
    return 'Obrigado pela sua pergunta! Para te dar uma resposta mais precisa e personalizada, gostaria de entender melhor sua necessidade. Pode me contar um pouco mais sobre o que você gostaria de saber? Assim posso te ajudar da melhor forma possível!';
  };

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}