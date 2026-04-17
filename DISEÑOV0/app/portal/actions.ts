'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getAgencyBySlug } from '@/lib/agencies'
import { createInquiry } from '@/lib/website/repository'
import { publicInquiryFormSchema } from '@/lib/website/schema'
import { appendQueryParam } from '@/lib/website/utils'

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function getSafeReturnPath(agencySlug: string, value: string) {
  const fallbackPath = `/portal/${agencySlug}/contacto`

  if (!value.startsWith(`/portal/${agencySlug}`)) {
    return fallbackPath
  }

  return value
}

export async function submitInquiryAction(formData: FormData) {
  const agencySlug = readText(formData, 'agencySlug').trim().toLowerCase()

  if (!agencySlug) {
    redirect('/')
  }

  const agency = await getAgencyBySlug(agencySlug)

  if (!agency) {
    redirect('/')
  }

  const returnPath = getSafeReturnPath(agency.slug, readText(formData, 'returnPath').trim())
  const parsed = publicInquiryFormSchema.safeParse({
    fullName: readText(formData, 'fullName'),
    email: readText(formData, 'email'),
    phone: readText(formData, 'phone'),
    message: readText(formData, 'message'),
    propertyId: readText(formData, 'propertyId'),
    source: readText(formData, 'source'),
    pagePath: readText(formData, 'pagePath'),
  })

  if (!parsed.success) {
    redirect(appendQueryParam(returnPath, 'error', '1'))
  }

  await createInquiry(agency.id, parsed.data)

  revalidatePath('/consultas')
  redirect(appendQueryParam(returnPath, 'sent', '1'))
}
