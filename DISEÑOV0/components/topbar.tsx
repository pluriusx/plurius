'use client'

import { Bell, Grid2X2, Moon, Plus, Search, Sun } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  ADMIN_UI_EVENT,
  applyAdminTheme,
  readStoredAdminTheme,
  readStoredAdminVariant,
  storeAdminTheme,
  storeAdminVariant,
  type AdminTheme,
  type AdminVariant,
} from '@/lib/admin-ui'

export interface TopbarAction {
  label: string
  href: string
}

interface VariantDescriptions {
  editorial: string
  cinematic: string
}

interface TopbarProps {
  title: string
  description: string
  action?: TopbarAction
  showVariantToggle?: boolean
  variantDescriptions?: VariantDescriptions
}

const todayLabel = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

export function Topbar({
  title,
  description,
  action,
  showVariantToggle = false,
  variantDescriptions,
}: TopbarProps) {
  const [theme, setTheme] = useState<AdminTheme>('light')
  const [variant, setVariant] = useState<AdminVariant>('editorial')

  useEffect(() => {
    const storedTheme = readStoredAdminTheme()
    const storedVariant = readStoredAdminVariant()
    setTheme(storedTheme)
    setVariant(storedVariant)
    applyAdminTheme(storedTheme)

    const onUiChange = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<{ theme: AdminTheme; variant: AdminVariant }>>

      if (customEvent.detail.theme) {
        setTheme(customEvent.detail.theme)
      }

      if (customEvent.detail.variant) {
        setVariant(customEvent.detail.variant)
      }
    }

    window.addEventListener(ADMIN_UI_EVENT, onUiChange as EventListener)
    return () => window.removeEventListener(ADMIN_UI_EVENT, onUiChange as EventListener)
  }, [])

  const resolvedDescription =
    showVariantToggle && variantDescriptions ? variantDescriptions[variant] : description

  const nextTheme: AdminTheme = theme === 'light' ? 'dark' : 'light'
  const nextVariant: AdminVariant = variant === 'editorial' ? 'cinematic' : 'editorial'

  return (
    <div className="fixed top-3 right-3 left-3 z-20 lg:top-4 lg:right-4 lg:left-[276px]">
      <header
        className="mx-auto w-full max-w-[1440px] px-4 py-4 lg:px-6 lg:py-4"
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[var(--ink)] lg:text-[16px]">
                {title}
              </h1>
              <p className="mt-1 max-w-[32ch] text-[13px] leading-5 text-[var(--ink-3)] lg:max-w-none lg:text-[12px]">
                {resolvedDescription}
              </p>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => storeAdminTheme(nextTheme)}
                className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-3)]"
                title={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <button className="relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-3)]">
                <Bell size={16} />
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[var(--accent)]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
            <button className="flex h-11 w-full items-center gap-3 rounded-[14px] bg-[var(--surface-2)] px-4 text-[14px] text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-3)] sm:flex-1 lg:h-[36px] lg:w-auto lg:min-w-[240px] lg:flex-none lg:rounded-[12px] lg:px-4 lg:text-[12.5px]">
              <Search size={16} />
              <span>Buscar propiedades o consultas</span>
              <span className="ml-auto hidden rounded-[8px] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--ink-3)] shadow-sm lg:inline-flex">
                ⌘ K
              </span>
            </button>

            {showVariantToggle ? (
              <button
                onClick={() => storeAdminVariant(nextVariant)}
                className="hidden h-[36px] items-center gap-1.5 rounded-[12px] bg-[var(--surface-3)] px-3 text-[10.5px] font-semibold tracking-[0.08em] text-[var(--ink-2)] uppercase transition-colors hover:bg-[var(--surface-2)] lg:inline-flex"
                title="Cambiar variante visual del dashboard"
              >
                <Grid2X2 size={11} />
                {variant}
              </button>
            ) : null}

            <div className="hidden items-center gap-2 lg:flex">
              <button
                onClick={() => storeAdminTheme(nextTheme)}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-3)]"
                title={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              <button className="relative flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[var(--surface-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-3)]">
                <Bell size={15} />
                <span className="absolute top-[9px] right-[9px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              </button>
            </div>

            {action ? (
              <Link
                href={action.href}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] hover:text-white sm:w-auto lg:h-[36px] lg:rounded-[12px] lg:px-4 lg:text-[13px]"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{action.label}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </header>
    </div>
  )
}
