import { useState, useCallback } from 'react'
import { ChatMessage, AIAgent } from '@/types'

export const useChat = (agent: AIAgent) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to n8n webhook
      const response = await fetch(agent.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          agent: agent.id,
          personality: agent.personality,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check if response has content
      const responseText = await response.text()
      
      let data: any = {}
      let aiResponseContent = 'Desculpe, não consegui processar sua mensagem no momento.'

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText)
          // Handle different response formats from N8N
          aiResponseContent = data.output || data.response || data.message || data.text || 
                            (typeof data === 'string' ? data : JSON.stringify(data))
        } catch (parseError) {
          console.warn('Failed to parse JSON response, using raw text:', parseError)
          // If JSON parsing fails, use the raw text as response
          aiResponseContent = responseText
        }
      } else {
        console.warn('Empty response received from webhook')
      }
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isUser: false,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [agent])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  }
}