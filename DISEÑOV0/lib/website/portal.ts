import 'server-only'

import { cache } from 'react'

import { getAgencyBySlug } from '@/lib/agencies'
import { getWebsiteSettings } from '@/lib/website/repository'

export const getPortalContext = cache(async function getPortalContext(agencySlug: string) {
  const agency = await getAgencyBySlug(agencySlug)

  if (!agency) {
    return null
  }

  const settings = await getWebsiteSettings(agency)

  return {
    agency,
    settings,
  }
})
