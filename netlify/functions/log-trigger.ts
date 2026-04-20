import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  pprocess.env.SUPABASE_SERVICE_ROLE_KEY!
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

    const { trigger_type_id, resisted, intensity, custom_trigger_text, notes } = JSON.parse(event.body || '{}')

    if (!trigger_type_id) return { statusCode: 400, body: JSON.stringify({ error: 'trigger_type_id is required' }) }

    const { data, error } = await supabase
      .from('user_triggers')
      .insert({
        user_id: user.id,
        trigger_type_id,
        resisted: resisted ?? null,
        intensity: intensity ?? null,
        custom_trigger_text: custom_trigger_text ?? null,
        notes: notes ?? null
      })
      .select()
      .single()

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }

    return {
      statusCode: 201,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.error('log-trigger error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
