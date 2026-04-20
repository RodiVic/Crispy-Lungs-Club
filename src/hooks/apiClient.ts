/// <reference types="vite/client" />
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) return session.access_token

  const { data: { session: refreshed } } = await supabase.auth.refreshSession()
  return refreshed?.access_token ?? null
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

  async function run<T>(fn: () => Promise<T>): Promise<T> {
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

  const getStats = () => run(() => callFunction('get-stats'))
  const createAttempt = (params: { daily_cost_cents?: number; reason?: string; notes?: string }) =>
    run(() => callFunction('create-attempt', 'POST', params))
  const logTrigger = (params: { trigger_type_id: string; resisted?: boolean; intensity?: number; custom_trigger_text?: string; notes?: string }) =>
    run(() => callFunction('log-trigger', 'POST', params))
  const getLeaderboard = () => run(() => callFunction('get-leaderboard'))
  const getTriggerTypes = () => run(() => callFunction('get-triggers'))

  return { loading, error, getStats, createAttempt, logTrigger, getLeaderboard, getTriggerTypes }
}
