import type { ReactNode } from 'react'

import Link from 'next/link'

import { AdminShell } from '@/components/admin/admin-shell'
import { SectionCard } from '@/components/admin/section-card'
import { ThemePresetPicker } from '@/components/website/theme-preset-picker'
import { getCurrentAgency } from '@/lib/agencies'
import { websiteThemePresetMeta } from '@/lib/website/personalization'
import { getWebsiteSettings } from '@/lib/website/repository'

import { saveWebsiteBrandingAction } from './actions'

const inputClassName =
  'mt-2 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#0F1117] shadow-sm outline-none transition-colors focus:border-[#0891B2]'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const params = await searchParams
  const agency = await getCurrentAgency()
  const settings = await getWebsiteSettings(agency)

  return (
    <AdminShell
      title="Configuración"
      description="Branding, contacto, dominio y ajustes generales del tenant"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard
          eyebrow="Marca"
          title="Branding"
          description="Nombre comercial, preset visual, colores y tipografía dentro de opciones acotadas."
          items={['Nombre', 'Preset', 'Colores', 'Tipografía']}
        />
        <SectionCard
          eyebrow="Contacto"
          title="Datos públicos"
          description="Teléfonos, email de contacto, redes sociales y dirección visibles en el sitio."
          items={['Teléfonos', 'Email', 'Redes', 'Dirección']}
        />
        <SectionCard
          eyebrow="Formularios"
          title="Recepción de consultas"
          description="Email receptor, textos del formulario y visibilidad de canales secundarios como WhatsApp."
          items={['Email receptor', 'CTA', 'Mensaje base', 'WhatsApp opcional']}
        />
        <SectionCard
          eyebrow="Preview"
          title="Portal conectado"
          description="La configuración de contacto y colores ya impacta sobre la vista pública del cliente."
          items={['Preview', 'Colores', 'Contacto', 'Canales']}
          ctaLabel="Abrir preview"
          href={`/portal/${agency.slug}`}
        />
      </div>

      {params.saved === '1' ? (
        <div className="card border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#166534]">Configuración actualizada</p>
          <p className="mt-1 text-sm text-[#15803D]">
            Los datos públicos y colores del sitio ya quedaron guardados para el portal del cliente.
          </p>
        </div>
      ) : null}

      {params.error === '1' ? (
        <div className="card border border-[#FECACA] bg-[#FEF2F2] p-4">
          <p className="text-sm font-semibold text-[#B91C1C]">No pudimos guardar la configuración</p>
          <p className="mt-1 text-sm text-[#991B1B]">
            Revisá los datos de contacto y las URLs antes de volver a intentar.
          </p>
        </div>
      ) : null}

      <section className="card p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0F1117]">Branding y contacto público</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
              Esta configuración alimenta el footer, la página de contacto, los colores del portal
              y el email receptor de consultas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-xl bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#4B5563]">
              Preview: /portal/{agency.slug}
            </span>
            <Link
              href={`/portal/${agency.slug}`}
              className="inline-flex items-center justify-center rounded-xl bg-[#0891B2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              Ver sitio público
            </Link>
          </div>
        </div>

        <form action={saveWebsiteBrandingAction} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9FAFB] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
                Canales y recepción
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Teléfono principal" htmlFor="primaryPhone">
                  <input
                    id="primaryPhone"
                    name="primaryPhone"
                    defaultValue={settings.primaryPhone ?? ''}
                    className={inputClassName}
                  />
                </Field>

                <Field label="WhatsApp" htmlFor="whatsappPhone">
                  <input
                    id="whatsappPhone"
                    name="whatsappPhone"
                    defaultValue={settings.whatsappPhone ?? ''}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Email público" htmlFor="publicEmail">
                  <input
                    id="publicEmail"
                    name="publicEmail"
                    type="email"
                    defaultValue={settings.publicEmail ?? ''}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Email receptor de consultas" htmlFor="leadEmail">
                  <input
                    id="leadEmail"
                    name="leadEmail"
                    type="email"
                    defaultValue={settings.leadEmail ?? ''}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Dirección visible" htmlFor="address">
                <input
                  id="address"
                  name="address"
                  defaultValue={settings.address ?? ''}
                  className={inputClassName}
                />
              </Field>
            </section>

            <section className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9FAFB] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
                Marca y redes
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Instagram" htmlFor="instagramUrl">
                  <input
                    id="instagramUrl"
                    name="instagramUrl"
                    defaultValue={settings.instagramUrl ?? ''}
                    className={inputClassName}
                    placeholder="https://instagram.com/..."
                  />
                </Field>

                <Field label="Facebook" htmlFor="facebookUrl">
                  <input
                    id="facebookUrl"
                    name="facebookUrl"
                    defaultValue={settings.facebookUrl ?? ''}
                    className={inputClassName}
                    placeholder="https://facebook.com/..."
                  />
                </Field>

                <Field label="Color principal" htmlFor="primaryColor">
                  <input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    defaultValue={settings.primaryColor}
                    className="mt-2 h-12 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-2 py-2"
                  />
                </Field>

                <Field label="Color secundario" htmlFor="accentColor">
                  <input
                    id="accentColor"
                    name="accentColor"
                    type="color"
                    defaultValue={settings.accentColor}
                    className="mt-2 h-12 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-2 py-2"
                  />
                </Field>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9FAFB] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
                  Identidad visual
                </p>
                <h2 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
                  Preset del portal público
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B7280]">
                  Este preset cambia el clima visual del sitio público sin alterar el contenido. El
                  color principal y el secundario siguen siendo editables, pero el fondo, el header,
                  el footer y las tarjetas se acomodan a una estética consistente.
                </p>
              </div>

              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3 text-sm font-medium text-[#374151]">
                Activo: {websiteThemePresetMeta[settings.themePreset].label}
              </div>
            </div>

            <div className="mt-5">
              <ThemePresetPicker name="themePreset" defaultValue={settings.themePreset} />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              Guardar configuración general
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[#0F1117]">
      {label}
      {children}
    </label>
  )
}
