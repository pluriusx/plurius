import type { ReactNode } from 'react'

import { Sidebar } from '@/components/sidebar'
import { Topbar, type TopbarAction } from '@/components/topbar'

interface VariantDescriptions {
  editorial: string
  cinematic: string
}

interface AdminShellProps {
  title: string
  description: string
  action?: TopbarAction
  showVariantToggle?: boolean
  variantDescriptions?: VariantDescriptions
  children: ReactNode
}

export function AdminShell({
  title,
  description,
  action,
  showVariantToggle = false,
  variantDescriptions,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <Sidebar />
      <Topbar
        title={title}
        description={description}
        action={action}
        showVariantToggle={showVariantToggle}
        variantDescriptions={variantDescriptions}
      />

      <main className="px-3 pt-[166px] pb-24 sm:px-4 md:px-5 md:pt-[156px] lg:pr-4 lg:pl-[276px] lg:pt-[112px] lg:pb-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:gap-4">{children}</div>
      </main>
    </div>
  )
}
