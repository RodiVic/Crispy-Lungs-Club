import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Mode = 'login' | 'signup'

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required')
          return
        }

        // Check username isn't taken
        const { data: existing } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.trim())
          .single()

        if (existing) {
          setError('That username is already taken')
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() } // passed to handle_new_user trigger
          }
        })

        if (error) throw error
        setMessage('Check your email to confirm your account!')

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // AuthProvider handles redirect via onAuthStateChange
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h1>🐿️ Crispy Lungs Club</h1>
      <p className="auth-subtitle">
        {mode === 'login' ? 'Welcome back. Still going strong?' : 'Join the club. Quit together.'}
      </p>

      <button
        className="google-btn"
        onClick={handleGoogle}
        disabled={loading}
      >
        <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="" />
        Continue with Google
      </button>

      <div className="divider"><span>or</span></div>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="auth-toggle">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          className="link-btn"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
