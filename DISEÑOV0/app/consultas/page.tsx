import { AdminShell } from '@/components/admin/admin-shell'
import { SectionCard } from '@/components/admin/section-card'
import { getCurrentAgency } from '@/lib/agencies'
import {
  getInquiries,
  getWebsiteSettings,
  type InquiryStatus,
} from '@/lib/website/repository'

import { updateInquiryStatusAction } from './actions'

const statusLabels: Record<InquiryStatus, string> = {
  nueva: 'Sin responder',
  leida: 'En revisión',
  respondida: 'Respondida',
}

const statusStyles: Record<InquiryStatus, string> = {
  nueva: 'bg-[#E0F2FE] text-[#0891B2]',
  leida: 'bg-[#FEF3C7] text-[#B45309]',
  respondida: 'bg-[#DCFCE7] text-[#166534]',
}

const statusActionLabels: Record<InquiryStatus, string> = {
  nueva: 'Nueva',
  leida: 'En revisión',
  respondida: 'Respondida',
}

export const dynamic = 'force-dynamic'

export default async function InquiriesPage() {
  const agency = await getCurrentAgency()
  const [inquiries, settings] = await Promise.all([
    getInquiries(agency.id),
    getWebsiteSettings(agency),
  ])

  return (
    <AdminShell
      title="Consultas"
      description="Inbox operativo del MVP para no perder leads mientras el CRM sigue liviano"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          eyebrow="Flujo base"
          title="Qué ya entra en el MVP operativo"
          description="La base ya guarda consultas reales del portal público, permite ver el origen y sumar un seguimiento mínimo sin abrir todavía un CRM completo."
          items={[
            'Formulario por propiedad',
            'Formulario general',
            settings.leadEmail ?? 'Email receptor pendiente',
            'Cambio de estado',
          ]}
        />
        <SectionCard
          eyebrow="Después"
          title="Qué queda para más adelante"
          description="El CRM profundo, la asignación por agente, las automatizaciones y el pipeline se mantienen fuera de esta primera implementación."
          items={['Pipeline', 'Recordatorios', 'Notas internas', 'Agenda comercial']}
        />
      </div>

      <section className="card p-5">
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-[#0F1117]">Bandeja operativa inicial</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Vista base para revisar mensajes reales del sitio, acceder al contacto y marcar el
            avance mínimo del lead antes de sumar una capa más profunda de CRM.
          </p>
        </div>

        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry.id}
                className="rounded-[28px] border border-[rgba(0,0,0,0.05)] bg-[#F9FAFB] p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                          Código
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#0F1117]">
                          {inquiry.id.slice(0, 8)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                          Contacto
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#0F1117]">
                          {inquiry.fullName}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#0891B2] transition-colors hover:bg-[#E0F2FE]"
                          >
                            {inquiry.email}
                          </a>
                          {inquiry.phone ? (
                            <a
                              href={`tel:${inquiry.phone}`}
                              className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#0F1117] transition-colors hover:bg-[#E5E7EB]"
                            >
                              {inquiry.phone}
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                          Origen
                        </p>
                        <p className="mt-1 text-sm text-[#0F1117]">
                          {inquiry.source === 'propiedad'
                            ? 'Formulario de ficha'
                            : 'Formulario general'}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatInquiryDate(inquiry.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Referencia
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0F1117]">
                        {inquiry.propertyTitle ?? 'Consulta general'}
                      </p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Mensaje
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4B5563]">
                        {inquiry.message}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-[rgba(0,0,0,0.08)] bg-white/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Página de origen
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-[#475569]">
                        {inquiry.pagePath}
                      </p>
                    </div>
                  </div>

                  <aside className="w-full rounded-2xl border border-[rgba(0,0,0,0.05)] bg-white p-4 lg:w-[280px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                      Estado
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[inquiry.status]}`}
                    >
                      {statusLabels[inquiry.status]}
                    </span>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(['nueva', 'leida', 'respondida'] as InquiryStatus[]).map((status) => (
                        <StatusActionButton
                          key={status}
                          inquiryId={inquiry.id}
                          currentStatus={inquiry.status}
                          nextStatus={status}
                        />
                      ))}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                      Este seguimiento es deliberadamente simple: sirve para no perder leads antes
                      de sumar pipeline, notas internas y asignación por agente.
                    </p>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(0,0,0,0.12)] bg-[#F9FAFB] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
              Sin actividad todavía
            </p>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
              Todavía no entraron consultas desde el sitio público
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Cuando alguien complete el formulario general o el de una propiedad publicada, la
              bandeja se va a poblar automáticamente desde esta pantalla.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  )
}

function formatInquiryDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function StatusActionButton({
  inquiryId,
  currentStatus,
  nextStatus,
}: {
  inquiryId: string
  currentStatus: InquiryStatus
  nextStatus: InquiryStatus
}) {
  const isCurrent = currentStatus === nextStatus

  return (
    <form action={updateInquiryStatusAction}>
      <input type="hidden" name="inquiryId" value={inquiryId} />
      <input type="hidden" name="status" value={nextStatus} />
      <button
        type="submit"
        disabled={isCurrent}
        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          isCurrent
            ? 'cursor-not-allowed bg-[#0F172A] text-white'
            : 'bg-[#F3F4F6] text-[#475569] hover:bg-[#E5E7EB]'
        }`}
      >
        {statusActionLabels[nextStatus]}
      </button>
    </form>
  )
}
