import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo mode - não precisa do Supabase para funcionar
    console.log('Iniciando AuthContext em modo demo')
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Demo mode - aceita qualquer email/senha para teste
      if (email && password) {
        setUser({
          id: 'demo-user-id',
          email: email,
          name: email.split('@')[0],
        })
        return {}
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { error: error.message }
      }
      
      return {}
    } catch (error) {
      // Fallback demo mode
      if (email && password) {
        setUser({
          id: 'demo-user-id',
          email: email,
          name: email.split('@')[0],
        })
        return {}
      }
      return { error: 'Erro inesperado ao fazer login' }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Demo mode - aceita qualquer cadastro para teste
      if (email && password && name) {
        setUser({
          id: 'demo-user-id',
          email: email,
          name: name,
        })
        return {}
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      
      if (error) {
        return { error: error.message }
      }
      
      return {}
    } catch (error) {
      // Fallback demo mode
      if (email && password && name) {
        setUser({
          id: 'demo-user-id',
          email: email,
          name: name,
        })
        return {}
      }
      return { error: 'Erro inesperado ao criar conta' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}