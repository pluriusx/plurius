import { notFound } from 'next/navigation'

import { getPortalContext } from '@/lib/website/portal'
import { splitParagraphs } from '@/lib/website/utils'

export const dynamic = 'force-dynamic'

export default async function PublicAboutPage({
  params,
}: {
  params: Promise<{ agencySlug: string }>
}) {
  const { agencySlug } = await params
  const context = await getPortalContext(agencySlug)

  if (!context) {
    notFound()
  }

  const paragraphs = splitParagraphs(context.settings.aboutBody)

  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
            Nosotros
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0F172A]">
            {context.settings.aboutTitle}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#475569]">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-[#0F172A] p-8 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Qué ya resuelve esta versión
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75">
            <li>Contenido editable para la sección institucional.</li>
            <li>Navegación pública conectada a la misma configuración del panel.</li>
            <li>Propiedades con portada y galería básica conectadas al mismo catálogo.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
