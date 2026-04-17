import { AdminShell } from '@/components/admin/admin-shell'
import { SectionCard } from '@/components/admin/section-card'
import { getCurrentAgency } from '@/lib/agencies'
import { getCustomFields } from '@/lib/custom-fields/repository'
import {
  customFieldTypeLabels,
  customFieldTypeOptions,
} from '@/lib/custom-fields/schema'

import {
  createCustomFieldAction,
  deleteCustomFieldAction,
} from './actions'

const inputClassName =
  'mt-2 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-sm text-[#0F1117] shadow-sm outline-none transition-colors focus:border-[#0891B2]'

export const dynamic = 'force-dynamic'

export default async function CustomFieldsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; removed?: string; error?: string }>
}) {
  const params = await searchParams
  const agency = await getCurrentAgency()
  const fields = await getCustomFields(agency.id)

  return (
    <AdminShell
      title="Campos personalizados"
      description="Capa flexible para adaptar cada ficha a la realidad comercial de la inmobiliaria"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          eyebrow="Tipos"
          title="Modelo base ya activo"
          description="Ahora la sección ya permite definir campos reales que luego aparecen dentro de la ficha de propiedad y en la salida pública cuando corresponde."
          items={customFieldTypeOptions.map((option) => option.label)}
        />
        <SectionCard
          eyebrow="Impacto"
          title="Dónde se usan"
          description="Los campos personalizados se configuran una vez y se reutilizan en todo el circuito del MVP."
          items={[
            'Alta y edición de propiedades',
            'Ficha pública de la propiedad',
            'Visibilidad comercial configurable',
            'Opciones reutilizables por agencia',
          ]}
        />
      </div>

      {params.saved === '1' ? (
        <div className="card border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#166534]">Campo creado correctamente</p>
          <p className="mt-1 text-sm text-[#15803D]">
            Ya quedó disponible dentro del formulario de propiedad para la agencia activa.
          </p>
        </div>
      ) : null}

      {params.removed === '1' ? (
        <div className="card border border-[#DBEAFE] bg-[#EFF6FF] p-4">
          <p className="text-sm font-semibold text-[#1D4ED8]">Campo eliminado</p>
          <p className="mt-1 text-sm text-[#2563EB]">
            También se limpiaron sus valores asociados en las propiedades que lo usaban.
          </p>
        </div>
      ) : null}

      {params.error === '1' ? (
        <div className="card border border-[#FECACA] bg-[#FEF2F2] p-4">
          <p className="text-sm font-semibold text-[#B91C1C]">
            No pudimos guardar los cambios en campos personalizados
          </p>
          <p className="mt-1 text-sm text-[#991B1B]">
            Revisá el nombre, el tipo y las opciones requeridas antes de volver a intentar. Si ya
            agregaste la migración nueva, también verificá que esté aplicada en la base activa.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="card p-5">
          <div className="mb-5">
            <h2 className="text-[18px] font-semibold text-[#0F1117]">Campos activos</h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              Estos campos ya pueden completarse dentro de cada propiedad. La marca “Visible en
              web” determina si aparecen o no en la ficha pública.
            </p>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field) => (
                <article
                  key={field.id}
                  className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9FAFB] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[16px] font-semibold text-[#0F1117]">{field.name}</h3>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#475569]">
                          {customFieldTypeLabels[field.fieldType]}
                        </span>
                        {field.showInPublic ? (
                          <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-[#0891B2]">
                            Visible en web
                          </span>
                        ) : null}
                        {field.isRequired ? (
                          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-semibold text-[#B45309]">
                            Obligatorio
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                            Slug interno
                          </p>
                          <p className="mt-1 font-mono text-xs text-[#475569]">{field.slug}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                            Orden
                          </p>
                          <p className="mt-1 text-sm text-[#475569]">#{field.sortOrder}</p>
                        </div>
                      </div>

                      {field.options.length > 0 ? (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                            Opciones
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {field.options.map((option) => (
                              <span
                                key={option}
                                className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#4B5563]"
                              >
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <form action={deleteCustomFieldAction}>
                      <input type="hidden" name="fieldId" value={field.id} />
                      <button
                        type="submit"
                        className="inline-flex rounded-xl bg-[#FEE2E2] px-3 py-2 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FECACA]"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[rgba(0,0,0,0.12)] bg-[#F9FAFB] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
                Estado inicial
              </p>
              <h3 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
                Todavía no hay campos personalizados creados
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Cuando definas el primero, va a aparecer automáticamente dentro del formulario de
                propiedad para la agencia activa.
              </p>
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-5">
            <h2 className="text-[18px] font-semibold text-[#0F1117]">Crear nuevo campo</h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              Este formulario ya persiste definiciones reales. Para campos de opción única o
              múltiple, cargá una opción por línea.
            </p>
          </div>

          <form action={createCustomFieldAction} className="space-y-4">
            <label className="block text-sm font-medium text-[#0F1117]">
              Nombre del campo
              <input
                name="name"
                required
                className={inputClassName}
                placeholder="Ej. Apto credito"
              />
            </label>

            <label className="block text-sm font-medium text-[#0F1117]">
              Tipo
              <select name="fieldType" defaultValue="short_text" className={inputClassName}>
                {customFieldTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[#0F1117]">
              Opciones
              <textarea
                name="optionsBody"
                className={`${inputClassName} min-h-36 resize-y`}
                placeholder={'Ej. Si\nNo\nA convenir'}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#F9FAFB] px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-[#0F1117]">Visible en web</span>
                <span className="mt-1 block text-xs leading-5 text-[#6B7280]">
                  Si está activo, el valor puede mostrarse en la ficha pública de la propiedad.
                </span>
              </span>
              <input
                type="checkbox"
                name="showInPublic"
                value="true"
                defaultChecked
                className="h-4 w-4 accent-[#0891B2]"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#F9FAFB] px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-[#0F1117]">Campo obligatorio</span>
                <span className="mt-1 block text-xs leading-5 text-[#6B7280]">
                  Obliga a completar este dato dentro de cada propiedad.
                </span>
              </span>
              <input
                type="checkbox"
                name="isRequired"
                value="true"
                className="h-4 w-4 accent-[#0891B2]"
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              Crear campo personalizado
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}
