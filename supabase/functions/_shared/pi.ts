// Shared helpers for the Pi payment functions (Supabase Edge Functions, Deno).
import { createClient } from 'npm:@supabase/supabase-js@2'

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const PI_API = 'https://api.minepi.com/v2'
const PI_KEY = Deno.env.get('PI_API_KEY') ?? ''

export async function pi(path: string, method = 'GET', body?: unknown) {
  const r = await fetch(PI_API + path, {
    method,
    headers: { Authorization: `Key ${PI_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Pi API ${r.status}: ${JSON.stringify(data)}`)
  return data
}

// Admin client (service role) + the calling user, verified from their login token.
export async function context(req: Request) {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data } = await admin.auth.getUser(token)
  return { admin, user: data.user }
}
