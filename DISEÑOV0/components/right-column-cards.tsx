import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, Clock, ExternalLink, LayoutTemplate, Mail, Palette } from 'lucide-react'
import Link from 'next/link'

import { getCurrentAgency } from '@/lib/agencies'
import { getRecentPropertyActivity } from '@/lib/properties/repository'
import { propertyStatusLabels } from '@/lib/properties/schema'

const setupItems = [
  {
    icon: Palette,
    title: 'Branding',
    detail: 'Logo, colores y datos comerciales',
    status: 'Completado' as const,
  },
  {
    icon: LayoutTemplate,
    title: 'Sitio web',
    detail: 'Home, páginas y navegación pública',
    status: 'En progreso' as const,
  },
  {
    icon: Mail,
    title: 'Consultas',
    detail: 'Inbox y seguimiento inicial',
    status: 'En progreso' as const,
  },
]

const statusStyle = {
  Completado: { dot: '#10B981', text: '#065F46', bg: '#DCFCE7' },
  'En progreso': { dot: '#F59E0B', text: '#92400E', bg: '#FEF3C7' },
  Pendiente: { dot: '#94A3B8', text: '#475569', bg: '#E2E8F0' },
}

/* ---------- Últimas propiedades ---------- */

export async function RecentPropertiesCard({ className }: { className?: string }) {
  const agency = await getCurrentAgency()
  const recentProperties = await getRecentPropertyActivity(agency.id, 3)

  return (
    <div className={`card p-5 ${className ?? ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F1117]">Últimas propiedades</h2>
          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
            {recentProperties.length === 0
              ? 'Todavía no hay altas reales'
              : `${recentProperties.length} incorporaciones recientes`}
          </p>
        </div>
        <Link
          href="/propiedades"
          className="flex items-center gap-0.5 text-[11px] font-semibold text-[#0891B2] transition-colors hover:text-[#0E7490]"
        >
          Ver todas <ExternalLink size={12} />
        </Link>
      </div>

      {recentProperties.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed border-[rgba(8,145,178,0.25)] p-4"
          style={{ background: '#F9FAFB' }}
        >
          <p className="text-[13px] font-semibold text-[#0F1117]">
            El panel todavía no tiene actividad de propiedades
          </p>
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">
            Cuando se cargue la primera propiedad, este bloque va a mostrar las altas recientes
            del flujo principal.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentProperties.map((property) => (
            <div
              key={property.id}
              className="relative flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.04)] p-3 transition-colors hover:border-[rgba(8,145,178,0.18)]"
              style={{ background: '#F9FAFB' }}
            >
              <Link
                href={`/propiedades/${property.id}`}
                aria-label={`Abrir ficha editable de ${property.title}`}
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-10 rounded-2xl"
              />

              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: '#0891B2' }}
              >
                {property.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight text-[#0F1117]">
                  {property.title}
                </p>
                <p className="truncate text-[11px] text-[#9CA3AF]">
                  {property.internalCode} · {propertyStatusLabels[property.status]}
                </p>
              </div>
              <div className="relative z-20 flex flex-shrink-0 flex-col items-end gap-1.5">
                <span className="flex items-center gap-0.5 text-[10px] text-[#9CA3AF]">
                  <Clock size={9} />
                  {formatDistanceToNow(new Date(property.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                <Link
                  href={`/propiedades/${property.id}`}
                  className="rounded-lg px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: '#0891B2' }}
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Checklist de implementación ---------- */

export function ChecklistCard({ className }: { className?: string }) {
  return (
    <div className={`card p-5 ${className ?? ''}`}>
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[#0F1117]">Checklist de implementación</h2>
        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
          Base operativa conectada y lista para crecer
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {setupItems.map((item) => {
          const Icon = item.icon
          const status = statusStyle[item.status]

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.04)] p-3"
              style={{ background: '#F9FAFB' }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: item.status === 'Completado' ? '#E8FFF4' : '#F3F4F6' }}
              >
                <Icon size={14} color={item.status === 'Completado' ? '#10B981' : '#6B7280'} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight text-[#0F1117]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{item.detail}</p>
              </div>
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: status.bg, color: status.text }}
              >
                {item.status === 'Completado' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {item.status}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-[#F0F9FF] p-3">
        <p className="text-[12px] font-semibold text-[#0F1117]">Siguiente capa recomendada</p>
        <p className="mt-1 text-[11px] leading-5 text-[#6B7280]">
          Con el circuito base de consultas ya encaminado, el siguiente paso natural es sumar
          detalle por lead, notas internas o asignación liviana sin convertir todavía esto en un
          CRM pesado.
        </p>
      </div>
    </div>
  )
}

/* ---------- Wrapper legacy (para compatibilidad) ---------- */

export async function RightColumnCards() {
  return (
    <div className="flex flex-col gap-4">
      <RecentPropertiesCard />
      <ChecklistCard />
    </div>
  )
}
