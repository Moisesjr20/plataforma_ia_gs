import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Lobby } from '@/pages/Lobby'
import Chat from '@/pages/Chat'
import './App.css'

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/lobby" replace /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/lobby" replace /> : <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          user ? <Navigate to="/lobby" replace /> : <Register />
        } 
      />
      <Route 
        path="/lobby" 
        element={
          <ProtectedRoute>
            <Lobby />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat/:agentId" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  console.log('App component carregado')
  
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App