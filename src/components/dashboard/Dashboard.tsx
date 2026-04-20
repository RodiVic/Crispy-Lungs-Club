import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useApi } from '../../hooks/apiClient'
import { SquirrelMascot } from './SquirrelMascot'
import { StatsGrid } from './StatsGrid'
import { LogTrigger } from './LogTrigger'
import type { StatsResponse, TriggerType } from '../../types'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { getStats, getTriggerTypes } = useApi()
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [triggerTypes, setTriggerTypes] = useState<TriggerType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async () => {
    try {
      setLoading(true)
      const [stats, triggers] = await Promise.all([getStats(), getTriggerTypes()])
      setStatsData(stats)
      setTriggerTypes(triggers)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  const timer = setTimeout(() => {
    loadAll()
  }, 500)
  return () => clearTimeout(timer)
}, [])

  if (loading) return <div className="loading">🐿️ Loading your stats...</div>
  if (error) return <div className="error">Something went wrong: {error}</div>

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🐿️ Crispy Lungs Club</h1>
        <div className="header-right">
          <span className="username">Hey, {user?.email?.split('@')[0]}!</span>
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </header>

      {statsData && (
        <>
          <SquirrelMascot streak={statsData.stats.current_streak} />
          <StatsGrid data={statsData} />
          <LogTrigger
            triggerTypes={triggerTypes}
            onLogged={loadAll}  // refreshes stats after logging
          />
        </>
      )}

      {!statsData?.currentAttempt && (
        <div className="no-attempt-banner">
          <p>No active quit attempt yet.</p>
          <button onClick={() => {/* we'll wire StartAttempt next */}}>
            🚀 Start my quit journey
          </button>
        </div>
      )}
    </div>
  )
}
