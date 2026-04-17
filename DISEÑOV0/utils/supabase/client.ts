import { createBrowserClient } from '@supabase/ssr'

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el entorno.',
    )
  }

  return { supabaseUrl, supabaseKey }
}

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv()
  return createBrowserClient(supabaseUrl, supabaseKey)
}
