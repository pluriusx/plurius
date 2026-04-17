import { WebsiteBuilder } from '@/components/website/website-builder'
import { getCurrentAgency } from '@/lib/agencies'
import { getWebsiteSettings } from '@/lib/website/repository'

import { saveWebsiteContentAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function WebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const params = await searchParams
  const agency = await getCurrentAgency()
  const settings = await getWebsiteSettings(agency)

  return (
    <WebsiteBuilder
      agencyName={agency.name}
      agencySlug={agency.slug}
      settings={settings}
      saveAction={saveWebsiteContentAction}
      saved={params.saved === '1'}
      error={params.error === '1'}
    />
  )
}
