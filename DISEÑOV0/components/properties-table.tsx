import { BadgeCheck, Bed, ExternalLink, Images, MapPin, Maximize, Pencil } from 'lucide-react'
import Link from 'next/link'

import { getCurrentAgency } from '@/lib/agencies'
import { getProperties, getPropertyCount } from '@/lib/properties/repository'
import {
  buildPropertyLocationLabel,
  formatPropertyPrice,
  propertyOperationLabels,
  propertyStatusLabels,
  propertyTypeLabels,
  type PropertyStatus,
} from '@/lib/properties/schema'

const statusConfig = {
  publicada: { label: 'Publicada', bg: 'rgba(8, 145, 178, 0.1)', color: '#0891B2', dot: '#0891B2' },
  borrador: { label: 'Borrador', bg: '#E2E8F0', color: '#475569', dot: '#94A3B8' },
  reservada: { label: 'Reservada', bg: 'rgba(245, 158, 11, 0.1)', color: '#B45309', dot: '#F59E0B' },
  vendida: { label: 'Vendida', bg: 'rgba(16, 185, 129, 0.1)', color: '#065F46', dot: '#10B981' },
  alquilada: { label: 'Alquilada', bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
} satisfies Record<PropertyStatus, { label: string; bg: string; color: string; dot: string }>

interface PropertiesTableProps {
  title?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  limit?: number
  compact?: boolean
}

export async function PropertiesTable({
  title = 'Propiedades recientes',
  ctaLabel = 'Ver todas',
  ctaHref = '/propiedades',
  description,
  limit,
  compact = false,
}: PropertiesTableProps) {
  const agency = await getCurrentAgency()
  const [properties, totalProperties] = await Promise.all([
    getProperties(agency.id, limit),
    getPropertyCount(agency.id),
  ])
  const resolvedDescription =
    description ??
    (totalProperties === 0
      ? 'Todavía no hay propiedades cargadas.'
      : limit && totalProperties > properties.length
        ? `Mostrando ${properties.length} de ${totalProperties} propiedades`
        : `${totalProperties} propiedades cargadas`)

  if (properties.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111113]">{title}</h2>
            <p className="text-sm text-[#6B7280]">{resolvedDescription}</p>
          </div>
          <Link
            href={ctaHref}
            className="rounded-xl bg-[#E0F2FE] px-4 py-2 text-sm font-medium text-[#0891B2] transition-colors hover:bg-[#BAE6FD]"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
            Estado inicial
          </p>
          <h3 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
            Aún no hay propiedades cargadas
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6B7280]">
            Creá la primera propiedad desde el panel para empezar a poblar el listado, el
            dashboard y las vistas conectadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111113]">{title}</h2>
          <p className="text-sm text-[#6B7280]">{resolvedDescription}</p>
        </div>
        <Link
          href={ctaHref}
          className="rounded-xl bg-[#E0F2FE] px-4 py-2 text-sm font-medium text-[#0891B2] transition-colors hover:bg-[#BAE6FD]"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
        {properties.map((property) =>
          compact ? (
            <CompactPropertyCard key={property.id} property={property} />
          ) : (
            <PropertyCard key={property.id} property={property} />
          ),
        )}
      </div>
    </div>
  )
}

function CompactPropertyCard({
  property,
}: {
  property: Awaited<ReturnType<typeof getProperties>>[number]
}) {
  const status = statusConfig[property.status]
  const surface = property.totalArea ?? property.coveredArea
  const propertyHref = `/propiedades/${property.id}`

  return (
    <article className="group relative flex items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.04)] bg-[#F9FAFB] p-3 transition-colors hover:border-[rgba(8,145,178,0.18)]">
      <Link
        href={propertyHref}
        aria-label={`Abrir ficha editable de ${property.title}`}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div
        className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #22D3EE 100%)',
        }}
      >
        {property.coverImageUrl ? (
          <img
            src={property.coverImageUrl}
            alt={property.coverImageAlt || property.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight text-[#0F1117]">
          {property.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          <span>{property.internalCode}</span>
          {property.bedrooms ? <span>{property.bedrooms} dorm.</span> : null}
          {surface ? <span>{surface} m²</span> : null}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: status.bg, color: status.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
          {propertyStatusLabels[property.status] ?? status.label}
        </span>
        <span className="text-[12px] font-bold text-[#111113]">
          {formatPropertyPrice(property)}
        </span>
      </div>
    </article>
  )
}

function PropertyCard({
  property,
}: {
  property: Awaited<ReturnType<typeof getProperties>>[number]
}) {
  const status = statusConfig[property.status]
  const surface = property.totalArea ?? property.coveredArea
  const propertyHref = `/propiedades/${property.id}`

  return (
    <article
      id={`property-${property.id}`}
      className="card group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-[#BAE6FD]"
    >
      <Link
        href={propertyHref}
        aria-label={`Abrir ficha editable de ${property.title}`}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-10"
      />

      <div className="flex flex-col md:flex-row">
        <div
          className="relative h-44 w-full overflow-hidden md:w-48 md:flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 50%, #22D3EE 100%)',
          }}
        >
          {property.coverImageUrl ? (
            <>
              <img
                src={property.coverImageUrl}
                alt={property.coverImageAlt || property.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </>
          ) : null}

          <div className="absolute inset-x-3 top-3 flex flex-wrap items-start gap-2">
            <span
              className="rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: property.operation === 'alquiler_anual' ? '#0891B2' : '#111113',
              }}
            >
              {propertyOperationLabels[property.operation]}
            </span>
            {property.mediaCount && property.mediaCount > 1 ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Images size={13} />
                {property.mediaCount}
              </span>
            ) : null}
          </div>

          <div className="absolute right-0 bottom-0 h-24 w-24 rounded-tl-[80px] bg-white/10" />
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 line-clamp-1 text-base font-semibold text-[#111113]">
                  {property.title}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MapPin size={14} className="flex-shrink-0 text-[#9CA3AF]" />
                  <span className="truncate">{buildPropertyLocationLabel(property)}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    {property.internalCode}
                  </span>
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    {propertyTypeLabels[property.propertyType]}
                  </span>
                  {property.status === 'publicada' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0891B2]">
                      <BadgeCheck size={12} />
                      Visible en web
                    </span>
                  ) : null}
                </div>
              </div>

              <span
                className="inline-flex w-fit flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: status.bg, color: status.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
                {propertyStatusLabels[property.status] ?? status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
              {property.bedrooms ? (
                <span className="flex items-center gap-1.5">
                  <Bed size={15} className="text-[#9CA3AF]" />
                  {property.bedrooms} dorm.
                </span>
              ) : null}
              {surface ? (
                <span className="flex items-center gap-1.5">
                  <Maximize size={15} className="text-[#9CA3AF]" />
                  {surface} m²
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-[#F3F4F6] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xl font-bold text-[#111113]">
                {formatPropertyPrice(property)}
              </span>
            </div>

            <div className="relative z-20 flex items-center gap-2">
              <Link
                href={propertyHref}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#F3F4F6] px-3 text-sm font-medium text-[#4B5563] transition-colors hover:bg-[#E5E7EB]"
              >
                <Pencil size={15} />
                Editar
              </Link>
              <Link
                href={propertyHref}
                aria-label={`Abrir ${property.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
