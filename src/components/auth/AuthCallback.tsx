import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  useEffect(() => {
    // Supabase handles the token exchange from the URL hash automatically
    supabase.auth.getSession().then(() => {
      window.location.replace('/')
    })
  }, [])

  return (
    <div className="auth-container">
      <p>Signing you in... 🐿️</p>
    </div>
  )
}
