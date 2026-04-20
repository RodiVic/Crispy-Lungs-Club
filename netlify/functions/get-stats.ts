import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Recalculate stats fresh, then fetch
    await supabase.rpc('recalculate_user_stats', { target_user_id: user.id })

    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (statsError) return { statusCode: 500, body: JSON.stringify({ error: statsError.message }) }

    const { data: currentAttempt } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stats,
        currentAttempt: currentAttempt ?? null,
        money_saved_dollars: stats ? (stats.money_saved_cents / 100).toFixed(2) : '0.00'
      })
    }
  } catch (err) {
    console.error('get-stats error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
