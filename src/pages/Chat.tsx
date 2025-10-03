import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChat } from '@/hooks/useChat'
import { AI_AGENTS } from '@/data/agents'
import { AIAgent } from '@/types'
import { RAGControls } from '@/components/RAGControls'
import { LogsViewer } from '@/components/LogsViewer'

export default function Chat() {
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

  const handleSendMessage = async (e: import('react').FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    await sendMessage(inputMessage.trim(), selectedAgent)
    setInputMessage('')
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-card-foreground">Agentes IA</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRAGControls(!showRAGControls);
                  setShowLogs(false);
                }}
                title="Configurações RAG"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLogs(!showLogs);
                  setShowRAGControls(false);
                }}
                title="Ver Logs"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showRAGControls && (
            <div className="mb-4 max-h-[70vh] overflow-y-auto">
              <RAGControls agentId={selectedAgent.id} agentName={selectedAgent.name} />
            </div>
          )}

          {showLogs && (
            <div className="mb-4 max-h-[70vh] overflow-y-auto">
              <LogsViewer />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {AI_AGENTS.map((agent) => (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAgent.id === agent.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback 
                      className="text-white font-semibold"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-card-foreground truncate">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={clearMessages}
            className="w-full"
          >
            Limpar Conversa
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback 
                className="text-white font-semibold"
                style={{ backgroundColor: selectedAgent.color }}
              >
                {selectedAgent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-card-foreground">
                {selectedAgent.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedAgent.description}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Olá! Sou {selectedAgent.name}
              </h3>
              <p className="text-center max-w-md">
                {selectedAgent.personality}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback
                      className={`${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-white'
                      }`}
                      style={
                        message.role === 'assistant'
                          ? { backgroundColor: selectedAgent.color }
                          : undefined
                      }
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        selectedAgent.name.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`mx-3 p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-card-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex">
                <Avatar className="flex-shrink-0">
                  <AvatarFallback
                    className="text-white"
                    style={{ backgroundColor: selectedAgent.color }}
                  >
                    {selectedAgent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mx-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-card border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Digite sua mensagem para ${selectedAgent.name}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}