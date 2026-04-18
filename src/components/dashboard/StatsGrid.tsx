import type { StatsResponse } from '../../types'

type Props = { data: StatsResponse }

export function StatsGrid({ data }: Props) {
  const { stats, currentAttempt, money_saved_dollars } = data

  const getDaysIntoAttempt = () => {
    if (!currentAttempt) return 0
    const start = new Date(currentAttempt.start_date)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-icon">🔥</span>
        <p className="stat-label">Current Streak</p>
        <p className="stat-value">{stats.current_streak} <span className="stat-unit">days</span></p>
      </div>

      <div className="stat-card">
        <span className="stat-icon">🏆</span>
        <p className="stat-label">Best Streak</p>
        <p className="stat-value">{stats.best_streak} <span className="stat-unit">days</span></p>
      </div>

      <div className="stat-card">
        <span className="stat-icon">📅</span>
        <p className="stat-label">Total Vape-Free Days</p>
        <p className="stat-value">{stats.total_vape_free_days}</p>
      </div>

      <div className="stat-card">
        <span className="stat-icon">💰</span>
        <p className="stat-label">Money Saved</p>
        <p className="stat-value">${money_saved_dollars}</p>
      </div>

      <div className="stat-card">
        <span className="stat-icon">🎯</span>
        <p className="stat-label">Total Attempts</p>
        <p className="stat-value">{stats.total_attempts}</p>
      </div>

      <div className="stat-card">
        <span className="stat-icon">⏱️</span>
        <p className="stat-label">This Attempt</p>
        <p className="stat-value">{getDaysIntoAttempt()} <span className="stat-unit">days</span></p>
      </div>
    </div>
  )
}
