import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' }

  try {
    const token = event.headers.authorization?.replace('Bearer ', '')
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization header' }) }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }

    // Fetch all users who opted in, joined with their stats
    // RLS leaderboard policy allows this read
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        current_streak,
        best_streak,
        total_vape_free_days,
        money_saved_cents,
        last_calculated_at,
        users!inner (
          username,
          avatar_url,
          opted_into_leaderboard
        )
      `)
      .eq('users.opted_into_leaderboard', true)
      .order('current_streak', { ascending: false })
      .limit(50)

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }

    const leaderboard = (data ?? []).map((row: any, index: number) => ({
      rank: index + 1,
      user_id: row.user_id,
      username: row.users.username,
      avatar_url: row.users.avatar_url,
      current_streak: row.current_streak,
      best_streak: row.best_streak,
      total_vape_free_days: row.total_vape_free_days,
      money_saved_dollars: (row.money_saved_cents / 100).toFixed(2),
      is_current_user: row.user_id === user.id
    }))

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(leaderboard)
    }
  } catch (err) {
    console.error('get-leaderboard error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
