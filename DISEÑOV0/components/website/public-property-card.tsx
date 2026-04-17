import type { CSSProperties } from 'react'

import { ArrowUpRight, Bath, BedDouble, Images, MapPin, Maximize } from 'lucide-react'
import Link from 'next/link'

import type { PropertyListItem } from '@/lib/properties/schema'
import {
  buildPropertyLocationLabel,
  formatPropertyPrice,
  propertyOperationLabels,
  propertyTypeLabels,
} from '@/lib/properties/schema'

interface PublicPropertyCardProps {
  agencySlug: string
  property: PropertyListItem
  primaryColor: string
  accentColor: string
}

export function PublicPropertyCard({
  agencySlug,
  property,
  primaryColor,
  accentColor,
}: PublicPropertyCardProps) {
  const surface = property.totalArea ?? property.coveredArea
  const articleStyle: CSSProperties = {
    backgroundColor: 'var(--website-card-bg, #FFFFFF)',
    color: 'var(--website-card-text, #0F1117)',
    borderColor: 'var(--website-card-border, rgba(15,17,23,0.08))',
    borderRadius: 'var(--website-card-radius, 28px)',
    boxShadow: 'var(--website-card-shadow, 0 16px 40px rgba(15,23,42,0.08))',
    borderWidth: 1,
    borderStyle: 'solid',
  }
  const heroStyle: CSSProperties = {
    background: 'var(--website-card-hero-background, linear-gradient(135deg, #0891B2 0%, #0F172A 100%))',
    color: 'var(--website-card-hero-text, #FFFFFF)',
  }
  const operationBadgeStyle: CSSProperties = {
    backgroundColor: 'var(--website-card-hero-badge-bg, rgba(255,255,255,0.90))',
    color: 'var(--website-card-hero-badge-text, #111827)',
    borderColor: 'var(--website-card-hero-badge-border, transparent)',
  }
  const typeBadgeStyle: CSSProperties = {
    backgroundColor: 'var(--website-card-hero-type-bg, rgba(255,255,255,0.10))',
    color: 'var(--website-card-hero-type-text, #FFFFFF)',
    borderColor: 'var(--website-card-hero-type-border, rgba(255,255,255,0.20))',
  }
  const overlayStyle: CSSProperties = {
    backgroundColor: 'var(--website-card-hero-overlay, rgba(255,255,255,0.10))',
  }
  const bodyStyle: CSSProperties = {
    color: 'var(--website-card-text, #0F1117)',
  }
  const metaTextStyle: CSSProperties = {
    color: 'var(--website-card-meta-text, #64748B)',
  }
  const statStyle: CSSProperties = {
    backgroundColor: 'var(--website-card-stat-bg, #F8FAFC)',
    color: 'var(--website-card-stat-text, #475569)',
  }
  const dividerStyle: CSSProperties = {
    borderColor: 'var(--website-card-divider, #E2E8F0)',
  }

  return (
    <article className="overflow-hidden" style={articleStyle}>
      <div
        className="relative h-56 overflow-hidden"
        style={property.coverImageUrl ? undefined : heroStyle}
      >
        {property.coverImageUrl ? (
          <>
            <img
              src={property.coverImageUrl}
              alt={property.coverImageAlt || property.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          </>
        ) : null}

        <div className="absolute inset-x-5 top-5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={operationBadgeStyle}
          >
            {propertyOperationLabels[property.operation]}
          </span>
          <span className="rounded-full border px-3 py-1 text-[11px] font-medium" style={typeBadgeStyle}>
            {propertyTypeLabels[property.propertyType]}
          </span>
          {property.mediaCount && property.mediaCount > 1 ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium"
              style={typeBadgeStyle}
            >
              <Images size={13} />
              {property.mediaCount}
            </span>
          ) : null}
        </div>

        <div className="absolute right-0 bottom-0 h-28 w-28 rounded-tl-[120px]" style={overlayStyle} />
        <div
          className="absolute bottom-5 left-5 max-w-[240px]"
          style={{ color: 'var(--website-card-hero-text, #FFFFFF)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--website-card-hero-code-text, rgba(255,255,255,0.70))' }}>
            Código {property.internalCode}
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">{property.title}</h3>
        </div>
      </div>

      <div className="space-y-5 p-6" style={bodyStyle}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm" style={metaTextStyle}>
              <MapPin size={15} />
              <span>{buildPropertyLocationLabel(property)}</span>
            </p>
          </div>
          <p className="text-right text-xl font-semibold" style={{ color: 'var(--website-card-text, #0F172A)' }}>
            {formatPropertyPrice(property)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {property.bedrooms ? (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2" style={statStyle}>
              <BedDouble size={15} />
              {property.bedrooms} dorm.
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2" style={statStyle}>
              <Bath size={15} />
              {property.bathrooms} baños
            </span>
          ) : null}
          {surface ? (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2" style={statStyle}>
              <Maximize size={15} />
              {surface} m²
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-5" style={dividerStyle}>
          <p className="max-w-md text-sm leading-6" style={metaTextStyle}>
            {property.description?.slice(0, 120) ??
              'Propiedad publicada desde el panel del cliente con ficha pública y contacto directo.'}
          </p>
          <Link
            href={`/portal/${agencySlug}/propiedades/${property.slug}`}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            Ver ficha
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}
