import 'server-only'

import { cache } from 'react'

import {
  type PropertyFormValues,
  type PropertyListItem,
  type PropertyOperation,
  type PropertyStatus,
  slugify,
} from '@/lib/properties/schema'
import { getPropertyMediaPreviewMap } from '@/lib/property-media/repository'
import {
  assertNoSupabaseError,
  isSupabaseDuplicateError,
  parseSupabaseNullableNumber,
  parseSupabaseNumber,
  requireSupabaseData,
} from '@/lib/supabase/repository'
import { createClient } from '@/utils/supabase/server'

interface PropertyRow {
  id: string
  agency_id: string
  title: string
  internal_code: string
  operation: PropertyListItem['operation']
  property_type: PropertyListItem['propertyType']
  price_amount: number | string
  currency: PropertyListItem['currency']
  status: PropertyStatus
  show_price: boolean
  address: string
  city: string
  neighborhood: string | null
  location_mode: PropertyListItem['locationMode']
  bedrooms: number | null
  bathrooms: number | null
  covered_area: number | string | null
  total_area: number | string | null
  description: string | null
  slug: string
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

interface PropertyUniquenessRow {
  id: string
  internal_code: string
  slug: string
}

export interface PropertyDashboardStats {
  total: number
  published: number
  draft: number
  reserved: number
  sold: number
  rented: number
}

export interface PropertyActivityItem {
  id: string
  title: string
  status: PropertyStatus
  createdAt: string
  internalCode: string
}

export interface PublishedPropertyFilters {
  operation?: PropertyOperation
  query?: string
  limit?: number
}

function mapPropertyRow(row: PropertyRow): PropertyListItem {
  return {
    id: row.id,
    title: row.title,
    internalCode: row.internal_code,
    operation: row.operation,
    propertyType: row.property_type,
    price: parseSupabaseNumber(row.price_amount),
    currency: row.currency,
    status: row.status,
    showPrice: row.show_price,
    address: row.address,
    city: row.city,
    neighborhood: row.neighborhood,
    locationMode: row.location_mode,
    bedrooms: parseSupabaseNullableNumber(row.bedrooms),
    bathrooms: parseSupabaseNullableNumber(row.bathrooms),
    coveredArea: parseSupabaseNullableNumber(row.covered_area),
    totalArea: parseSupabaseNullableNumber(row.total_area),
    description: row.description,
    slug: row.slug,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    coverImageUrl: null,
    coverImageAlt: null,
    mediaCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function attachPropertyMediaPreview(
  agencyId: string,
  properties: PropertyListItem[],
): Promise<PropertyListItem[]> {
  if (properties.length === 0) {
    return properties
  }

  const previewMap = await getPropertyMediaPreviewMap(
    agencyId,
    properties.map((property) => property.id),
  )

  return properties.map((property) => {
    const preview = previewMap[property.id]

    if (!preview) {
      return property
    }

    return {
      ...property,
      coverImageUrl: preview.coverImageUrl ?? null,
      coverImageAlt: preview.coverImageAlt ?? null,
      mediaCount: preview.mediaCount,
    }
  })
}

function normalizeSlug(candidate: string) {
  const normalized = slugify(candidate)
  return normalized || `propiedad-${Date.now()}`
}

function buildUniqueSlug(existingSlugs: string[], candidate: string) {
  const baseSlug = normalizeSlug(candidate)
  const usedSlugs = new Set(existingSlugs)

  let nextSlug = baseSlug
  let suffix = 2

  while (usedSlugs.has(nextSlug)) {
    nextSlug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return nextSlug
}

const propertySelect = `
  id,
  agency_id,
  title,
  internal_code,
  operation,
  property_type,
  price_amount,
  currency,
  status,
  show_price,
  address,
  city,
  neighborhood,
  location_mode,
  bedrooms,
  bathrooms,
  covered_area,
  total_area,
  description,
  slug,
  meta_title,
  meta_description,
  created_at,
  updated_at
`

const getAllPropertiesForAgency = cache(async (agencyId: string): Promise<PropertyListItem[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select(propertySelect)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })

  assertNoSupabaseError(error, 'No se pudieron cargar las propiedades')

  return (data ?? []).map((row) => mapPropertyRow(row as PropertyRow))
})

const getPublishedPropertiesForAgency = cache(
  async (agencyId: string): Promise<PropertyListItem[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(propertySelect)
      .eq('agency_id', agencyId)
      .eq('status', 'publicada')
      .order('created_at', { ascending: false })

    assertNoSupabaseError(error, 'No se pudieron cargar las propiedades publicadas')

    return (data ?? []).map((row) => mapPropertyRow(row as PropertyRow))
  },
)

async function getPropertyUniquenessRows(agencyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('id, internal_code, slug')
    .eq('agency_id', agencyId)

  assertNoSupabaseError(error, 'No pudimos validar la unicidad de la propiedad')

  return (data ?? []) as PropertyUniquenessRow[]
}

function buildPropertyMutationPayload(
  values: PropertyFormValues,
  internalCode: string,
  finalSlug: string,
) {
  return {
    title: values.title,
    internal_code: internalCode,
    operation: values.operation,
    property_type: values.propertyType,
    price_amount: values.price,
    currency: values.currency,
    status: values.status,
    show_price: values.showPrice,
    address: values.address,
    city: values.city,
    neighborhood: values.neighborhood ?? null,
    location_mode: values.locationMode,
    bedrooms: values.bedrooms ?? null,
    bathrooms: values.bathrooms ?? null,
    covered_area: values.coveredArea ?? null,
    total_area: values.totalArea ?? null,
    description: values.description ?? null,
    slug: finalSlug,
    meta_title: values.metaTitle ?? null,
    meta_description: values.metaDescription ?? null,
  }
}

async function insertProperty(values: Record<string, unknown>) {
  const supabase = await createClient()
  return supabase
    .from('properties')
    .insert(values)
    .select('id, slug')
    .single()
}

async function updatePropertyRecord(
  agencyId: string,
  propertyId: string,
  values: Record<string, unknown>,
) {
  const supabase = await createClient()
  return supabase
    .from('properties')
    .update(values)
    .eq('agency_id', agencyId)
    .eq('id', propertyId)
    .select('id, slug')
    .single()
}

export async function getProperties(agencyId: string, limit?: number) {
  const safeLimit = typeof limit === 'number' && limit > 0 ? Math.floor(limit) : undefined
  const properties = await getAllPropertiesForAgency(agencyId)
  const resolvedProperties = safeLimit ? properties.slice(0, safeLimit) : properties

  return attachPropertyMediaPreview(agencyId, resolvedProperties)
}

export async function getPropertyCount(agencyId: string) {
  const properties = await getAllPropertiesForAgency(agencyId)
  return properties.length
}

export async function getPropertyById(agencyId: string, propertyId: string) {
  const properties = await getAllPropertiesForAgency(agencyId)
  const property = properties.find((item) => item.id === propertyId)

  if (!property) {
    return null
  }

  const [resolvedProperty] = await attachPropertyMediaPreview(agencyId, [property])
  return resolvedProperty ?? null
}

export async function getPublishedProperties(
  agencyId: string,
  { operation, query, limit }: PublishedPropertyFilters = {},
) {
  let properties = await getPublishedPropertiesForAgency(agencyId)

  if (operation) {
    properties = properties.filter((property) => property.operation === operation)
  }

  if (query?.trim()) {
    const normalizedQuery = query.trim().toLowerCase()

    properties = properties.filter((property) =>
      [
        property.title,
        property.internalCode,
        property.address,
        property.city,
        property.neighborhood ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }

  if (typeof limit === 'number' && limit > 0) {
    return attachPropertyMediaPreview(agencyId, properties.slice(0, Math.floor(limit)))
  }

  return attachPropertyMediaPreview(agencyId, properties)
}

export async function getPublishedPropertyBySlug(agencyId: string, slug: string) {
  const properties = await getPublishedPropertiesForAgency(agencyId)
  const property = properties.find((item) => item.slug === slug)

  if (!property) {
    return undefined
  }

  const [resolvedProperty] = await attachPropertyMediaPreview(agencyId, [property])
  return resolvedProperty
}

export async function getPropertyDashboardStats(
  agencyId: string,
): Promise<PropertyDashboardStats> {
  const properties = await getAllPropertiesForAgency(agencyId)

  return properties.reduce<PropertyDashboardStats>(
    (stats, property) => {
      stats.total += 1

      switch (property.status) {
        case 'publicada':
          stats.published += 1
          break
        case 'borrador':
          stats.draft += 1
          break
        case 'reservada':
          stats.reserved += 1
          break
        case 'vendida':
          stats.sold += 1
          break
        case 'alquilada':
          stats.rented += 1
          break
      }

      return stats
    },
    {
      total: 0,
      published: 0,
      draft: 0,
      reserved: 0,
      sold: 0,
      rented: 0,
    },
  )
}

export async function getRecentPropertyActivity(
  agencyId: string,
  limit = 4,
): Promise<PropertyActivityItem[]> {
  const safeLimit = Math.max(1, Math.floor(limit))
  const properties = await getAllPropertiesForAgency(agencyId)

  return properties.slice(0, safeLimit).map((property) => ({
    id: property.id,
    title: property.title,
    status: property.status,
    createdAt: property.createdAt,
    internalCode: property.internalCode,
  }))
}

export async function createProperty(agencyId: string, values: PropertyFormValues) {
  const internalCode = values.internalCode.trim().toUpperCase()
  const uniquenessRows = await getPropertyUniquenessRows(agencyId)
  const existingCodes = new Set(
    uniquenessRows.map((row) => row.internal_code.trim().toUpperCase()),
  )

  if (existingCodes.has(internalCode)) {
    return {
      ok: false as const,
      fieldErrors: {
        internalCode: 'Ya existe una propiedad con ese código interno dentro de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  const slugCandidate = values.slug || values.title
  const requestedSlug = normalizeSlug(slugCandidate)
  const existingSlugs = uniquenessRows.map((row) => row.slug)
  const slugExists = existingSlugs.includes(requestedSlug)

  if (slugExists && values.slug) {
    return {
      ok: false as const,
      fieldErrors: {
        slug: 'Ese slug ya está en uso para otra propiedad de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  let finalSlug = slugExists ? buildUniqueSlug(existingSlugs, requestedSlug) : requestedSlug
  const insertPayload = {
    agency_id: agencyId,
    ...buildPropertyMutationPayload(values, internalCode, finalSlug),
  }

  let { data, error } = await insertProperty(insertPayload)

  if (isSupabaseDuplicateError(error, 'properties_agency_id_internal_code_key')) {
    return {
      ok: false as const,
      fieldErrors: {
        internalCode: 'Ya existe una propiedad con ese código interno dentro de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  if (isSupabaseDuplicateError(error, 'properties_agency_id_slug_key')) {
    if (values.slug) {
      return {
        ok: false as const,
        fieldErrors: {
          slug: 'Ese slug ya está en uso para otra propiedad de esta agencia.',
        },
        message: 'Revisá los campos marcados antes de guardar.',
      }
    }

    finalSlug = buildUniqueSlug([...existingSlugs, finalSlug], requestedSlug)
    ;({ data, error } = await insertProperty({
      ...insertPayload,
      slug: finalSlug,
    }))
  }

  assertNoSupabaseError(error, 'No pudimos guardar la propiedad')

  return {
    ok: true as const,
    propertyId: requireSupabaseData(
      data as { id: string; slug: string } | null,
      'Supabase no devolvió la propiedad creada.',
    ).id,
    slug: requireSupabaseData(
      data as { id: string; slug: string } | null,
      'Supabase no devolvió la propiedad creada.',
    ).slug,
  }
}

export async function updateProperty(
  agencyId: string,
  propertyId: string,
  values: PropertyFormValues,
) {
  const currentProperty = await getPropertyById(agencyId, propertyId)

  if (!currentProperty) {
    return {
      ok: false as const,
      message: 'La propiedad que intentás editar ya no existe o no pertenece a la agencia activa.',
    }
  }

  const internalCode = values.internalCode.trim().toUpperCase()
  const uniquenessRows = (await getPropertyUniquenessRows(agencyId)).filter(
    (row) => row.id !== propertyId,
  )
  const existingCodes = new Set(
    uniquenessRows.map((row) => row.internal_code.trim().toUpperCase()),
  )

  if (existingCodes.has(internalCode)) {
    return {
      ok: false as const,
      fieldErrors: {
        internalCode: 'Ya existe una propiedad con ese código interno dentro de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  const slugCandidate = values.slug || values.title
  const requestedSlug = normalizeSlug(slugCandidate)
  const existingSlugs = uniquenessRows.map((row) => row.slug)
  const slugExists = existingSlugs.includes(requestedSlug)

  if (slugExists && values.slug) {
    return {
      ok: false as const,
      fieldErrors: {
        slug: 'Ese slug ya está en uso para otra propiedad de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  let finalSlug = slugExists ? buildUniqueSlug(existingSlugs, requestedSlug) : requestedSlug
  let { data, error } = await updatePropertyRecord(
    agencyId,
    propertyId,
    buildPropertyMutationPayload(values, internalCode, finalSlug),
  )

  if (isSupabaseDuplicateError(error, 'properties_agency_id_internal_code_key')) {
    return {
      ok: false as const,
      fieldErrors: {
        internalCode: 'Ya existe una propiedad con ese código interno dentro de esta agencia.',
      },
      message: 'Revisá los campos marcados antes de guardar.',
    }
  }

  if (isSupabaseDuplicateError(error, 'properties_agency_id_slug_key')) {
    if (values.slug) {
      return {
        ok: false as const,
        fieldErrors: {
          slug: 'Ese slug ya está en uso para otra propiedad de esta agencia.',
        },
        message: 'Revisá los campos marcados antes de guardar.',
      }
    }

    finalSlug = buildUniqueSlug([...existingSlugs, finalSlug], requestedSlug)
    ;({ data, error } = await updatePropertyRecord(
      agencyId,
      propertyId,
      buildPropertyMutationPayload(values, internalCode, finalSlug),
    ))
  }

  assertNoSupabaseError(error, 'No pudimos actualizar la propiedad')

  return {
    ok: true as const,
    propertyId: requireSupabaseData(
      data as { id: string; slug: string } | null,
      'Supabase no devolvió la propiedad actualizada.',
    ).id,
    slug: requireSupabaseData(
      data as { id: string; slug: string } | null,
      'Supabase no devolvió la propiedad actualizada.',
    ).slug,
  }
}
