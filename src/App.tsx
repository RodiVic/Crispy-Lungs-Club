import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginForm } from './components/auth/LoginForm'
import { AuthCallback } from './components/auth/AuthCallback'
import { Dashboard } from './components/dashboard/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()

  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />
  }

  if (loading) return <div className="loading">🐿️ Loading...</div>
  if (!user) return <LoginForm />

  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
