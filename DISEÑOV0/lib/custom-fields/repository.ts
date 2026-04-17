import 'server-only'

import { cache } from 'react'

import type {
  CustomFieldDefinition,
  CustomFieldFormValues,
  CustomFieldStoredValue,
  CustomFieldType,
} from '@/lib/custom-fields/schema'
import {
  parseCustomFieldOptions,
  slugifyCustomField,
} from '@/lib/custom-fields/schema'
import {
  assertNoSupabaseError,
  isSupabaseDuplicateError,
  requireSupabaseData,
} from '@/lib/supabase/repository'
import { createClient } from '@/utils/supabase/server'

interface CustomFieldRow {
  id: string
  agency_id: string
  name: string
  slug: string
  field_type: CustomFieldType
  options: string[] | null
  show_in_public: boolean | number
  is_required: boolean | number
  sort_order: number
  created_at: string
  updated_at: string
}

interface PropertyCustomFieldValueRow {
  custom_field_id: string
  value: CustomFieldStoredValue | null
}

interface PreparedPropertyCustomFieldValueRow {
  customFieldId: string
  value: CustomFieldStoredValue
}

function isMissingRelationError(error: { code?: string; message: string } | null) {
  if (!error) {
    return false
  }

  if (error.code === '42P01' || error.code === 'PGRST205') {
    return true
  }

  const normalizedMessage = error.message.toLowerCase()
  const mentionsCustomFieldRelations =
    normalizedMessage.includes('custom_property_fields') ||
    normalizedMessage.includes('property_custom_field_values')

  return (
    mentionsCustomFieldRelations &&
    (
      normalizedMessage.includes('could not find the table') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('does not exist')
    )
  )
}

function mapCustomFieldRow(row: CustomFieldRow): CustomFieldDefinition {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    fieldType: row.field_type,
    options: Array.isArray(row.options) ? row.options.filter((item) => typeof item === 'string') : [],
    showInPublic: Boolean(row.show_in_public),
    isRequired: Boolean(row.is_required),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeSingleValue(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function normalizeBooleanValue(value: unknown) {
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true
  }

  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false
  }

  return undefined
}

function normalizeNumberValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return undefined
    }

    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

function normalizeMultiSelectValue(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

function buildUniqueSlug(existingSlugs: string[], value: string) {
  const base = slugifyCustomField(value) || `campo-${Date.now()}`
  const used = new Set(existingSlugs)

  let next = base
  let suffix = 2

  while (used.has(next)) {
    next = `${base}-${suffix}`
    suffix += 1
  }

  return next
}

const getCustomFieldsForAgency = cache(async (agencyId: string): Promise<CustomFieldDefinition[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_property_fields')
    .select('*')
    .eq('agency_id', agencyId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (isMissingRelationError(error)) {
    return []
  }

  assertNoSupabaseError(error, 'No se pudieron cargar los campos personalizados')

  return (data ?? []).map((row) => mapCustomFieldRow(row as CustomFieldRow))
})

export function getCustomFields(agencyId: string) {
  return getCustomFieldsForAgency(agencyId)
}

export async function createCustomField(agencyId: string, values: CustomFieldFormValues) {
  const customFields = await getCustomFieldsForAgency(agencyId)
  const nextSortOrder =
    customFields.length > 0
      ? Math.max(...customFields.map((field) => field.sortOrder)) + 1
      : 1
  const slug = buildUniqueSlug(
    customFields.map((field) => field.slug),
    values.name,
  )
  const options = parseCustomFieldOptions(values.optionsBody)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_property_fields')
    .insert({
      agency_id: agencyId,
      name: values.name,
      slug,
      field_type: values.fieldType,
      options: options.length > 0 ? options : null,
      show_in_public: values.showInPublic,
      is_required: values.isRequired,
      sort_order: nextSortOrder,
    })
    .select('id')
    .single()

  if (isMissingRelationError(error)) {
    throw new Error(
      'La tabla de campos personalizados todavia no existe. Aplicá la nueva migracion antes de usar esta pantalla.',
    )
  }

  if (isSupabaseDuplicateError(error, 'custom_property_fields_agency_id_slug_key')) {
    throw new Error('Ya existe un campo personalizado con ese nombre dentro de esta agencia.')
  }

  assertNoSupabaseError(error, 'No se pudo crear el campo personalizado')

  return requireSupabaseData(
    data as { id: string } | null,
    'Supabase no devolvió el campo personalizado recién creado.',
  ).id
}

export async function deleteCustomField(agencyId: string, fieldId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_property_fields')
    .delete()
    .eq('agency_id', agencyId)
    .eq('id', fieldId)
    .select('id')
    .maybeSingle()

  if (isMissingRelationError(error)) {
    throw new Error(
      'La tabla de campos personalizados todavia no existe. Aplicá la nueva migracion antes de usar esta pantalla.',
    )
  }

  assertNoSupabaseError(error, 'No se pudo eliminar el campo personalizado')

  return requireSupabaseData(
    data as { id: string } | null,
    'El campo personalizado que intentás eliminar ya no existe o no pertenece a la agencia activa.',
  ).id
}

export async function getPropertyCustomFieldValues(agencyId: string, propertyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('property_custom_field_values')
    .select('custom_field_id, value')
    .eq('agency_id', agencyId)
    .eq('property_id', propertyId)

  if (isMissingRelationError(error)) {
    return {} as Record<string, CustomFieldStoredValue>
  }

  assertNoSupabaseError(error, 'No se pudieron cargar los valores de campos personalizados')

  return (data ?? []).reduce<Record<string, CustomFieldStoredValue>>((accumulator, row) => {
    const typedRow = row as PropertyCustomFieldValueRow

    if (typedRow.value !== null) {
      accumulator[typedRow.custom_field_id] = typedRow.value
    }

    return accumulator
  }, {})
}

export async function preparePropertyCustomFieldValues(
  agencyId: string,
  rawValues: Record<string, unknown> | undefined,
) {
  const definitions = await getCustomFieldsForAgency(agencyId)

  if (definitions.length === 0) {
    return {
      ok: true as const,
      rows: [] as PreparedPropertyCustomFieldValueRow[],
    }
  }

  const safeValues = rawValues ?? {}
  const rows: PreparedPropertyCustomFieldValueRow[] = []
  const fieldErrors: Record<string, string> = {}

  for (const field of definitions) {
    const rawValue = safeValues[field.id]

    switch (field.fieldType) {
      case 'short_text':
      case 'long_text':
      case 'url':
      case 'single_select': {
        const value = normalizeSingleValue(rawValue)

        if (field.isRequired && !value) {
          fieldErrors[field.id] = 'Completá este campo para guardar la propiedad.'
          continue
        }

        if (!value) {
          continue
        }

        if (field.fieldType === 'url') {
          try {
            new URL(value)
          } catch {
            fieldErrors[field.id] = 'Ingresá una URL válida.'
            continue
          }
        }

        if (field.fieldType === 'single_select' && !field.options.includes(value)) {
          fieldErrors[field.id] = 'Elegí una opción válida para este campo.'
          continue
        }

        rows.push({
          customFieldId: field.id,
          value,
        })
        continue
      }
      case 'number': {
        const value = normalizeNumberValue(rawValue)

        if (field.isRequired && value === undefined) {
          fieldErrors[field.id] = 'Completá este campo para guardar la propiedad.'
          continue
        }

        if (value === undefined) {
          continue
        }

        rows.push({
          customFieldId: field.id,
          value,
        })
        continue
      }
      case 'boolean': {
        const value = normalizeBooleanValue(rawValue)

        if (field.isRequired && value === undefined) {
          fieldErrors[field.id] = 'Elegí Sí o No para este campo.'
          continue
        }

        if (value === undefined) {
          continue
        }

        rows.push({
          customFieldId: field.id,
          value,
        })
        continue
      }
      case 'multi_select': {
        const value = normalizeMultiSelectValue(rawValue).filter((item) => field.options.includes(item))

        if (field.isRequired && value.length === 0) {
          fieldErrors[field.id] = 'Elegí al menos una opción para este campo.'
          continue
        }

        if (value.length === 0) {
          continue
        }

        rows.push({
          customFieldId: field.id,
          value,
        })
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false as const,
      fieldErrors,
    }
  }

  return {
    ok: true as const,
    rows,
  }
}

export async function replacePropertyCustomFieldValues(
  agencyId: string,
  propertyId: string,
  rows: PreparedPropertyCustomFieldValueRow[],
) {
  const definitions = await getCustomFieldsForAgency(agencyId)

  if (definitions.length === 0) {
    return
  }

  const supabase = await createClient()
  const nextFieldIds = new Set(rows.map((row) => row.customFieldId))
  const removableFieldIds = definitions
    .map((field) => field.id)
    .filter((fieldId) => !nextFieldIds.has(fieldId))

  if (removableFieldIds.length > 0) {
    const { error } = await supabase
      .from('property_custom_field_values')
      .delete()
      .eq('agency_id', agencyId)
      .eq('property_id', propertyId)
      .in('custom_field_id', removableFieldIds)

    if (!isMissingRelationError(error)) {
      assertNoSupabaseError(error, 'No se pudieron limpiar los campos personalizados removidos')
    }
  }

  if (rows.length === 0) {
    return
  }

  const { error } = await supabase.from('property_custom_field_values').upsert(
    rows.map((row) => ({
      agency_id: agencyId,
      property_id: propertyId,
      custom_field_id: row.customFieldId,
      value: row.value,
      updated_at: new Date().toISOString(),
    })),
    {
      onConflict: 'property_id,custom_field_id',
    },
  )

  if (isMissingRelationError(error)) {
    return
  }

  assertNoSupabaseError(error, 'No se pudieron guardar los campos personalizados de la propiedad')
}
