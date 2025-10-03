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
  color: string
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatSession {
  agentId: string
  messages: Message[]
}