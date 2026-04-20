'use client'

import {
  Building2,
  LayoutDashboard,
  LayoutTemplate,
  ListFilter,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BrandLockup } from '@/components/brand-logo'

const navItems = [
  { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard' },
  { icon: Building2, label: 'Propiedades', href: '/propiedades' },
  { icon: MessageSquare, label: 'Consultas', href: '/consultas' },
  { icon: LayoutTemplate, label: 'Sitio web', href: '/sitio-web' },
  { icon: ListFilter, label: 'Campos personalizados', href: '/campos-personalizados' },
  { icon: Settings, label: 'Configuración', href: '/configuracion' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??'
  const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[5]]

  return (
    <>
      <aside
        className="fixed top-4 bottom-4 left-4 z-30 hidden w-[244px] flex-col overflow-hidden lg:flex"
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1px solid var(--border)',
          boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="px-6 pt-6 pb-4">
          <BrandLockup priority />
        </div>

        <div className="mx-4 h-px bg-[var(--divider)]" />

        <div className="px-4 pt-4 pb-2">
          <Link
            href="/propiedades/nueva"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] hover:text-white"
          >
            <Plus size={15} strokeWidth={2.4} />
            Nueva propiedad
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </nav>

        <div className="px-4 pb-3">
          <div
            className="rounded-[16px] p-3.5"
            style={{
              background: 'var(--accent-xlight)',
              border: '1px solid color-mix(in oklab, var(--accent) 15%, transparent)',
            }}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <Sparkles size={10} color="var(--accent)" />
              <p className="text-[9px] font-bold tracking-[0.14em] text-[var(--accent-ink)] uppercase">
                Agente activo
              </p>
            </div>
            <p className="text-[10.5px] leading-[1.45] text-[var(--ink-2)]">
              Sugerencias en tiempo real para consultas, precios y publicaciones.
            </p>
          </div>
        </div>

        <div className="mx-4 h-px bg-[var(--divider)]" />

        <div className="mt-auto flex items-center gap-3 px-4 py-4">
          {user?.image ? (
            <img src={user.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-full" />
          ) : (
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                color: '#052430',
              }}
            >
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-[var(--ink)]">
              {user?.name ?? 'Usuario'}
            </p>
            <p className="text-[11px] text-[var(--ink-3)]">
              {user?.role === 'owner'
                ? 'Propietario'
                : user?.role === 'admin'
                  ? 'Administrador'
                  : 'Agente'}
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-3)] transition-colors hover:text-[var(--accent)]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <nav
        className="fixed right-3 bottom-3 left-3 z-30 grid grid-cols-4 gap-1 rounded-[22px] border p-2 shadow-[0_18px_34px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:hidden"
        style={{
          background: 'color-mix(in oklab, var(--surface) 92%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        {mobileNavItems.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-[16px] px-2 py-2.5 text-center transition-colors ${
                active ? 'bg-[var(--accent-xlight)] text-[var(--accent-ink)]' : 'text-[var(--ink-2)]'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${
                  active ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-[var(--surface-3)]'
                }`}
              >
                <Icon size={15} strokeWidth={2} />
              </span>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

interface NavItemProps {
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>
  label: string
  href: string
  active?: boolean
}

function NavItem({ icon: Icon, label, href, active = false }: NavItemProps) {
  const base =
    'group flex w-full select-none items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] transition-all'

  const styles = active
    ? 'bg-[var(--accent-xlight)] text-[var(--accent-ink)]'
    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'

  const iconStyles = active
    ? 'bg-[var(--accent-light)] text-[var(--accent)]'
    : 'bg-[var(--surface-3)] text-[var(--ink-2)] group-hover:bg-[var(--surface)]'

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] ${iconStyles} transition-colors`}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className={`flex-1 text-left ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </Link>
  )
}
