import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClient(cookieStore?: Awaited<ReturnType<typeof cookies>>) {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv()
  const resolvedCookieStore = cookieStore ?? (await cookies())

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            resolvedCookieStore.set(name, value, options),
          )
        } catch {
          // En Server Components puede dispararse durante el render.
          // El refresco real de sesión queda cubierto por el proxy.
        }
      },
    },
  })
}
