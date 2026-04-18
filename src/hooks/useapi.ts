import { useState } from 'react'
import { supabase } from '../lib/supabase'

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const callFunction = async (name: string, method = 'GET', body?: object) => {
  const token = await getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`/.netlify/functions/${name}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `${name} failed`)
  }

  return response.json()
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get current user's stats + active attempt
  const getStats = () => run(() => callFunction('get-stats'))

  // Start a new quit attempt (closes any existing active one)
  const createAttempt = (params: {
    daily_cost_cents?: number
    reason?: string
    notes?: string
  }) => run(() => callFunction('create-attempt', 'POST', params))

  // Log a trigger/craving
  const logTrigger = (params: {
    trigger_type_id: string
    resisted?: boolean
    intensity?: number          // 1-10
    custom_trigger_text?: string
    notes?: string
  }) => run(() => callFunction('log-trigger', 'POST', params))

  // Get the leaderboard (opted-in users ranked by current streak)
  const getLeaderboard = () => run(() => callFunction('get-leaderboard'))

  // Get the trigger type lookup list (for dropdowns)
  const getTriggerTypes = () => run(() => callFunction('get-triggers'))

  return {
    loading,
    error,
    getStats,
    createAttempt,
    logTrigger,
    getLeaderboard,
    getTriggerTypes
  }
}
