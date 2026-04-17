import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPortalContext } from '@/lib/website/portal'
import { splitLines } from '@/lib/website/utils'

export const dynamic = 'force-dynamic'

export default async function PublicServicesPage({
  params,
}: {
  params: Promise<{ agencySlug: string }>
}) {
  const { agencySlug } = await params
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const services = splitLines(context.settings.servicesBody)

  return (
    <div className="space-y-10 py-8">
      <section className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
          Servicios
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0F172A]">
          {context.settings.servicesTitle}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475569]">
          Esta página ya es editable desde el panel. Por ahora usa una estructura simple y clara,
          ideal para una presentación liviana y ordenada del sitio.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => (
          <article
            key={service}
            className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
              Servicio {String(index + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-4 text-xl font-semibold text-[#0F172A]">{service}</h2>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-[#0F172A] p-8 text-white">
        <h2 className="text-3xl font-semibold">¿Querés una consulta personalizada?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
          La sección de servicios ya está conectada a la navegación pública. El siguiente paso
          natural es seguir enriqueciendo este contenido desde el panel del cliente.
        </p>
        <Link
          href={`/portal/${context.agency.slug}/contacto`}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0F172A]"
        >
          Ir a contacto
        </Link>
      </section>
    </div>
  )
}
