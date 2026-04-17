'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentAgency } from '@/lib/agencies'
import { updateInquiryStatus } from '@/lib/website/repository'

const inquiryStatusValues = ['nueva', 'leida', 'respondida'] as const

function isInquiryStatus(value: string): value is (typeof inquiryStatusValues)[number] {
  return inquiryStatusValues.includes(value as (typeof inquiryStatusValues)[number])
}

export async function updateInquiryStatusAction(formData: FormData) {
  const inquiryId = formData.get('inquiryId')
  const status = formData.get('status')

  if (typeof inquiryId !== 'string' || typeof status !== 'string' || !isInquiryStatus(status)) {
    return
  }

  const agency = await getCurrentAgency()
  await updateInquiryStatus(agency.id, inquiryId, status)
  revalidatePath('/consultas')
}
