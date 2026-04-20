import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.replace('/')
      }
    })

    // Also try to get session from URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/')
      }
    })
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Signing you in... 🐿️</p>
    </div>
  )
}
