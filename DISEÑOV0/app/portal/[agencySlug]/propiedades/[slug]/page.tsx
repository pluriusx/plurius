import { Bath, BedDouble, MapPin, Maximize } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PublicInquiryForm } from '@/components/website/public-inquiry-form'
import { PublicPropertyCard } from '@/components/website/public-property-card'
import {
  getCustomFields,
  getPropertyCustomFieldValues,
} from '@/lib/custom-fields/repository'
import { formatCustomFieldValue } from '@/lib/custom-fields/schema'
import { getPropertyMedia } from '@/lib/property-media/repository'
import {
  getPublishedProperties,
  getPublishedPropertyBySlug,
} from '@/lib/properties/repository'
import {
  buildPropertyLocationLabel,
  formatPropertyPrice,
  propertyOperationLabels,
  propertyTypeLabels,
} from '@/lib/properties/schema'
import { getPortalContext } from '@/lib/website/portal'
import { buildWhatsAppUrl, splitParagraphs } from '@/lib/website/utils'

export const dynamic = 'force-dynamic'

export default async function PublicPropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ agencySlug: string; slug: string }>
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { agencySlug, slug } = await params
  const { sent, error } = await searchParams
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const property = await getPublishedPropertyBySlug(context.agency.id, slug)

  if (!property) {
    notFound()
  }

  const propertyParagraphs = splitParagraphs(
    property.description ??
      'Propiedad publicada desde el panel del cliente con ficha conectada, datos reales y contacto directo.',
  )
  const [customFields, customFieldValues, mediaItems] = await Promise.all([
    getCustomFields(context.agency.id),
    getPropertyCustomFieldValues(context.agency.id, property.id),
    getPropertyMedia(context.agency.id, property.id),
  ])
  const similarProperties = (await getPublishedProperties(context.agency.id, {
    operation: property.operation,
  }))
    .filter((item) => item.id !== property.id)
    .slice(0, 3)
  const whatsappHref = buildWhatsAppUrl(
    context.settings.whatsappPhone,
    `Hola ${context.agency.name}, quiero consultar por ${property.title}.`,
  )
  const surface = property.totalArea ?? property.coveredArea
  const coverMedia = mediaItems.find((item) => item.isCover) ?? mediaItems[0]
  const additionalMediaItems = coverMedia
    ? mediaItems.filter((item) => item.id !== coverMedia.id)
    : mediaItems
  const publicCustomFields = customFields
    .filter((field) => field.showInPublic)
    .map((field) => ({
      id: field.id,
      label: field.name,
      value: formatCustomFieldValue(field, customFieldValues[field.id]),
    }))
    .filter((field) => field.value)

  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="overflow-hidden rounded-[36px] border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div
            className="relative min-h-[360px] overflow-hidden p-8 text-white"
            style={{
              background: coverMedia
                ? undefined
                : `linear-gradient(135deg, ${context.settings.primaryColor} 0%, ${context.settings.accentColor} 100%)`,
            }}
          >
            {coverMedia ? (
              <>
                <img
                  src={coverMedia.url}
                  alt={coverMedia.altText || property.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/15" />
              </>
            ) : null}

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0F1117]">
                  {propertyOperationLabels[property.operation]}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                  {propertyTypeLabels[property.propertyType]}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                  Código {property.internalCode}
                </span>
              </div>

              <div className="mt-10 max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{property.title}</h1>
                <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                  <MapPin size={16} />
                  {buildPropertyLocationLabel(property)}
                </p>
                <p className="mt-6 text-3xl font-semibold">{formatPropertyPrice(property)}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white">
                {property.bedrooms ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <BedDouble size={15} />
                    {property.bedrooms} dorm.
                  </span>
                ) : null}
                {property.bathrooms ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <Bath size={15} />
                    {property.bathrooms} baños
                  </span>
                ) : null}
                {surface ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
                    <Maximize size={15} />
                    {surface} m²
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {additionalMediaItems.length > 0 ? (
            <div className="grid gap-3 border-t border-[rgba(15,23,42,0.08)] bg-white p-5 sm:grid-cols-2 xl:grid-cols-3">
              {additionalMediaItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC]"
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={item.url}
                      alt={item.altText || property.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.altText ? (
                    <p className="px-4 py-3 text-sm text-[#475569]">{item.altText}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-5 p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
                Descripción
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#475569]">
                {propertyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            {publicCustomFields.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
                  Detalles destacados
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {publicCustomFields.map((field) => (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                        {field.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0F172A]">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
              Contacto directo
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#475569]">
              {context.settings.primaryPhone ? <p>{context.settings.primaryPhone}</p> : null}
              {context.settings.publicEmail ? <p>{context.settings.publicEmail}</p> : null}
              {context.settings.address ? <p>{context.settings.address}</p> : null}
              {!context.settings.primaryPhone &&
              !context.settings.publicEmail &&
              !context.settings.address ? (
                <p>
                  La inmobiliaria todavía no completó sus datos públicos. Podés usar el formulario
                  de consulta y la bandeja interna del panel los recibirá igual.
                </p>
              ) : null}
            </div>

            {whatsappHref ? (
              <Link
                href={whatsappHref}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E293B]"
              >
                Abrir WhatsApp
              </Link>
            ) : null}
          </div>

          <PublicInquiryForm
            agencySlug={context.agency.slug}
            pagePath={`/portal/${context.agency.slug}/propiedades/${property.slug}`}
            source="propiedad"
            propertyId={property.id}
            propertyTitle={property.title}
            sent={sent === '1'}
            error={error === '1'}
            compact
          />
        </div>
      </section>

      {similarProperties.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
                También puede interesarte
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[#0F172A]">
                Más publicaciones de la misma operación
              </h2>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {similarProperties.map((item) => (
              <PublicPropertyCard
                key={item.id}
                agencySlug={context.agency.slug}
                property={item}
                primaryColor={context.settings.primaryColor}
                accentColor={context.settings.accentColor}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
