'use client'

import { Bell, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export interface TopbarAction {
  label: string
  href: string
}

interface TopbarProps {
  title: string
  description: string
  action?: TopbarAction
}

const todayLabel = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export function Topbar({ title, description, action }: TopbarProps) {
  return (
    <div className="fixed top-4 right-4 left-4 z-20 md:left-[268px] md:right-6">
      <header
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6"
        style={{
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <h1 className="text-[15px] font-semibold leading-none text-[#0F1117]">{title}</h1>
          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-8 items-center gap-2 rounded-xl bg-[#F3F4F6] px-3 text-[13px] text-[#9CA3AF] transition-colors hover:bg-[#ECEEF1]">
            <Search size={13} />
            <span className="hidden lg:block">Buscar propiedades o consultas</span>
          </button>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#6B7280] transition-colors hover:bg-[#ECEEF1]">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#0891B2]" />
          </button>

          <div className="hidden rounded-xl bg-[#F8FAFC] px-3 py-2 text-right lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Hoy
            </p>
            <p className="text-[11px] text-[#6B7280]">{todayLabel}</p>
          </div>

          {action ? (
            <Link
              href={action.href}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0891B2] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">{action.label}</span>
            </Link>
          ) : null}
        </div>
      </header>
    </div>
  )
}
