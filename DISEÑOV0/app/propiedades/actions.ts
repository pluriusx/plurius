'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentAgency } from '@/lib/agencies'
import {
  preparePropertyCustomFieldValues,
  replacePropertyCustomFieldValues,
} from '@/lib/custom-fields/repository'
import {
  assertPropertyMediaReady,
  preparePropertyMediaItems,
  replacePropertyMedia,
} from '@/lib/property-media/repository'
import type { PropertyMediaFormItem } from '@/lib/property-media/schema'
import { createProperty, updateProperty } from '@/lib/properties/repository'
import {
  type PropertyFormValues,
  propertyFormSchema,
} from '@/lib/properties/schema'

export interface PropertySubmissionValues extends PropertyFormValues {
  customFieldValues?: Record<string, unknown>
  mediaItems?: PropertyMediaFormItem[]
}

export interface PropertyActionState {
  ok: boolean
  message: string
  fieldErrors?: Partial<Record<keyof PropertyFormValues, string>>
  customFieldErrors?: Record<string, string>
  mediaErrors?: Record<string, string>
}

function buildValidationState(
  fieldErrors: Partial<Record<keyof PropertyFormValues, string>>,
): PropertyActionState {
  return {
    ok: false,
    message: 'Completá los datos obligatorios para guardar la propiedad.',
    fieldErrors,
  }
}

export async function createPropertyAction(
  input: PropertySubmissionValues,
): Promise<PropertyActionState> {
  const parsed = propertyFormSchema.safeParse(input)

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors

    return buildValidationState(
      Object.fromEntries(
        Object.entries(flattened).map(([key, value]) => [key, value?.[0] ?? 'Campo inválido']),
      ) as Partial<Record<keyof PropertyFormValues, string>>,
    )
  }

  try {
    const agency = await getCurrentAgency()
    const customFieldsResult = await preparePropertyCustomFieldValues(
      agency.id,
      input.customFieldValues,
    )
    const mediaResult = preparePropertyMediaItems(input.mediaItems)

    if (!customFieldsResult.ok) {
      return {
        ok: false,
        message: 'Revisá los campos personalizados antes de guardar la propiedad.',
        customFieldErrors: customFieldsResult.fieldErrors,
      }
    }

    if (!mediaResult.ok) {
      return {
        ok: false,
        message: 'Revisá la galería antes de guardar la propiedad.',
        mediaErrors: mediaResult.fieldErrors,
      }
    }

    if (mediaResult.items.length > 0) {
      await assertPropertyMediaReady()
    }

    const result = await createProperty(agency.id, parsed.data)

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        fieldErrors: result.fieldErrors,
      }
    }

    await replacePropertyCustomFieldValues(agency.id, result.propertyId, customFieldsResult.rows)
    await replacePropertyMedia(agency.id, result.propertyId, mediaResult.items)

    revalidatePath('/')
    revalidatePath('/propiedades')
    revalidatePath(`/portal/${agency.slug}`)
    revalidatePath(`/portal/${agency.slug}/propiedades`)
    revalidatePath(`/portal/${agency.slug}/propiedades/${result.slug}`)

    return {
      ok: true,
      message: 'La propiedad se guardó correctamente.',
    }
  } catch (error) {
    console.error('Error creating property', error)

    return {
      ok: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos guardar la propiedad. Volvé a intentarlo.',
    }
  }
}

export async function updatePropertyAction(
  propertyId: string,
  input: PropertySubmissionValues,
): Promise<PropertyActionState> {
  const parsed = propertyFormSchema.safeParse(input)

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors

    return buildValidationState(
      Object.fromEntries(
        Object.entries(flattened).map(([key, value]) => [key, value?.[0] ?? 'Campo inválido']),
      ) as Partial<Record<keyof PropertyFormValues, string>>,
    )
  }

  try {
    const agency = await getCurrentAgency()
    const customFieldsResult = await preparePropertyCustomFieldValues(
      agency.id,
      input.customFieldValues,
    )
    const mediaResult = preparePropertyMediaItems(input.mediaItems)

    if (!customFieldsResult.ok) {
      return {
        ok: false,
        message: 'Revisá los campos personalizados antes de guardar la propiedad.',
        customFieldErrors: customFieldsResult.fieldErrors,
      }
    }

    if (!mediaResult.ok) {
      return {
        ok: false,
        message: 'Revisá la galería antes de guardar la propiedad.',
        mediaErrors: mediaResult.fieldErrors,
      }
    }

    if (mediaResult.items.length > 0) {
      await assertPropertyMediaReady()
    }

    const result = await updateProperty(agency.id, propertyId, parsed.data)

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        fieldErrors: result.fieldErrors,
      }
    }

    await replacePropertyCustomFieldValues(agency.id, propertyId, customFieldsResult.rows)
    await replacePropertyMedia(agency.id, propertyId, mediaResult.items)

    revalidatePath('/')
    revalidatePath('/propiedades')
    revalidatePath(`/propiedades/${propertyId}`)
    revalidatePath(`/portal/${agency.slug}`)
    revalidatePath(`/portal/${agency.slug}/propiedades`)
    revalidatePath(`/portal/${agency.slug}/propiedades/${result.slug}`)

    return {
      ok: true,
      message: 'La propiedad se actualizó correctamente.',
    }
  } catch (error) {
    console.error('Error updating property', error)

    return {
      ok: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos guardar los cambios. Volvé a intentarlo.',
    }
  }
}
