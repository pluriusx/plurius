import { notFound } from 'next/navigation'

import { PublicInquiryForm } from '@/components/website/public-inquiry-form'
import { getPortalContext } from '@/lib/website/portal'
import { buildWhatsAppUrl, splitParagraphs } from '@/lib/website/utils'

export const dynamic = 'force-dynamic'

export default async function PublicContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ agencySlug: string }>
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { agencySlug } = await params
  const { sent, error } = await searchParams
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const paragraphs = splitParagraphs(context.settings.contactBody)
  const whatsappHref = buildWhatsAppUrl(
    context.settings.whatsappPhone,
    `Hola ${context.agency.name}, quiero hacer una consulta desde la página de contacto.`,
  )

  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
        <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
            Contacto
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0F172A]">
            {context.settings.contactTitle}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#475569]">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 space-y-3 rounded-[24px] bg-[#F8FAFC] p-5 text-sm text-[#334155]">
            {context.settings.primaryPhone ? <p>{context.settings.primaryPhone}</p> : null}
            {context.settings.publicEmail ? <p>{context.settings.publicEmail}</p> : null}
            {context.settings.address ? <p>{context.settings.address}</p> : null}
            {!context.settings.primaryPhone && !context.settings.publicEmail && !context.settings.address ? (
              <p>
                Cargá teléfono, email y dirección desde la configuración del panel para completar
                este bloque.
              </p>
            ) : null}
          </div>

          {whatsappHref ? (
            <a
              href={whatsappHref}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white"
            >
              Escribir por WhatsApp
            </a>
          ) : null}
        </div>

        <PublicInquiryForm
          agencySlug={context.agency.slug}
          pagePath={`/portal/${context.agency.slug}/contacto`}
          source="general"
          sent={sent === '1'}
          error={error === '1'}
        />
      </section>
    </div>
  )
}
