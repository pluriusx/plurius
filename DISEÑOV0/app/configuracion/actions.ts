'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAgency } from '@/lib/agencies'
import { updateWebsiteBranding } from '@/lib/website/repository'
import { websiteBrandingFormSchema } from '@/lib/website/schema'

export async function saveWebsiteBrandingAction(formData: FormData) {
  const agency = await getCurrentAgency()
  const parsed = websiteBrandingFormSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    redirect('/configuracion?error=1')
  }

  await updateWebsiteBranding(agency, parsed.data)

  revalidatePath('/configuracion')
  revalidatePath(`/portal/${agency.slug}`, 'layout')
  redirect('/configuracion?saved=1')
}
