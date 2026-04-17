import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PublicPropertyCard } from '@/components/website/public-property-card'
import { getPublishedProperties } from '@/lib/properties/repository'
import {
  propertyOperationLabels,
  propertyOperationValues,
  type PropertyOperation,
} from '@/lib/properties/schema'
import { getPortalContext } from '@/lib/website/portal'
import { hexToRgba } from '@/lib/website/utils'

export const dynamic = 'force-dynamic'

export default async function PublicPropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ agencySlug: string }>
  searchParams: Promise<{ operation?: string; q?: string }>
}) {
  const { agencySlug } = await params
  const { operation, q } = await searchParams
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const resolvedOperation = propertyOperationValues.includes(operation as PropertyOperation)
    ? (operation as PropertyOperation)
    : undefined
  const properties = await getPublishedProperties(context.agency.id, {
    operation: resolvedOperation,
    query: q,
  })

  return (
    <div className="space-y-10 py-8">
      <section
        className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(context.settings.primaryColor, 0.08)} 0%, #FFFFFF 45%, ${hexToRgba(context.settings.accentColor, 0.08)} 100%)`,
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
          Catálogo público
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0F172A]">
          Propiedades publicadas
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475569]">
          Este listado ya consume datos reales del panel. En esta etapa se muestran únicamente las
          propiedades en estado publicada.
        </p>

        <form className="mt-6 grid gap-4 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label htmlFor="property-search" className="text-sm font-medium text-[#0F172A]">
              Buscar por título, código o ubicación
            </label>
            <input
              id="property-search"
              name="q"
              type="search"
              defaultValue={q ?? ''}
              placeholder="Ej. casa, centro, P-101..."
              className="mt-2 w-full rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#0891B2]"
            />
            {resolvedOperation ? <input type="hidden" name="operation" value={resolvedOperation} /> : null}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center self-end rounded-2xl bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
          >
            Aplicar búsqueda
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-3">
          <FilterChip
            href={`/portal/${context.agency.slug}/propiedades`}
            label="Todas"
            active={!resolvedOperation}
          />
          {propertyOperationValues.map((value) => (
            <FilterChip
              key={value}
              href={`/portal/${context.agency.slug}/propiedades?operation=${value}`}
              label={propertyOperationLabels[value]}
              active={resolvedOperation === value}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#475569]">
            {properties.length} {properties.length === 1 ? 'resultado' : 'resultados'} visibles en
            la web
          </p>
        </div>

        {properties.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {properties.map((property) => (
              <PublicPropertyCard
                key={property.id}
                agencySlug={context.agency.slug}
                property={property}
                primaryColor={context.settings.primaryColor}
                accentColor={context.settings.accentColor}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-[rgba(15,23,42,0.16)] bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold text-[#0F172A]">
              No encontramos propiedades con ese criterio
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              Probá otra búsqueda, cambiá el filtro de operación o dejá una consulta para que la
              inmobiliaria te contacte.
            </p>
            <Link
              href={`/portal/${context.agency.slug}/contacto`}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              Ir a contacto
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'bg-[#0F172A] text-white'
          : 'border border-[rgba(15,23,42,0.12)] bg-white text-[#0F172A] hover:border-[rgba(15,23,42,0.24)]'
      }`}
    >
      {label}
    </Link>
  )
}
