export type UserProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  opted_into_leaderboard: boolean
  weekly_vape_cost_usd: number
  vape_quit_date: string | null
  created_at: string
  updated_at: string
}

export type Attempt = {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  status: 'active' | 'completed' | 'relapsed'
  daily_cost_cents: number | null
  reason: string | null
  notes: string | null
  created_at: string
}

export type UserStats = {
  id: string
  user_id: string
  current_streak: number
  best_streak: number
  total_vape_free_days: number
  total_attempts: number
  money_saved_cents: number
  last_calculated_at: string
}

export type TriggerType = {
  id: string
  category: 'emotional' | 'situational' | 'physical' | 'habit' | 'custom'
  trigger_name: string
  description: string | null
  icon: string | null
}

export type UserTrigger = {
  id: string
  user_id: string
  trigger_type_id: string
  experienced_at: string
  resisted: boolean | null
  intensity: number | null
  custom_trigger_text: string | null
  notes: string | null
}

export type LeaderboardEntry = {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  current_streak: number
  best_streak: number
  total_vape_free_days: number
  money_saved_dollars: string
  is_current_user: boolean
}

export type StatsResponse = {
  stats: UserStats
  currentAttempt: Attempt | null
  money_saved_dollars: string
}
