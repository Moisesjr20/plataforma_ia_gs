import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { LogoText } from '@/components/Logo'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    const { error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError(signInError)
    } else {
      navigate('/lobby')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LogoText className="text-center items-center" size="lg" />
          </div>
          <p className="text-gray-300 font-light">Conecte-se com assistentes de IA especializados</p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/90 to-black/95 border border-gold/20 backdrop-blur-sm shadow-2xl shadow-gold/10">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl font-bold mb-2">Fazer Login</CardTitle>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mx-auto mb-4"></div>
            <CardDescription className="text-gray-300 text-center font-light">
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gold font-medium text-sm uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-gold/30 text-white placeholder:text-gray-500 focus:border-gold/60 focus:ring-gold/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gold font-medium text-sm uppercase tracking-wider">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-gold/30 text-white placeholder:text-gray-500 focus:border-gold/60 focus:ring-gold/20"
                />
              </div>
              
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">{error}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold py-3 px-6 rounded-lg shadow-lg shadow-gold/25 hover:shadow-gold/40 transition-all duration-300 border-0 hover:transform hover:translateY-[-1px]" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-gold hover:text-gold/80 font-medium transition-colors duration-300">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}