import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { PublicSiteShell } from '@/components/website/public-site-shell'
import { getPortalContext } from '@/lib/website/portal'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode
  params: Promise<{ agencySlug: string }>
}>) {
  const { agencySlug } = await params
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  return (
    <PublicSiteShell agency={context.agency} settings={context.settings}>
      {children}
    </PublicSiteShell>
  )
}
