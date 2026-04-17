import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { websiteThemePresetMeta } from '@/lib/website/personalization'
import { websiteThemePresetValues, type WebsiteThemePreset } from '@/lib/website/schema'

interface ThemePresetPickerProps {
  name: string
  defaultValue: WebsiteThemePreset
}

export function ThemePresetPicker({ name, defaultValue }: ThemePresetPickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[#0F1117]">
        Elegí el preset visual del portal
      </legend>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
        El preset ordena el clima visual del sitio sin tocar tu contenido: cambia el fondo, el
        tono del header, el footer y la manera en que se presentan las tarjetas.
      </p>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {websiteThemePresetValues.map((preset) => {
          const meta = websiteThemePresetMeta[preset]

          return (
            <label key={preset} className="group relative block cursor-pointer">
              <input
                type="radio"
                name={name}
                value={preset}
                defaultChecked={preset === defaultValue}
                className="peer sr-only"
              />

              <div
                className={cn(
                  'relative h-full overflow-hidden rounded-[28px] border p-4 transition duration-200',
                  'border-[rgba(15,23,42,0.08)] bg-white hover:border-[#0891B2]/30 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
                  'peer-checked:border-[#0891B2] peer-checked:shadow-[0_22px_48px_rgba(8,145,178,0.16)]',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-[#0891B2]/30',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
                      {meta.label}
                    </p>
                    <h3 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
                      {preset === 'brisa'
                        ? 'Amable y luminoso'
                        : preset === 'editorial'
                          ? 'Sólido y ordenado'
                          : 'Profundo y expresivo'}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
                      'bg-[#F3F4F6] text-[#4B5563] transition-colors',
                      'peer-checked:bg-[#0891B2] peer-checked:text-white',
                    )}
                  >
                    <Check size={12} />
                    <span className="peer-checked:hidden">
                      {preset === defaultValue ? 'Actual' : 'Elegir'}
                    </span>
                    <span className="hidden peer-checked:inline">Seleccionado</span>
                  </span>
                </div>

                <div
                  className="mt-5 overflow-hidden rounded-[24px] border p-3"
                  style={{
                    background:
                      preset === 'brisa'
                        ? 'linear-gradient(180deg, #F7F2E8 0%, #FFFFFF 100%)'
                        : preset === 'editorial'
                          ? 'linear-gradient(180deg, #FFFCF7 0%, #F1EDE5 100%)'
                          : 'linear-gradient(180deg, #0F172A 0%, #111827 100%)',
                    borderColor:
                      preset === 'brisa'
                        ? '#E5E7EB'
                        : preset === 'editorial'
                          ? '#E7E5E4'
                          : '#1E293B',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <span
                        className="block h-2.5 w-24 rounded-full"
                        style={{ backgroundColor: meta.preview[2] }}
                      />
                      <span
                        className="block h-2 w-16 rounded-full opacity-70"
                        style={{ backgroundColor: meta.preview[2] }}
                      />
                    </div>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        borderColor:
                          preset === 'nocturno'
                            ? 'rgba(255,255,255,0.18)'
                            : 'rgba(15,23,42,0.08)',
                        color: meta.preview[2],
                      }}
                    >
                      Header
                    </span>
                  </div>

                  <div
                    className="mt-4 rounded-[22px] p-4"
                    style={{
                      background:
                        preset === 'nocturno'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.8)',
                      color: meta.preview[2],
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${meta.preview[0]} 0%, ${meta.preview[1]} 100%)`,
                          color: preset === 'nocturno' ? '#F8FAFC' : '#0F1117',
                        }}
                      >
                        IA
                      </span>
                      <div className="min-w-0">
                        <span
                          className="block h-2.5 w-28 rounded-full"
                          style={{ backgroundColor: meta.preview[2] }}
                        />
                        <span
                          className="mt-2 block h-2 w-20 rounded-full opacity-60"
                          style={{ backgroundColor: meta.preview[2] }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <span
                        className="h-12 rounded-2xl"
                        style={{ backgroundColor: meta.preview[0] }}
                      />
                      <span
                        className="h-12 rounded-2xl"
                        style={{ backgroundColor: meta.preview[1] }}
                      />
                      <span
                        className="h-12 rounded-2xl border"
                        style={{
                          backgroundColor:
                            preset === 'nocturno' ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                          borderColor:
                            preset === 'nocturno'
                              ? 'rgba(255,255,255,0.14)'
                              : 'rgba(15,23,42,0.08)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#64748B]">{meta.description}</p>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
