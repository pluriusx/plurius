'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAgency } from '@/lib/agencies'
import { updateWebsiteContent } from '@/lib/website/repository'
import { websiteContentFormSchema } from '@/lib/website/schema'

export async function saveWebsiteContentAction(formData: FormData) {
  const agency = await getCurrentAgency()
  const parsed = websiteContentFormSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    redirect('/sitio-web?error=1')
  }

  await updateWebsiteContent(agency, parsed.data)

  revalidatePath('/sitio-web')
  revalidatePath(`/portal/${agency.slug}`, 'layout')
  redirect('/sitio-web?saved=1')
}
