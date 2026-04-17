import 'server-only'

import type {
  PropertyMediaFormItem,
  PropertyMediaItem,
  PropertyMediaPreview,
} from '@/lib/property-media/schema'
import { getPropertyCoverPreview } from '@/lib/property-media/schema'
import { assertNoSupabaseError } from '@/lib/supabase/repository'
import { createClient } from '@/utils/supabase/server'

interface PropertyMediaRow {
  id: string
  agency_id: string
  property_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean | number
  created_at: string
  updated_at: string
}

function isMissingRelationError(error: { code?: string; message: string } | null) {
  if (!error) {
    return false
  }

  if (error.code === '42P01' || error.code === 'PGRST205') {
    return true
  }

  const normalizedMessage = error.message.toLowerCase()
  const mentionsMediaRelations = normalizedMessage.includes('property_media')

  return (
    mentionsMediaRelations &&
    (
      normalizedMessage.includes('could not find the table') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('does not exist')
    )
  )
}

function mapPropertyMediaRow(row: PropertyMediaRow): PropertyMediaItem {
  return {
    id: row.id,
    agencyId: row.agency_id,
    propertyId: row.property_id,
    url: row.url,
    altText: row.alt_text ?? undefined,
    sortOrder: row.sort_order,
    isCover: Boolean(row.is_cover),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeMediaUrl(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  try {
    const parsed = new URL(trimmed)

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed
    }
  } catch {
    return undefined
  }

  return undefined
}

function normalizeAltText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function getMissingRelationMessage() {
  return 'La tabla de multimedia todavia no existe. Aplicá la nueva migracion antes de cargar imágenes.'
}

export function preparePropertyMediaItems(input: unknown):
  | { ok: true; items: PropertyMediaFormItem[] }
  | { ok: false; fieldErrors: Record<string, string> } {
  if (input === undefined || input === null) {
    return {
      ok: true,
      items: [],
    }
  }

  if (!Array.isArray(input)) {
    return {
      ok: false,
      fieldErrors: {
        'items.0.url': 'El formato de multimedia es inválido.',
      },
    }
  }

  const fieldErrors: Record<string, string> = {}
  const items: PropertyMediaFormItem[] = []
  const seenUrls = new Set<string>()

  input.forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object') {
      fieldErrors[`items.${index}.url`] = 'La fila de multimedia es inválida.'
      return
    }

    const candidate = rawItem as Record<string, unknown>
    const rawUrl = typeof candidate.url === 'string' ? candidate.url.trim() : ''
    const url = normalizeMediaUrl(candidate.url)
    const altText = normalizeAltText(candidate.altText)
    const isCover = Boolean(candidate.isCover)

    if (!rawUrl && !altText) {
      return
    }

    if (!url) {
      fieldErrors[`items.${index}.url`] =
        'Ingresá una URL válida. Acepta http, https o una ruta local que empiece con /.'
      return
    }

    if (altText && altText.length > 180) {
      fieldErrors[`items.${index}.altText`] =
        'El texto alternativo no puede superar 180 caracteres.'
      return
    }

    if (seenUrls.has(url)) {
      fieldErrors[`items.${index}.url`] = 'Esa imagen ya fue agregada en la galería.'
      return
    }

    seenUrls.add(url)
    items.push({
      url,
      altText,
      isCover,
    })
  })

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
    }
  }

  if (items.length === 0) {
    return {
      ok: true,
      items: [],
    }
  }

  const coverIndex = items.findIndex((item) => item.isCover)
  const resolvedCoverIndex = coverIndex >= 0 ? coverIndex : 0

  return {
    ok: true,
    items: items.map((item, index) => ({
      ...item,
      isCover: index === resolvedCoverIndex,
    })),
  }
}

export async function assertPropertyMediaReady() {
  const supabase = await createClient()
  const { error } = await supabase.from('property_media').select('id').limit(1)

  if (isMissingRelationError(error)) {
    throw new Error(getMissingRelationMessage())
  }

  assertNoSupabaseError(error, 'No se pudo validar la infraestructura de multimedia')
}

export async function getPropertyMedia(agencyId: string, propertyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('property_media')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (isMissingRelationError(error)) {
    return [] as PropertyMediaItem[]
  }

  assertNoSupabaseError(error, 'No se pudo cargar la galería de la propiedad')

  return (data ?? []).map((row) => mapPropertyMediaRow(row as PropertyMediaRow))
}

export async function getPropertyMediaPreviewMap(agencyId: string, propertyIds: string[]) {
  if (propertyIds.length === 0) {
    return {} as Record<string, PropertyMediaPreview>
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('property_media')
    .select('property_id, url, alt_text, sort_order, is_cover, created_at')
    .eq('agency_id', agencyId)
    .in('property_id', propertyIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (isMissingRelationError(error)) {
    return {} as Record<string, PropertyMediaPreview>
  }

  assertNoSupabaseError(error, 'No se pudo cargar la portada de las propiedades')

  const groupedItems = (data ?? []).reduce<
    Record<
      string,
      Array<Pick<PropertyMediaItem, 'url' | 'altText' | 'isCover'>>
    >
  >((accumulator, row) => {
    const propertyId = String((row as { property_id: string }).property_id)

    if (!accumulator[propertyId]) {
      accumulator[propertyId] = []
    }

    accumulator[propertyId].push({
      url: String((row as { url: string }).url),
      altText:
        typeof (row as { alt_text?: string | null }).alt_text === 'string'
          ? (row as { alt_text: string }).alt_text
          : undefined,
      isCover: Boolean((row as { is_cover: boolean | number }).is_cover),
    })

    return accumulator
  }, {})

  return Object.fromEntries(
    Object.entries(groupedItems).map(([propertyId, items]) => [
      propertyId,
      {
        ...getPropertyCoverPreview(items),
        mediaCount: items.length,
      },
    ]),
  ) as Record<string, PropertyMediaPreview>
}

export async function replacePropertyMedia(
  agencyId: string,
  propertyId: string,
  items: PropertyMediaFormItem[],
) {
  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('property_media')
    .delete()
    .eq('agency_id', agencyId)
    .eq('property_id', propertyId)

  if (isMissingRelationError(deleteError)) {
    if (items.length === 0) {
      return
    }

    throw new Error(getMissingRelationMessage())
  }

  assertNoSupabaseError(deleteError, 'No se pudo actualizar la galería de la propiedad')

  if (items.length === 0) {
    return
  }

  const { error: insertError } = await supabase.from('property_media').insert(
    items.map((item, index) => ({
      agency_id: agencyId,
      property_id: propertyId,
      url: item.url,
      alt_text: item.altText ?? null,
      sort_order: index + 1,
      is_cover: item.isCover,
    })),
  )

  if (isMissingRelationError(insertError)) {
    throw new Error(getMissingRelationMessage())
  }

  assertNoSupabaseError(insertError, 'No se pudo guardar la galería de la propiedad')
}
