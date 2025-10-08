import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Bot, User, Settings, FileText, LogOut, Brain, Lightbulb, TrendingUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChat } from '@/hooks/useChat'
import { AI_AGENTS } from '@/data/agents'
import { AIAgent } from '@/types'
import { LogoText } from '@/components/Logo'
import { RAGControls } from '@/components/RAGControls'
import { LogsViewer } from '@/components/LogsViewer'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"

const getAgentIcon = (agentId: string) => {
  switch (agentId) {
    case 'augusto':
      return <TrendingUp className="w-8 h-8 text-black" />
    case 'sofia':
      return <Lightbulb className="w-8 h-8 text-black" />
    case 'carol':
      return <Brain className="w-8 h-8 text-black" />
    default:
      return <Bot className="w-8 h-8 text-black" />
  }
}

export default function Chat() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { agentId } = useParams<{ agentId: string }>()
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleBackToLobby = () => {
    navigate('/')
  }
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(AI_AGENTS[0])
  const [inputMessage, setInputMessage] = useState('')
  const [showRAGControls, setShowRAGControls] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const { messages, isLoading, sendMessage, clearMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    await sendMessage(inputMessage, selectedAgent)
    setInputMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToLobby}
                className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
              >
                ← Voltar
              </Button>
              <LogoText />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 text-gold/80">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <span className="font-medium text-white">{user?.name}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900/90 to-black/95 border-r border-gold/20 flex flex-col backdrop-blur-sm">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gold/20">
            <h2 className="text-xl font-bold text-white mb-2">Assistentes IA</h2>
            <p className="text-sm text-gray-300">Escolha um assistente especializado</p>
          </div>

          {/* Agent List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {AI_AGENTS.map((agent) => (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 backdrop-blur-sm hover:transform hover:scale-[1.02] ${
                  selectedAgent.id === agent.id
                    ? 'ring-2 ring-gold/50 bg-gradient-to-br from-gold/10 to-gold/5 border-gold/40'
                    : 'bg-gradient-to-br from-gray-900/90 to-black/95 border-gold/20 hover:border-gold/40'
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold/25">
                        {getAgentIcon(agent.id)}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full opacity-20 transition-opacity duration-300 blur-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        selectedAgent.id === agent.id 
                          ? 'text-gray-900' 
                          : 'text-white'
                      }`}>
                        {agent.name}
                      </h3>
                      <p className={`text-sm line-clamp-2 ${
                        selectedAgent.id === agent.id 
                          ? 'text-gray-700' 
                          : 'text-gray-300'
                      }`}>
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gold/20 space-y-3">
            <Dialog open={showRAGControls} onOpenChange={setShowRAGControls}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações RAG
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh] bg-gray-900/90 text-white border-gold/30">
                <DialogHeader>
                  <DialogTitle>Configurações Avançadas do RAG</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto p-4">
                  <RAGControls agentId={selectedAgent.id} agentName={selectedAgent.name} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">Fechar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showLogs} onOpenChange={setShowLogs}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl h-[90vh] bg-gray-900/90 text-white border-gold/30 flex flex-col">
                <DialogHeader>
                  <DialogTitle>Logs de Execução</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <LogsViewer />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">Fechar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={clearMessages}
              className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Conversa
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900/50 to-black/80">
          {/* Chat Header */}
          <div className="p-6 border-b border-gold/20 bg-gradient-to-r from-gray-900/80 to-black/90 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold/25">
                  {getAgentIcon(selectedAgent.id)}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full opacity-20 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedAgent.name}</h1>
                <p className="text-gray-300">{selectedAgent.description}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900/30 to-black/60">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-2xl shadow-gold/30">
                    {getAgentIcon(selectedAgent.id)}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full opacity-20 transition-opacity duration-300 blur-lg"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Olá! Sou {selectedAgent.name}
                </h3>
                <p className="text-gray-300 max-w-md leading-relaxed">
                  {selectedAgent.description}
                </p>
                <div className="mt-8 w-full max-w-md">
                  <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white border border-gold/40'
                          : 'bg-gradient-to-br from-gray-900/90 to-black/95 text-white border border-gold/30'
                      }`}
                    >
                      {message.role === 'assistant' && message.content === '...' ? (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gold/20 bg-gradient-to-r from-gray-900/90 to-black/95 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Digite sua mensagem para ${selectedAgent.name}...`}
                className="flex-1 bg-black/50 border-gold/30 text-white placeholder:text-gray-400 focus:border-gold/50 focus:ring-gold/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium px-8 transition-all duration-300 shadow-lg shadow-gold/25"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}