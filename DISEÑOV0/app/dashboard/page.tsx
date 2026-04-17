import { ActivityFeed } from '@/components/activity-feed'
import { AdminShell } from '@/components/admin/admin-shell'
import { SectionCard } from '@/components/admin/section-card'
import { KPICards } from '@/components/kpi-cards'
import { PropertiesTable } from '@/components/properties-table'
import { ChecklistCard, RecentPropertiesCard } from '@/components/right-column-cards'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <AdminShell
      title="Inicio"
      description="Resumen operativo del panel con propiedades, consultas y sitio conectados"
      action={{ label: 'Nueva propiedad', href: '/propiedades/nueva' }}
    >
      {/*
        Bento Grid — 4 columnas en desktop, 2 en tablet, 1 en mobile.
        Layout (lg):
          Row 1: [SectionCard 2×2] [KPI-pub 1×2] [KPI-total]
          Row 2: [     ...       ] [   ...      ] [KPI-borr ]
          Row 3: [KPI-ops       ] [Properties 2×2] [Últimas 1×3]
          Row 4: [Activity 1×2  ] [    ...       ] [   ...     ]
          Row 5: [   ...        ] [Checklist 2×1 ] [   ...     ]
      */}
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(150px,auto)]"
        style={{ gridAutoFlow: 'dense' }}
      >
        {/* 1 — En foco (2 cols × 2 rows) */}
        <SectionCard
          eyebrow="En foco"
          title="El panel ya está alineado a la operación real"
          description="La base de navegación prioriza propiedades, consultas, contenido del sitio, campos personalizados y configuración. Contratos, portales y legal quedan para fases posteriores."
          items={[
            'Inicio',
            'Propiedades',
            'Consultas',
            'Sitio web',
            'Campos personalizados',
            'Configuración',
          ]}
          accent
          className="md:col-span-2 lg:row-span-2"
        />

        {/* 2-5 — KPI cards (fragmento: hero + 3 small) */}
        <KPICards />

        {/* 6 — Propiedades recientes (2 cols × 2 rows) */}
        <div className="card overflow-hidden p-5 md:col-span-2 lg:col-span-2 lg:row-span-2">
          <PropertiesTable limit={3} compact />
        </div>

        {/* 7 — Últimas propiedades (1 col × 3 rows) */}
        <RecentPropertiesCard className="lg:row-span-3" />

        {/* 8 — Actividad reciente (1 col × 2 rows) */}
        <ActivityFeed className="lg:row-span-2" />

        {/* 9 — Checklist (2 cols) */}
        <ChecklistCard className="md:col-span-2 lg:col-span-2" />
      </div>
    </AdminShell>
  )
}
