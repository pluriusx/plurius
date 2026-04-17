import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { BadgeCheck, Building2, Home, PencilLine, TimerReset } from 'lucide-react'

import { getCurrentAgency } from '@/lib/agencies'
import { getRecentPropertyActivity } from '@/lib/properties/repository'
import { propertyStatusLabels } from '@/lib/properties/schema'

const activityStyle = {
  borrador: {
    icon: PencilLine,
    iconBg: '#E0F2FE',
    iconColor: '#0891B2',
  },
  publicada: {
    icon: BadgeCheck,
    iconBg: '#DCFCE7',
    iconColor: '#10B981',
  },
  reservada: {
    icon: TimerReset,
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
  },
  vendida: {
    icon: Home,
    iconBg: '#DCFCE7',
    iconColor: '#10B981',
  },
  alquilada: {
    icon: Building2,
    iconBg: '#E0F2FE',
    iconColor: '#0891B2',
  },
}

export async function ActivityFeed({ className }: { className?: string }) {
  const agency = await getCurrentAgency()
  const activities = await getRecentPropertyActivity(agency.id)

  return (
    <div className={`card p-5 ${className ?? ''}`}>
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[#0F1117]">Actividad reciente</h2>
        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">Eventos del circuito operativo</p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(8,145,178,0.25)] bg-[#F8FAFC] p-4">
          <p className="text-[13px] font-semibold text-[#0F1117]">Todavía no hay actividad real</p>
          <p className="mt-2 text-[11px] leading-5 text-[#6B7280]">
            Cuando cargues la primera propiedad, esta sección va a mostrar los últimos eventos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {activities.map((activity) => {
            const visual = activityStyle[activity.status]
            const Icon = visual.icon

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{
                  background: '#F9FAFB',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: visual.iconBg }}
                >
                  <Icon size={14} color={visual.iconColor} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium leading-snug text-[#0F1117]">
                    {activity.title} — {propertyStatusLabels[activity.status].toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                    {activity.internalCode} · {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
