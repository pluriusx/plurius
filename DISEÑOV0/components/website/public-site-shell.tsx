import type { CSSProperties, ReactNode } from 'react'

import Link from 'next/link'

import type { Agency } from '@/lib/agencies'
import type { WebsiteSettings } from '@/lib/website/repository'
import { buildWhatsAppUrl, hexToRgba } from '@/lib/website/utils'
import { cn } from '@/lib/utils'

interface PublicSiteShellProps {
  agency: Agency
  settings: WebsiteSettings
  children: ReactNode
}

export function PublicSiteShell({
  agency,
  settings,
  children,
}: PublicSiteShellProps) {
  const isNocturno = settings.themePreset === 'nocturno'
  const isEditorial = settings.themePreset === 'editorial'
  const operationLinks: Array<{ label: string; href: string }> = []

  if (settings.navigationMode === 'operaciones') {
    if (settings.showSaleLink) {
      operationLinks.push({
        label: 'En venta',
        href: `/portal/${agency.slug}/propiedades?operation=venta`,
      })
    }

    if (settings.showRentLink) {
      operationLinks.push({
        label: 'En alquiler',
        href: `/portal/${agency.slug}/propiedades?operation=alquiler_anual`,
      })
    }

    if (settings.showTemporaryLink) {
      operationLinks.push({
        label: 'Temporario',
        href: `/portal/${agency.slug}/propiedades?operation=alquiler_temporario`,
      })
    }
  }

  const navigationItems: Array<{ label: string; href: string }> = [
    { label: 'Inicio', href: `/portal/${agency.slug}` },
    { label: 'Propiedades', href: `/portal/${agency.slug}/propiedades` },
    ...operationLinks,
    { label: 'Servicios', href: `/portal/${agency.slug}/servicios` },
    { label: 'Nosotros', href: `/portal/${agency.slug}/nosotros` },
    { label: 'Contacto', href: `/portal/${agency.slug}/contacto` },
  ]
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappPhone,
    `Hola ${agency.name}, quiero hacer una consulta desde la web.`,
  )
  const cardThemeStyle: CSSProperties & Record<string, string | number> = {
    '--website-card-radius': isEditorial ? '24px' : '28px',
    '--website-card-bg': isNocturno ? '#0F172A' : isEditorial ? '#FFFCF7' : '#FFFFFF',
    '--website-card-text': isNocturno ? '#FFFFFF' : '#0F1117',
    '--website-card-border': isNocturno
      ? 'rgba(255,255,255,0.10)'
      : isEditorial
        ? 'rgba(15,17,23,0.10)'
        : 'rgba(15,17,23,0.08)',
    '--website-card-shadow': isNocturno
      ? '0 28px 60px rgba(2,6,23,0.45)'
      : isEditorial
        ? '0 14px 32px rgba(15,23,42,0.06)'
        : '0 16px 40px rgba(15,23,42,0.08)',
    '--website-card-hero-background':
      settings.themePreset === 'nocturno'
        ? `linear-gradient(135deg, ${hexToRgba(settings.primaryColor, 0.56)} 0%, ${hexToRgba(settings.accentColor, 0.76)} 100%)`
        : isEditorial
          ? `linear-gradient(135deg, ${hexToRgba(settings.primaryColor, 0.2)} 0%, ${hexToRgba(settings.accentColor, 0.14)} 64%, #F8FAFC 100%)`
          : `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
    '--website-card-hero-text': isEditorial ? '#111827' : '#FFFFFF',
    '--website-card-hero-badge-bg': isNocturno ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.90)',
    '--website-card-hero-badge-text': isNocturno ? '#FFFFFF' : '#111827',
    '--website-card-hero-badge-border': isNocturno ? 'rgba(255,255,255,0.10)' : 'transparent',
    '--website-card-hero-type-bg': isNocturno
      ? 'rgba(255,255,255,0.10)'
      : isEditorial
        ? 'rgba(255,255,255,0.75)'
        : 'rgba(255,255,255,0.10)',
    '--website-card-hero-type-text': isEditorial ? '#111827' : '#FFFFFF',
    '--website-card-hero-type-border': isEditorial
      ? 'rgba(15,23,42,0.05)'
      : 'rgba(255,255,255,0.20)',
    '--website-card-hero-overlay': isEditorial ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.10)',
    '--website-card-hero-code-text': isEditorial ? 'rgba(17,24,39,0.70)' : 'rgba(255,255,255,0.70)',
    '--website-card-stat-bg': isNocturno ? 'rgba(255,255,255,0.10)' : '#F8FAFC',
    '--website-card-stat-text': isNocturno ? 'rgba(255,255,255,0.90)' : '#475569',
    '--website-card-meta-text': isNocturno ? 'rgba(255,255,255,0.72)' : '#64748B',
    '--website-card-divider': isNocturno ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
  }
  const shellStyle: CSSProperties & Record<string, string | number> = {
    background:
      settings.themePreset === 'nocturno'
        ? `
          radial-gradient(circle at top left, ${hexToRgba(settings.primaryColor, 0.28)}, transparent 36%),
          radial-gradient(circle at top right, ${hexToRgba(settings.accentColor, 0.22)}, transparent 28%),
          linear-gradient(180deg, #08101F 0%, #0F172A 44%, #111827 100%)
        `
        : isEditorial
          ? `
            radial-gradient(circle at top left, ${hexToRgba(settings.primaryColor, 0.08)}, transparent 38%),
            radial-gradient(circle at top right, ${hexToRgba(settings.accentColor, 0.06)}, transparent 30%),
            linear-gradient(180deg, #FFFCF7 0%, #F7F4EE 36%, #F3F0E8 100%)
          `
          : `
            radial-gradient(circle at top left, ${hexToRgba(settings.primaryColor, 0.18)}, transparent 38%),
            radial-gradient(circle at top right, ${hexToRgba(settings.accentColor, 0.12)}, transparent 30%),
            linear-gradient(180deg, #F7F2E8 0%, #FBFCFD 26%, #FFFFFF 100%)
          `,
    ...cardThemeStyle,
  }

  return (
    <div
      className={cn('relative min-h-screen overflow-hidden', isNocturno ? 'text-white' : 'text-[#0F1117]')}
      style={shellStyle}
    >
        <header
          className={cn(
            'sticky top-0 z-30 border-b backdrop-blur-xl',
            isNocturno
              ? 'border-white/10 bg-[#08101F]/90'
              : isEditorial
                ? 'border-black/10 bg-[#FFFCF7]/92'
                : 'border-[rgba(15,17,23,0.08)] bg-white/85',
          )}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link href={`/portal/${agency.slug}`} className="inline-flex items-center gap-3">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
                  }}
                >
                  {agency.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold">{settings.siteTitle}</span>
                  <span className={cn('block text-sm', isNocturno ? 'text-white/70' : 'text-[#6B7280]')}>
                    {settings.siteTagline ?? 'Portal inmobiliario'}
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isNocturno
                      ? 'text-white/70 hover:bg-white/10 hover:text-white'
                      : isEditorial
                        ? 'text-[#334155] hover:bg-white hover:text-[#111827]'
                        : 'text-[#475569] hover:bg-white hover:text-[#0F1117]',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href={`/portal/${agency.slug}/contacto`}
                className={cn(
                  'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  isNocturno
                    ? 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                    : isEditorial
                      ? 'border-black/10 bg-white/90 text-[#111827] hover:bg-white'
                      : 'border-[rgba(15,17,23,0.1)] bg-white/80 text-[#0F1117] hover:bg-white',
                )}
              >
                Consultar
              </Link>
              {whatsappHref ? (
                <Link
                  href={whatsappHref}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: settings.primaryColor }}
                >
                  WhatsApp
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">{children}</main>

        <footer
          className={cn(
            'border-t',
            isNocturno
              ? 'border-white/10 bg-[#050B16] text-white'
              : isEditorial
                ? 'border-black/10 bg-[#F8F5EE] text-[#111827]'
                : 'border-[rgba(15,17,23,0.08)] bg-[#0F172A] text-white',
          )}
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.18em]',
                  isEditorial ? 'text-[#64748B]' : 'text-white/60',
                )}
              >
                {agency.name}
              </p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight">
                Sitio público conectado al panel de propiedades y consultas.
              </h2>
              <p
                className={cn(
                  'mt-4 max-w-2xl text-sm leading-7',
                  isEditorial ? 'text-[#475569]' : 'text-white/70',
                )}
              >
                Esta primera iteración ya permite mostrar propiedades publicadas, editar el contenido
                base del sitio y registrar consultas reales desde la web.
              </p>
            </div>

            <div>
              <p
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.18em]',
                  isEditorial ? 'text-[#64748B]' : 'text-white/60',
                )}
              >
                Navegación
              </p>
              <div
                className={cn(
                  'mt-4 flex flex-col gap-3 text-sm',
                  isEditorial ? 'text-[#475569]' : 'text-white/80',
                )}
              >
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'transition-colors',
                      isEditorial ? 'hover:text-[#111827]' : 'hover:text-white',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p
                className={cn(
                  'text-sm font-semibold uppercase tracking-[0.18em]',
                  isEditorial ? 'text-[#64748B]' : 'text-white/60',
                )}
              >
                Contacto
              </p>
              <div
                className={cn(
                  'mt-4 space-y-3 text-sm',
                  isEditorial ? 'text-[#475569]' : 'text-white/80',
                )}
              >
                {settings.primaryPhone ? <p>{settings.primaryPhone}</p> : null}
                {settings.publicEmail ? <p>{settings.publicEmail}</p> : null}
                {settings.address ? <p>{settings.address}</p> : null}
                {!settings.primaryPhone && !settings.publicEmail && !settings.address ? (
                  <p>
                    Configurá teléfono, email y dirección desde el panel para completar este bloque.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}
