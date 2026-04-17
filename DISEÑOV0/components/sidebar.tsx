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
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??'

  return (
    <aside
      className="fixed top-4 bottom-4 left-4 z-30 hidden w-56 flex-col md:flex"
      style={{
        background: '#FFFFFF',
        borderRadius: 24,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div className="px-5 pt-6 pb-5">
        <div className="mb-1 flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: '#0891B2' }}
          >
            <Building2 size={14} color="white" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#0F1117]">Inmos.ia</span>
        </div>
        <p className="ml-0.5 mt-1 text-[11px] font-medium text-[#9CA3AF]">
          {user?.name ?? 'Cargando...'}
        </p>
      </div>

      <div className="mx-4 h-px bg-[#F3F4F6]" />

      <div className="px-4 pt-4 pb-2">
        <Link
          href="/propiedades/nueva"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#0891B2] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0E7490]"
        >
          <Plus size={15} />
          Nueva propiedad
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
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

      <div className="mx-4 h-px bg-[#F3F4F6]" />

      <div className="px-4 pt-4">
        <div className="rounded-[18px] bg-[#F8FAFC] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0891B2]">
            Panel activo
          </p>
          <p className="mt-2 text-[12px] leading-5 text-[#6B7280]">
            El panel prioriza propiedades, sitio web, branding y consultas con la operación ya
            conectada.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-4">
        {user?.image ? (
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 flex-shrink-0 rounded-full"
          />
        ) : (
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: '#0891B2' }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-[#0F1117]">
            {user?.name ?? 'Usuario'}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            {user?.role === 'owner' ? 'Propietario' : user?.role === 'admin' ? 'Administrador' : 'Agente'}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-1 text-[#9CA3AF] transition-colors hover:text-[#0891B2]"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
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
    'group flex w-full select-none items-center gap-3 rounded-[14px] px-3 py-2.5 text-[13px] font-medium transition-all'

  const styles = active
    ? 'bg-[#F0F9FF] text-[#0891B2]'
    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0F1117]'

  const iconBg = active ? 'bg-[#E0F2FE]' : 'bg-[#F3F4F6] group-hover:bg-[#ECEEF1]'

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[10px] ${iconBg} transition-colors`}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="flex-1 text-left">{label}</span>
    </Link>
  )
}
