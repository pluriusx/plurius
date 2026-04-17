import { getCurrentAgency } from '@/lib/agencies'
import { getCustomFields } from '@/lib/custom-fields/repository'
import { AdminShell } from '@/components/admin/admin-shell'
import { PropertyForm } from '@/components/properties/property-form'
import { getPropertyMediaFormValues } from '@/lib/property-media/schema'

export const dynamic = 'force-dynamic'

export default async function NewPropertyPage() {
  const agency = await getCurrentAgency()
  const customFields = await getCustomFields(agency.id)
  const initialMediaItems = getPropertyMediaFormValues([])

  return (
    <AdminShell
      title="Nueva propiedad"
      description="Alta conectada a Supabase con validación y persistencia multi-tenant."
      action={{ label: 'Volver a propiedades', href: '/propiedades' }}
    >
      <PropertyForm customFields={customFields} initialMediaItems={initialMediaItems} />
    </AdminShell>
  )
}
