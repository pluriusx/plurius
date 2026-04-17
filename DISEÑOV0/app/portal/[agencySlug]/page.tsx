import { notFound } from 'next/navigation'

import { PublicPortalHome } from '@/components/website/public-portal-home'
import { getPublishedProperties } from '@/lib/properties/repository'
import { getPortalContext } from '@/lib/website/portal'

export const dynamic = 'force-dynamic'

export default async function PortalHome({
  params,
}: {
  params: Promise<{ agencySlug: string }>
}) {
  const { agencySlug } = await params
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const publishedProperties = await getPublishedProperties(context.agency.id)

  return (
    <PublicPortalHome
      agencySlug={context.agency.slug}
      agencyName={context.agency.name}
      settings={context.settings}
      publishedProperties={publishedProperties}
    />
  )
}
