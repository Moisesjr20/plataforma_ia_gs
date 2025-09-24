export interface User {
  id: string
  email: string
  name: string
}

export interface AIAgent {
  id: string
  name: string
  description: string
  personality: string
  webhookUrl: string
  color: string
}

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export interface ChatSession {
  agentId: string
  messages: ChatMessage[]
}