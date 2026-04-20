import { AdminShell } from '@/components/admin/admin-shell'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { getCurrentAgency } from '@/lib/agencies'
import {
  getProperties,
  getPropertyDashboardStats,
  getRecentPropertyActivity,
} from '@/lib/properties/repository'
import { getInquiries, getWebsiteSettings } from '@/lib/website/repository'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const agency = await getCurrentAgency()
  const [stats, properties, activities, inquiries, websiteSettings] = await Promise.all([
    getPropertyDashboardStats(agency.id),
    getProperties(agency.id, 6),
    getRecentPropertyActivity(agency.id, 4),
    getInquiries(agency.id, 4),
    getWebsiteSettings(agency),
  ])

  return (
    <AdminShell
      title="Inicio"
      description="Tu operación inmobiliaria en una sola pantalla"
      action={{ label: 'Nueva propiedad', href: '/propiedades/nueva' }}
    >
      <DashboardOverview
        agencyName={agency.name}
        leadEmail={websiteSettings.leadEmail}
        stats={stats}
        properties={properties}
        inquiries={inquiries}
        activities={activities}
      />
    </AdminShell>
  )
}
