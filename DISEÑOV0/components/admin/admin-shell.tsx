import type { ReactNode } from 'react'

import { Sidebar } from '@/components/sidebar'
import { Topbar, type TopbarAction } from '@/components/topbar'

interface AdminShellProps {
  title: string
  description: string
  action?: TopbarAction
  children: ReactNode
}

export function AdminShell({
  title,
  description,
  action,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#ECEEF1]">
      <Sidebar />
      <Topbar title={title} description={description} action={action} />

      <main className="px-4 pt-[96px] pb-8 md:pl-[268px] md:pr-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">{children}</div>
      </main>
    </div>
  )
}
