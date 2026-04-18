import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const token = event.headers.authorization?.replace('Bearer ', '')
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization header' }) }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }

    const { daily_cost_cents, reason, notes } = JSON.parse(event.body || '{}')

    // Mark any existing active attempt as relapsed before starting a new one
    await supabase
      .from('attempts')
      .update({ status: 'relapsed', end_date: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active')

    const { data, error } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        start_date: new Date().toISOString(),
        status: 'active',
        daily_cost_cents: daily_cost_cents ?? null,
        reason: reason ?? null,
        notes: notes ?? null
      })
      .select()
      .single()

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }

    // Recalculate stats after new attempt
    await supabase.rpc('recalculate_user_stats', { target_user_id: user.id })

    return {
      statusCode: 201,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.error('create-attempt error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
