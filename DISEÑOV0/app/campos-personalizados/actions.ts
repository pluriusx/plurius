'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAgency } from '@/lib/agencies'
import {
  createCustomField,
  deleteCustomField,
} from '@/lib/custom-fields/repository'
import { customFieldFormSchema } from '@/lib/custom-fields/schema'

function revalidateCustomFieldDependencies() {
  revalidatePath('/campos-personalizados')
  revalidatePath('/propiedades')
  revalidatePath('/propiedades/nueva')
  revalidatePath('/propiedades/[propertyId]', 'page')
  revalidatePath('/portal/[agencySlug]/propiedades/[slug]', 'page')
}

export async function createCustomFieldAction(formData: FormData) {
  const parsed = customFieldFormSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    redirect('/campos-personalizados?error=1')
  }

  try {
    const agency = await getCurrentAgency()
    await createCustomField(agency.id, parsed.data)
    revalidateCustomFieldDependencies()
    redirect('/campos-personalizados?saved=1')
  } catch (error) {
    console.error('Error creating custom field', error)
    redirect('/campos-personalizados?error=1')
  }
}

export async function deleteCustomFieldAction(formData: FormData) {
  const fieldId = formData.get('fieldId')

  if (typeof fieldId !== 'string' || !fieldId) {
    redirect('/campos-personalizados?error=1')
  }

  try {
    const agency = await getCurrentAgency()
    await deleteCustomField(agency.id, fieldId)
    revalidateCustomFieldDependencies()
    redirect('/campos-personalizados?removed=1')
  } catch (error) {
    console.error('Error deleting custom field', error)
    redirect('/campos-personalizados?error=1')
  }
}
