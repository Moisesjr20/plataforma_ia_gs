import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { AI_AGENTS } from '@/data/agents'
import { LogoText } from '@/components/Logo'
import { MessageCircle, LogOut, User, Brain, Lightbulb, TrendingUp } from 'lucide-react'

const getAgentIcon = (agentId: string) => {
  switch (agentId) {
    case 'augusto':
      return <TrendingUp className="w-8 h-8 text-black" />
    case 'sofia':
      return <Lightbulb className="w-8 h-8 text-black" />
    case 'carol':
      return <Brain className="w-8 h-8 text-black" />
    default:
      return <MessageCircle className="w-8 h-8 text-black" />
  }
}

export const Lobby: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleChatWithAgent = (agentId: string) => {
    navigate(`/chat/${agentId}`)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <LogoText />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Bem-vindo à Plataforma 
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent block mt-2">
                GE IA Premium
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full mb-8"></div>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Escolha um dos nossos <span className="text-gold font-medium">assistentes especializados</span> para começar sua conversa. 
            Cada IA foi desenvolvida com uma <span className="text-gold font-medium">personalidade única</span> para atender suas necessidades específicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AI_AGENTS.map((agent) => (
            <Card 
              key={agent.id} 
              className="group bg-gradient-to-br from-gray-900/90 to-black/95 border border-gold/20 hover:border-gold/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 backdrop-blur-sm hover:transform hover:scale-[1.02]"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold/25 group-hover:shadow-gold/40 transition-all duration-300">
                      {getAgentIcon(agent.id)}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white font-bold mb-1 group-hover:text-gold/90 transition-colors duration-300">
                      {agent.name}
                    </CardTitle>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"></div>
                  </div>
                </div>
                <CardDescription className="text-gray-300 text-base leading-relaxed font-light">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-8">
                  <h4 className="font-semibold text-gold mb-3 text-sm uppercase tracking-wider">Especialização:</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {agent.personality}
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold py-3 px-6 rounded-lg shadow-lg shadow-gold/25 hover:shadow-gold/40 transition-all duration-300 border-0 hover:transform hover:translateY-[-1px]"
                  onClick={() => handleChatWithAgent(agent.id)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversar com {agent.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}