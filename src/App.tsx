import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginForm } from './components/auth/LoginForm'
import { AuthCallback } from './components/auth/AuthCallback'

function AppContent() {
  const { user, loading } = useAuth()

  // Handle Google OAuth callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />
  }

  if (loading) return <div className="loading">🐿️ Loading...</div>

  if (!user) return <LoginForm />

  // Your actual app goes here once logged in
  return (
    <div>
      <h1>🐿️ You're in!</h1>
      <p>User: {user.email}</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
