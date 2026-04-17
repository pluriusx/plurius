import { submitInquiryAction } from '@/app/portal/actions'

interface PublicInquiryFormProps {
  agencySlug: string
  pagePath: string
  source: 'general' | 'propiedad'
  title?: string
  description?: string
  propertyId?: string
  propertyTitle?: string
  sent?: boolean
  error?: boolean
  compact?: boolean
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#0891B2]'

export function PublicInquiryForm({
  agencySlug,
  pagePath,
  source,
  title = 'Dejanos tu consulta',
  description = 'Te respondemos desde el panel del cliente y la consulta queda registrada para seguimiento.',
  propertyId,
  propertyTitle,
  sent = false,
  error = false,
  compact = false,
}: PublicInquiryFormProps) {
  return (
    <section
      id="consulta"
      className={`rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${compact ? 'p-5' : 'p-6'}`}
    >
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
          Consultas
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#0F172A]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          {propertyTitle ? `${description} Referencia: ${propertyTitle}.` : description}
        </p>
      </div>

      {sent ? (
        <div className="mb-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
          La consulta se envió correctamente y ya quedó guardada en el panel.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Revisá los datos obligatorios antes de volver a enviar la consulta.
        </div>
      ) : null}

      <form action={submitInquiryAction} className="space-y-4">
        <input type="hidden" name="agencySlug" value={agencySlug} />
        <input type="hidden" name="pagePath" value={pagePath} />
        <input type="hidden" name="returnPath" value={`${pagePath}#consulta`} />
        <input type="hidden" name="source" value={source} />
        <input type="hidden" name="propertyId" value={propertyId ?? ''} />

        <div>
          <label className="text-sm font-medium text-[#0F172A]" htmlFor={`${agencySlug}-fullName`}>
            Nombre y apellido
          </label>
          <input
            id={`${agencySlug}-fullName`}
            name="fullName"
            type="text"
            required
            className={inputClassName}
            placeholder="Ej. Martina Pérez"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#0F172A]" htmlFor={`${agencySlug}-email`}>
              Email
            </label>
            <input
              id={`${agencySlug}-email`}
              name="email"
              type="email"
              required
              className={inputClassName}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0F172A]" htmlFor={`${agencySlug}-phone`}>
              Teléfono
            </label>
            <input
              id={`${agencySlug}-phone`}
              name="phone"
              type="text"
              className={inputClassName}
              placeholder="+54 9 351 ..."
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#0F172A]" htmlFor={`${agencySlug}-message`}>
            Mensaje
          </label>
          <textarea
            id={`${agencySlug}-message`}
            name="message"
            required
            minLength={10}
            rows={5}
            className={`${inputClassName} min-h-36 resize-y`}
            placeholder="Contanos qué propiedad te interesa o qué necesitás resolver."
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
        >
          Enviar consulta
        </button>
      </form>
    </section>
  )
}
