import { notFound } from 'next/navigation'

import { AdminShell } from '@/components/admin/admin-shell'
import { PropertyForm } from '@/components/properties/property-form'
import { getCurrentAgency } from '@/lib/agencies'
import {
  getCustomFields,
  getPropertyCustomFieldValues,
} from '@/lib/custom-fields/repository'
import { getPropertyMedia } from '@/lib/property-media/repository'
import { getPropertyMediaFormValues } from '@/lib/property-media/schema'
import { getPropertyById } from '@/lib/properties/repository'
import {
  buildPropertyLocationLabel,
  formatPropertyPrice,
  getPropertyFormValues,
  propertyStatusLabels,
} from '@/lib/properties/schema'

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  const [{ propertyId }, query] = await Promise.all([params, searchParams])
  const agency = await getCurrentAgency()
  const [property, customFields, customFieldValues, mediaItems] = await Promise.all([
    getPropertyById(agency.id, propertyId),
    getCustomFields(agency.id),
    getPropertyCustomFieldValues(agency.id, propertyId),
    getPropertyMedia(agency.id, propertyId),
  ])

  if (!property) {
    notFound()
  }

  return (
    <AdminShell
      title={property.title}
      description="Ficha editable conectada a Supabase"
      action={{ label: 'Volver a propiedades', href: '/propiedades' }}
    >
      {query.updated === '1' ? (
        <div className="card border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#166534]">Cambios guardados correctamente</p>
          <p className="mt-1 text-sm text-[#15803D]">
            La propiedad quedó actualizada y el listado ya refleja la información nueva.
          </p>
        </div>
      ) : null}

      <section className="card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
          Ficha activa
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Código
            </p>
            <p className="mt-1 text-sm font-semibold text-[#0F1117]">{property.internalCode}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Estado
            </p>
            <p className="mt-1 text-sm font-semibold text-[#0F1117]">
              {propertyStatusLabels[property.status]}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Ubicación
            </p>
            <p className="mt-1 text-sm font-semibold text-[#0F1117]">
              {buildPropertyLocationLabel(property)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Precio
            </p>
            <p className="mt-1 text-sm font-semibold text-[#0F1117]">
              {formatPropertyPrice(property)}
            </p>
          </div>
        </div>
      </section>

      <PropertyForm
        key={property.id}
        mode="edit"
        propertyId={property.id}
        initialValues={getPropertyFormValues(property)}
        customFields={customFields}
        initialCustomFieldValues={customFieldValues}
        initialMediaItems={getPropertyMediaFormValues(mediaItems)}
      />
    </AdminShell>
  )
}
