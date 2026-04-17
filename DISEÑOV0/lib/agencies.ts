import 'server-only'

import { cache } from 'react'

import {
  assertNoSupabaseError,
  isSupabaseDuplicateError,
  requireSupabaseData,
} from '@/lib/supabase/repository'
import { createClient } from '@/utils/supabase/server'

interface AgencyRow {
  id: string
  slug: string
  name: string
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  slug: string
  name: string
  createdAt: string
  updatedAt: string
}

const defaultAgencySlug =
  process.env.INMOBIA_DEFAULT_AGENCY_SLUG?.trim().toLowerCase() || 'agencia-demo'
const defaultAgencyName = process.env.INMOBIA_DEFAULT_AGENCY_NAME?.trim() || 'Agencia Demo'

function mapAgencyRow(row: AgencyRow): Agency {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function findAgencyBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('id, slug, name, created_at, updated_at')
    .eq('slug', slug)
    .maybeSingle()

  assertNoSupabaseError(error, 'No se pudo leer la agencia por defecto')

  return data ? mapAgencyRow(data as AgencyRow) : null
}

export const getCurrentAgency = cache(async function getCurrentAgency(): Promise<Agency> {
  const existingAgency = await findAgencyBySlug(defaultAgencySlug)

  if (existingAgency) {
    return existingAgency
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agencies')
    .insert({
      slug: defaultAgencySlug,
      name: defaultAgencyName,
    })
    .select('id, slug, name, created_at, updated_at')
    .single()

  if (isSupabaseDuplicateError(error, 'agencies_slug_key')) {
    const duplicatedAgency = await findAgencyBySlug(defaultAgencySlug)

    if (duplicatedAgency) {
      return duplicatedAgency
    }
  }

  assertNoSupabaseError(error, 'No se pudo crear la agencia por defecto')

  return mapAgencyRow(
    requireSupabaseData(
      data as AgencyRow | null,
      'Supabase no devolvió la agencia creada durante el bootstrap inicial.',
    ),
  )
})

export const getAgencyBySlug = cache(async function getAgencyBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  if (normalizedSlug === defaultAgencySlug) {
    return getCurrentAgency()
  }

  return findAgencyBySlug(normalizedSlug)
})
