'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  AlertCircle,
  LoaderCircle,
  TriangleAlert,
  Save,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import {
  createPropertyAction,
  type PropertySubmissionValues,
  type PropertyActionState,
  updatePropertyAction,
} from '@/app/propiedades/actions'
import type {
  CustomFieldDefinition,
  CustomFieldStoredValue,
} from '@/lib/custom-fields/schema'
import type { PropertyMediaFormItem } from '@/lib/property-media/schema'
import {
  propertyCurrencyOptions,
  propertyFormDefaultValues,
  propertyFormSchema,
  propertyLocationModeOptions,
  propertyOperationOptions,
  propertyStatusOptions,
  propertyTypeOptions,
  type PropertyFormValues,
} from '@/lib/properties/schema'

/* ─── Estilos base ─── */

const fieldClassName =
  'mt-2 h-11 w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-3 text-sm text-[#0F1117] shadow-sm outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0891B2]'

const textareaClassName =
  'mt-2 min-h-28 w-full rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-3 py-3 text-sm text-[#0F1117] shadow-sm outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0891B2]'

function getFieldClassName(hasError: boolean) {
  return hasError ? `${fieldClassName} border-[#EF4444]` : fieldClassName
}

function getTextareaClassName(hasError: boolean) {
  return hasError ? `${textareaClassName} border-[#EF4444]` : textareaClassName
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-2 text-xs font-medium text-[#DC2626]">{message}</p>
}

function getTextInputValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function getBooleanInputValue(value: unknown) {
  if (value === true || value === 'true' || value === 1 || value === '1') return 'true'
  if (value === false || value === 'false' || value === 0 || value === '0') return 'false'
  return ''
}

function getMultiSelectInputValue(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function createEmptyMediaItem(isCover = false): PropertyMediaFormItem {
  return { url: '', altText: '', isCover }
}

/* ─── Definición de secciones ─── */

type SectionId =
  | 'general'
  | 'precio'
  | 'ubicacion'
  | 'caracteristicas'
  | 'descripcion'
  | 'multimedia'
  | 'custom-fields'
  | 'seo'

interface SectionDef {
  id: SectionId
  label: string
  requiredFields: (keyof PropertyFormValues)[]
  optionalFields: (keyof PropertyFormValues)[]
  isSpecial?: boolean // multimedia, custom fields — no form fields directos
}

const SECTIONS: SectionDef[] = [
  {
    id: 'general',
    label: 'Datos generales',
    requiredFields: ['title', 'internalCode'],
    optionalFields: ['operation', 'propertyType'],
  },
  {
    id: 'precio',
    label: 'Precio y estado',
    requiredFields: ['price'],
    optionalFields: ['currency', 'status', 'showPrice'],
  },
  {
    id: 'ubicacion',
    label: 'Ubicación',
    requiredFields: ['address', 'city'],
    optionalFields: ['neighborhood', 'locationMode'],
  },
  {
    id: 'caracteristicas',
    label: 'Características',
    requiredFields: [],
    optionalFields: ['bedrooms', 'bathrooms', 'coveredArea', 'totalArea'],
  },
  {
    id: 'descripcion',
    label: 'Descripción',
    requiredFields: [],
    optionalFields: ['description'],
  },
  {
    id: 'multimedia',
    label: 'Multimedia',
    requiredFields: [],
    optionalFields: [],
    isSpecial: true,
  },
  {
    id: 'custom-fields',
    label: 'Campos personalizados',
    requiredFields: [],
    optionalFields: [],
    isSpecial: true,
  },
  {
    id: 'seo',
    label: 'SEO y publicación',
    requiredFields: [],
    optionalFields: ['slug', 'metaTitle', 'metaDescription'],
  },
]

/* ─── Cálculo de estado de completitud ─── */

type SectionStatus = 'complete' | 'partial' | 'empty' | 'error'

function getSectionStatus(
  section: SectionDef,
  values: PropertyFormValues,
  errors: Record<string, unknown>,
  mediaItems: PropertyMediaFormItem[],
  customFields: CustomFieldDefinition[],
  customFieldValues: Record<string, unknown>,
): SectionStatus {
  // Verificar errores de validación en los campos de la sección
  const allFields = [...section.requiredFields, ...section.optionalFields]
  const hasErrors = allFields.some((field) => Boolean(errors[field]))
  if (hasErrors) return 'error'

  // Secciones especiales
  if (section.id === 'multimedia') {
    if (mediaItems.length === 0) return 'empty'
    const allValid = mediaItems.every((item) => item.url.trim() !== '')
    return allValid ? 'complete' : 'partial'
  }

  if (section.id === 'custom-fields') {
    if (customFields.length === 0) return 'complete'
    const requiredCustom = customFields.filter((f) => f.isRequired)
    if (requiredCustom.length === 0) {
      const anyFilled = customFields.some((f) => {
        const v = customFieldValues[f.id]
        return v !== undefined && v !== '' && v !== null
      })
      return anyFilled ? 'complete' : 'empty'
    }
    const allRequiredFilled = requiredCustom.every((f) => {
      const v = customFieldValues[f.id]
      return v !== undefined && v !== '' && v !== null
    })
    return allRequiredFilled ? 'complete' : 'partial'
  }

  // Secciones normales
  const requiredFilled = section.requiredFields.every((field) => {
    const v = values[field]
    return v !== undefined && v !== '' && v !== null
  })

  const optionalFilled = section.optionalFields.filter((field) => {
    const v = values[field]
    return v !== undefined && v !== '' && v !== null
  }).length

  if (!requiredFilled) {
    return optionalFilled > 0 || section.requiredFields.length === 0 ? 'partial' : 'empty'
  }

  if (section.optionalFields.length > 0 && optionalFilled < section.optionalFields.length) {
    return 'partial'
  }

  return 'complete'
}

function StatusIcon({ status }: { status: SectionStatus }) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 size={16} className="text-[#16A34A]" />
    case 'partial':
      return <Circle size={16} className="text-[#F59E0B]" />
    case 'error':
      return <AlertCircle size={16} className="text-[#DC2626]" />
    case 'empty':
    default:
      return <Circle size={16} className="text-[#D1D5DB]" />
  }
}

function statusLabel(status: SectionStatus) {
  switch (status) {
    case 'complete':
      return 'Completo'
    case 'partial':
      return 'Parcial'
    case 'error':
      return 'Con errores'
    case 'empty':
    default:
      return 'Pendiente'
  }
}

function statusBadgeClass(status: SectionStatus) {
  switch (status) {
    case 'complete':
      return 'bg-[#DCFCE7] text-[#16A34A]'
    case 'partial':
      return 'bg-[#FEF3C7] text-[#D97706]'
    case 'error':
      return 'bg-[#FEE2E2] text-[#DC2626]'
    case 'empty':
    default:
      return 'bg-[#F3F4F6] text-[#9CA3AF]'
  }
}

/* ─── FormSection colapsable ─── */

function CollapsibleSection({
  id,
  title,
  description,
  children,
  isOpen,
  onToggle,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <section id={`section-${id}`} className="card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#F9FAFB]"
      >
        <div>
          <h2 className="text-[16px] font-semibold text-[#0F1117]">{title}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
        </div>
        <ChevronDown
          size={20}
          className={`ml-3 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight ? `${contentRef.current.scrollHeight + 40}px` : '2000px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2">{children}</div>
      </div>
    </section>
  )
}

/* ─── Auto-save status indicator ─── */

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'saving' && (
        <>
          <LoaderCircle size={12} className="animate-spin text-[#6B7280]" />
          <span className="text-[#6B7280]">Guardando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 size={12} className="text-[#16A34A]" />
          <span className="text-[#16A34A]">Guardado</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle size={12} className="text-[#DC2626]" />
          <span className="text-[#DC2626]">Error al guardar</span>
        </>
      )}
    </div>
  )
}

/* ─── Componente principal ─── */

interface PropertyFormProps {
  mode?: 'create' | 'edit'
  propertyId?: string
  initialValues?: Partial<PropertyFormValues>
  customFields?: CustomFieldDefinition[]
  initialCustomFieldValues?: Record<string, CustomFieldStoredValue>
  initialMediaItems?: PropertyMediaFormItem[]
}

export function PropertyForm({
  mode = 'create',
  propertyId,
  initialValues,
  customFields = [],
  initialCustomFieldValues = {},
  initialMediaItems = [],
}: PropertyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditMode = mode === 'edit' && Boolean(propertyId)

  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>(
    initialCustomFieldValues,
  )
  const [mediaItems, setMediaItems] = useState<PropertyMediaFormItem[]>(initialMediaItems)

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      ...propertyFormDefaultValues,
      ...initialValues,
    },
  })

  const [submitState, setSubmitState] = useState<PropertyActionState | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = form

  const customFieldErrors = submitState?.customFieldErrors ?? {}
  const mediaErrors = submitState?.mediaErrors ?? {}

  /* ─── Estado de secciones colapsables ─── */

  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    SECTIONS.forEach((s) => {
      // En modo creación todas abiertas, en edición todas colapsadas
      initial[s.id] = mode === 'create'
    })
    return initial as Record<SectionId, boolean>
  })

  const toggleSection = useCallback((sectionId: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  const openAndScrollTo = useCallback((sectionId: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: true }))
    // Pequeño delay para que la sección se abra antes del scroll
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [])

  /* ─── Indicadores de completitud ─── */

  const watchedValues = watch()

  const sectionStatuses = SECTIONS.map((section) => ({
    ...section,
    status: getSectionStatus(
      section,
      watchedValues,
      errors as Record<string, unknown>,
      mediaItems,
      customFields,
      customFieldValues,
    ),
  }))

  const visibleSections = sectionStatuses.filter(
    (s) => s.id !== 'custom-fields' || customFields.length > 0,
  )

  const completedCount = visibleSections.filter((s) => s.status === 'complete').length
  const totalCount = visibleSections.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  /* ─── Auto-guardado (solo en modo edición) ─── */

  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')
  const isFirstRenderRef = useRef(true)

  const performAutoSave = useCallback(
    async (values: PropertyFormValues) => {
      if (!isEditMode || !propertyId) return

      const submissionValues: PropertySubmissionValues = {
        ...values,
        customFieldValues,
        mediaItems,
      }

      // Serializar para comparar con el último guardado
      const serialized = JSON.stringify(submissionValues)
      if (serialized === lastSavedRef.current) return

      setAutoSaveStatus('saving')

      try {
        const result = await updatePropertyAction(propertyId, submissionValues)
        if (result.ok) {
          lastSavedRef.current = serialized
          setAutoSaveStatus('saved')
          // Volver a idle después de 3 segundos
          setTimeout(() => setAutoSaveStatus('idle'), 3000)
        } else {
          setAutoSaveStatus('error')
          setTimeout(() => setAutoSaveStatus('idle'), 5000)
        }
      } catch {
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 5000)
      }
    },
    [isEditMode, propertyId, customFieldValues, mediaItems],
  )

  // Debounce de 2.5 segundos para auto-save
  useEffect(() => {
    if (!isEditMode) return

    // No auto-guardar en el primer render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      lastSavedRef.current = JSON.stringify({
        ...watchedValues,
        customFieldValues,
        mediaItems,
      })
      return
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      // Validar antes de guardar
      const parsed = propertyFormSchema.safeParse(watchedValues)
      if (parsed.success) {
        performAutoSave(parsed.data)
      }
    }, 2500)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [watchedValues, customFieldValues, mediaItems, isEditMode, performAutoSave])

  /* ─── Sticky save button visibility ─── */

  const sidebarSaveRef = useRef<HTMLButtonElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const target = sidebarSaveRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  /* ─── Handlers de custom fields y media ─── */

  function updateCustomFieldValue(fieldId: string, value: unknown) {
    setCustomFieldValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }))
  }

  function toggleMultiSelectValue(fieldId: string, option: string, checked: boolean) {
    setCustomFieldValues((currentValues) => {
      const currentOptions = getMultiSelectInputValue(currentValues[fieldId])
      const nextOptions = checked
        ? Array.from(new Set([...currentOptions, option]))
        : currentOptions.filter((item) => item !== option)
      return { ...currentValues, [fieldId]: nextOptions }
    })
  }

  function updateMediaItem(
    index: number,
    fieldName: keyof PropertyMediaFormItem,
    value: string | boolean,
  ) {
    setMediaItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [fieldName]: value } : item,
      ),
    )
  }

  function setCoverMediaItem(index: number) {
    setMediaItems((currentItems) =>
      currentItems.map((item, itemIndex) => ({
        ...item,
        isCover: itemIndex === index,
      })),
    )
  }

  function addMediaItem() {
    setMediaItems((currentItems) => [
      ...currentItems,
      createEmptyMediaItem(currentItems.length === 0),
    ])
  }

  function removeMediaItem(index: number) {
    setMediaItems((currentItems) => {
      const nextItems = currentItems.filter((_, itemIndex) => itemIndex !== index)
      if (nextItems.length === 0) return []
      const hasCover = nextItems.some((item) => item.isCover)
      if (hasCover) return nextItems
      return nextItems.map((item, itemIndex) => ({
        ...item,
        isCover: itemIndex === 0,
      }))
    })
  }

  /* ─── Submit manual ─── */

  const onSubmit = handleSubmit((values) => {
    setSubmitState(null)

    startTransition(async () => {
      const submissionValues: PropertySubmissionValues = {
        ...values,
        customFieldValues,
        mediaItems,
      }
      const result =
        isEditMode && propertyId
          ? await updatePropertyAction(propertyId, submissionValues)
          : await createPropertyAction(submissionValues)

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [fieldName, message] of Object.entries(result.fieldErrors)) {
            if (!message) continue
            setError(fieldName as keyof PropertyFormValues, {
              type: 'server',
              message,
            })
          }
        }
        setSubmitState(result)

        // Abrir secciones con errores
        if (result.fieldErrors) {
          const errorFields = Object.keys(result.fieldErrors)
          const sectionsToOpen: Partial<Record<SectionId, boolean>> = {}
          for (const section of SECTIONS) {
            const allFields = [...section.requiredFields, ...section.optionalFields]
            if (allFields.some((f) => errorFields.includes(f))) {
              sectionsToOpen[section.id] = true
            }
          }
          if (Object.keys(sectionsToOpen).length > 0) {
            setOpenSections((prev) => ({ ...prev, ...sectionsToOpen }))
          }
        }
        return
      }

      // Actualizar ref del autosave para evitar doble guardado
      lastSavedRef.current = JSON.stringify(submissionValues)

      if (isEditMode && propertyId) {
        router.replace(`/propiedades/${propertyId}?updated=1`)
      } else {
        router.push('/propiedades?created=1')
      }

      router.refresh()
    })
  })

  /* ─── Botón de guardar reutilizable ─── */

  function SaveButton({ compact = false }: { compact?: boolean }) {
    return (
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0891B2] font-semibold text-white transition-colors hover:bg-[#0E7490] disabled:cursor-not-allowed disabled:bg-[#7DD3FC] ${
          compact ? 'h-10 px-5 text-sm' : 'h-10 w-full px-4 text-sm'
        }`}
      >
        {isPending ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            {isEditMode ? 'Guardando...' : 'Guardando...'}
          </>
        ) : (
          <>
            {compact ? <Save size={16} /> : <CheckCircle2 size={16} />}
            {isEditMode ? 'Guardar cambios' : 'Guardar propiedad'}
          </>
        )}
      </button>
    )
  }

  /* ─── Render ─── */

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      {/* ─── Columna principal ─── */}
      <div className="space-y-5">
        {submitState && !submitState.ok ? (
          <div className="card border border-[#FECACA] bg-[#FEF2F2] p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 text-[#DC2626]" size={18} />
              <div>
                <p className="text-sm font-semibold text-[#991B1B]">
                  {isEditMode ? 'No pudimos guardar los cambios' : 'No pudimos guardar la propiedad'}
                </p>
                <p className="mt-1 text-sm text-[#B91C1C]">{submitState.message}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* General */}
        <CollapsibleSection
          id="general"
          title="General"
          description="Datos principales para identificar la propiedad dentro del panel y en el portal público."
          isOpen={openSections.general}
          onToggle={() => toggleSection('general')}
        >
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Título
            </span>
            <input
              type="text"
              placeholder="Casa de 3 dormitorios en General Paz"
              className={getFieldClassName(Boolean(errors.title))}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Código interno
            </span>
            <input
              type="text"
              placeholder="NGR-120"
              className={getFieldClassName(Boolean(errors.internalCode))}
              {...register('internalCode')}
            />
            <FieldError message={errors.internalCode?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Operación
            </span>
            <select
              className={getFieldClassName(Boolean(errors.operation))}
              {...register('operation')}
            >
              {propertyOperationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.operation?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Tipo de propiedad
            </span>
            <select
              className={getFieldClassName(Boolean(errors.propertyType))}
              {...register('propertyType')}
            >
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.propertyType?.message} />
          </label>
        </CollapsibleSection>

        {/* Precio y operación */}
        <CollapsibleSection
          id="precio"
          title="Precio y operación"
          description="Campos comerciales que definen la publicación y cómo se muestra el valor."
          isOpen={openSections.precio}
          onToggle={() => toggleSection('precio')}
        >
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Precio
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="120000"
              className={getFieldClassName(Boolean(errors.price))}
              {...register('price', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
            />
            <FieldError message={errors.price?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Moneda
            </span>
            <select
              className={getFieldClassName(Boolean(errors.currency))}
              {...register('currency')}
            >
              {propertyCurrencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.currency?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Estado
            </span>
            <select
              className={getFieldClassName(Boolean(errors.status))}
              {...register('status')}
            >
              {propertyStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.status?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Mostrar precio
            </span>
            <div className="mt-2 flex h-11 items-center justify-between rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-3 shadow-sm">
              <span className="text-sm text-[#0F1117]">Visible en la ficha pública</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#0891B2]"
                {...register('showPrice')}
              />
            </div>
          </label>
        </CollapsibleSection>

        {/* Ubicación */}
        <CollapsibleSection
          id="ubicacion"
          title="Ubicación"
          description="Ubicación pensada para búsqueda, detalle público y control de visibilidad."
          isOpen={openSections.ubicacion}
          onToggle={() => toggleSection('ubicacion')}
        >
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Dirección
            </span>
            <input
              type="text"
              placeholder="Av. O'Higgins 1450"
              className={getFieldClassName(Boolean(errors.address))}
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Ciudad
            </span>
            <input
              type="text"
              placeholder="Córdoba"
              className={getFieldClassName(Boolean(errors.city))}
              {...register('city')}
            />
            <FieldError message={errors.city?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Barrio o zona
            </span>
            <input
              type="text"
              placeholder="General Paz"
              className={getFieldClassName(Boolean(errors.neighborhood))}
              {...register('neighborhood')}
            />
            <FieldError message={errors.neighborhood?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Modo de ubicación
            </span>
            <select
              className={getFieldClassName(Boolean(errors.locationMode))}
              {...register('locationMode')}
            >
              {propertyLocationModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.locationMode?.message} />
          </label>
        </CollapsibleSection>

        {/* Características */}
        <CollapsibleSection
          id="caracteristicas"
          title="Características"
          description="Bloque compacto para los datos duros que más impactan en filtros y fichas."
          isOpen={openSections.caracteristicas}
          onToggle={() => toggleSection('caracteristicas')}
        >
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Dormitorios
            </span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="3"
              className={getFieldClassName(Boolean(errors.bedrooms))}
              {...register('bedrooms', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
            />
            <FieldError message={errors.bedrooms?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Baños
            </span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="2"
              className={getFieldClassName(Boolean(errors.bathrooms))}
              {...register('bathrooms', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
            />
            <FieldError message={errors.bathrooms?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Superficie cubierta
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="120"
              className={getFieldClassName(Boolean(errors.coveredArea))}
              {...register('coveredArea', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
            />
            <FieldError message={errors.coveredArea?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Superficie total
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="160"
              className={getFieldClassName(Boolean(errors.totalArea))}
              {...register('totalArea', {
                setValueAs: (value) => (value === '' ? undefined : Number(value)),
              })}
            />
            <FieldError message={errors.totalArea?.message} />
          </label>
        </CollapsibleSection>

        {/* Descripción */}
        <CollapsibleSection
          id="descripcion"
          title="Descripción"
          description="Texto base de la ficha pública y del resumen comercial interno."
          isOpen={openSections.descripcion}
          onToggle={() => toggleSection('descripcion')}
        >
          <label className="block md:col-span-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Descripción
            </span>
            <textarea
              placeholder="Descripción comercial, amenities y observaciones destacadas"
              className={getTextareaClassName(Boolean(errors.description))}
              {...register('description')}
            />
            <FieldError message={errors.description?.message} />
          </label>
        </CollapsibleSection>

        {/* Multimedia */}
        <CollapsibleSection
          id="multimedia"
          title="Multimedia"
          description="Galería básica por URLs. La portada se usa en cards, listados y cabecera de la ficha pública."
          isOpen={openSections.multimedia}
          onToggle={() => toggleSection('multimedia')}
        >
          <div className="space-y-4 md:col-span-2">
            {mediaItems.length > 0 ? (
              mediaItems.map((item, index) => {
                const urlError = mediaErrors[`items.${index}.url`]
                const altTextError = mediaErrors[`items.${index}.altText`]

                return (
                  <div
                    key={`media-item-${index}`}
                    className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white">
                        {item.url ? (
                          <img
                            src={item.url}
                            alt={item.altText || `Vista previa ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#94A3B8]">
                            Pegá una URL para previsualizar la imagen
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-[#0F172A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                          {item.isCover ? 'Portada' : `Imagen ${index + 1}`}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="block md:col-span-2">
                            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                              URL de la imagen
                            </span>
                            <input
                              type="text"
                              value={item.url}
                              onChange={(event) =>
                                updateMediaItem(index, 'url', event.target.value)
                              }
                              placeholder="https://... o /imagenes/propiedad-01.jpg"
                              className={getFieldClassName(Boolean(urlError))}
                            />
                            <p className="mt-2 text-xs text-[#94A3B8]">
                              Acepta URLs http/https o rutas locales que empiecen con `/`.
                            </p>
                            <FieldError message={urlError} />
                          </label>

                          <label className="block md:col-span-2">
                            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                              Texto alternativo
                            </span>
                            <input
                              type="text"
                              value={item.altText ?? ''}
                              onChange={(event) =>
                                updateMediaItem(index, 'altText', event.target.value)
                              }
                              placeholder="Ej. Living con vista al patio"
                              className={getFieldClassName(Boolean(altTextError))}
                            />
                            <FieldError message={altTextError} />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setCoverMediaItem(index)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                              item.isCover
                                ? 'bg-[#0F172A] text-white'
                                : 'bg-white text-[#0F172A] hover:bg-[#E2E8F0]'
                            }`}
                          >
                            {item.isCover ? 'Portada activa' : 'Usar como portada'}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeMediaItem(index)}
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEE2E2]"
                          >
                            Quitar imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[28px] border border-dashed border-[rgba(15,23,42,0.14)] bg-white px-5 py-6">
                <p className="text-sm font-semibold text-[#0F1117]">Todavía no hay imágenes cargadas</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Podés empezar con una portada y luego sumar más URLs para la galería pública.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={addMediaItem}
              className="inline-flex rounded-full bg-[#E0F2FE] px-4 py-2 text-sm font-semibold text-[#0891B2] transition-colors hover:bg-[#BAE6FD]"
            >
              Agregar imagen
            </button>
          </div>
        </CollapsibleSection>

        {/* Campos personalizados */}
        {customFields.length > 0 ? (
          <CollapsibleSection
            id="custom-fields"
            title="Campos personalizados"
            description="Campos definidos para la agencia activa que complementan la ficha y, si corresponde, la salida pública."
            isOpen={openSections['custom-fields']}
            onToggle={() => toggleSection('custom-fields')}
          >
            {customFields.map((field) => {
              const errorMessage = customFieldErrors[field.id]

              if (field.fieldType === 'long_text') {
                return (
                  <label key={field.id} className="block md:col-span-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                      {field.name}
                    </span>
                    <textarea
                      value={getTextInputValue(customFieldValues[field.id])}
                      onChange={(event) => updateCustomFieldValue(field.id, event.target.value)}
                      placeholder={field.isRequired ? 'Campo obligatorio' : 'Opcional'}
                      className={getTextareaClassName(Boolean(errorMessage))}
                    />
                    <FieldError message={errorMessage} />
                  </label>
                )
              }

              if (field.fieldType === 'boolean') {
                return (
                  <label key={field.id} className="block">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                      {field.name}
                    </span>
                    <select
                      value={getBooleanInputValue(customFieldValues[field.id])}
                      onChange={(event) =>
                        updateCustomFieldValue(
                          field.id,
                          event.target.value === '' ? undefined : event.target.value,
                        )
                      }
                      className={getFieldClassName(Boolean(errorMessage))}
                    >
                      <option value="">{field.isRequired ? 'Elegir una opcion' : 'Sin definir'}</option>
                      <option value="true">Si</option>
                      <option value="false">No</option>
                    </select>
                    <FieldError message={errorMessage} />
                  </label>
                )
              }

              if (field.fieldType === 'single_select') {
                return (
                  <label key={field.id} className="block">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                      {field.name}
                    </span>
                    <select
                      value={getTextInputValue(customFieldValues[field.id])}
                      onChange={(event) =>
                        updateCustomFieldValue(
                          field.id,
                          event.target.value === '' ? undefined : event.target.value,
                        )
                      }
                      className={getFieldClassName(Boolean(errorMessage))}
                    >
                      <option value="">{field.isRequired ? 'Elegir una opcion' : 'Sin definir'}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errorMessage} />
                  </label>
                )
              }

              if (field.fieldType === 'multi_select') {
                const selectedOptions = getMultiSelectInputValue(customFieldValues[field.id])

                return (
                  <div key={field.id} className="block md:col-span-2">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                      {field.name}
                    </span>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {field.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center justify-between rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2.5 text-sm text-[#0F1117] shadow-sm"
                        >
                          <span>{option}</span>
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={(event) =>
                              toggleMultiSelectValue(field.id, option, event.target.checked)
                            }
                            className="h-4 w-4 accent-[#0891B2]"
                          />
                        </label>
                      ))}
                    </div>
                    <FieldError message={errorMessage} />
                  </div>
                )
              }

              return (
                <label key={field.id} className="block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    {field.name}
                  </span>
                  <input
                    type={field.fieldType === 'number' ? 'number' : field.fieldType === 'url' ? 'url' : 'text'}
                    min={field.fieldType === 'number' ? '0' : undefined}
                    step={field.fieldType === 'number' ? '0.01' : undefined}
                    value={getTextInputValue(customFieldValues[field.id])}
                    onChange={(event) => updateCustomFieldValue(field.id, event.target.value)}
                    placeholder={field.isRequired ? 'Campo obligatorio' : 'Opcional'}
                    className={getFieldClassName(Boolean(errorMessage))}
                  />
                  <FieldError message={errorMessage} />
                </label>
              )
            })}
          </CollapsibleSection>
        ) : null}

        {/* SEO y publicación */}
        <CollapsibleSection
          id="seo"
          title="SEO y publicación"
          description="Campos finales para URL amigable, metadatos y visibilidad general."
          isOpen={openSections.seo}
          onToggle={() => toggleSection('seo')}
        >
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Slug
            </span>
            <input
              type="text"
              placeholder="casa-3-dormitorios-general-paz"
              className={getFieldClassName(Boolean(errors.slug))}
              {...register('slug')}
            />
            <p className="mt-2 text-xs text-[#9CA3AF]">
              Si lo dejás vacío, se genera automáticamente desde el título.
            </p>
            <FieldError message={errors.slug?.message} />
          </label>

          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Meta title
            </span>
            <input
              type="text"
              placeholder="Casa en venta en General Paz | Noe García Roñoni"
              className={getFieldClassName(Boolean(errors.metaTitle))}
              {...register('metaTitle')}
            />
            <FieldError message={errors.metaTitle?.message} />
          </label>

          <label className="block md:col-span-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Meta description
            </span>
            <textarea
              placeholder="Ficha moderna con fotos, ubicación y consulta directa."
              className={getTextareaClassName(Boolean(errors.metaDescription))}
              {...register('metaDescription')}
            />
            <FieldError message={errors.metaDescription?.message} />
          </label>
        </CollapsibleSection>
      </div>

      {/* ─── Sidebar ─── */}
      <aside className="space-y-5">
        {/* Checklist navegable */}
        <section className="card sticky top-5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
                Checklist
              </p>
              <h2 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
                {isEditMode ? 'Flujo de edición' : 'Flujo de carga'}
              </h2>
            </div>
            {isEditMode && <AutoSaveIndicator status={autoSaveStatus} />}
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#6B7280]">
                {completedCount} de {totalCount} secciones
              </span>
              <span className="font-semibold text-[#0891B2]">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full bg-[#0891B2] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items del checklist */}
          <div className="mt-4 space-y-1.5">
            {visibleSections.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAndScrollTo(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[#F0F9FF] ${
                  openSections[item.id] ? 'bg-[#F0F9FF]' : 'bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <StatusIcon status={item.status} />
                  <span className="text-sm font-medium text-[#0F1117]">{item.label}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(item.status)}`}
                >
                  {statusLabel(item.status)}
                </span>
              </button>
            ))}
          </div>

          {/* Botón expandir/colapsar todo */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const allOpen: Record<string, boolean> = {}
                SECTIONS.forEach((s) => { allOpen[s.id] = true })
                setOpenSections(allOpen as Record<SectionId, boolean>)
              }}
              className="flex-1 rounded-xl bg-[#F3F4F6] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            >
              Expandir todo
            </button>
            <button
              type="button"
              onClick={() => {
                const allClosed: Record<string, boolean> = {}
                SECTIONS.forEach((s) => { allClosed[s.id] = false })
                setOpenSections(allClosed as Record<SectionId, boolean>)
              }}
              className="flex-1 rounded-xl bg-[#F3F4F6] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            >
              Colapsar todo
            </button>
          </div>
        </section>

        {/* Sección de guardado */}
        <section className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0891B2]">
            {isEditMode ? 'Edición' : 'Guardado'}
          </p>
          <h2 className="mt-2 text-[18px] font-semibold text-[#0F1117]">
            {isEditMode ? 'Actualizar propiedad' : 'Crear propiedad'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            {isEditMode
              ? 'Los cambios se guardan dentro de la agencia activa y se reflejan enseguida en el listado y el dashboard.'
              : 'La propiedad se guarda dentro de la agencia activa y luego aparece en el listado y el dashboard.'}
          </p>

          {isEditMode && (
            <div className="mt-3 rounded-2xl bg-[#F0FDF4] p-3">
              <p className="text-[12px] font-semibold text-[#166534]">Auto-guardado activo</p>
              <p className="mt-1 text-[11px] leading-5 text-[#15803D]">
                Los cambios se guardan automáticamente 2.5 segundos después de dejar de escribir,
                siempre que el formulario sea válido.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-3">
            <p className="text-[12px] font-semibold text-[#0F1117]">Infraestructura actual</p>
            <p className="mt-1 text-[11px] leading-5 text-[#6B7280]">
              Persistencia real en Supabase con esquema multi-tenant activo. Cada cambio se guarda
              en la base conectada y se refleja en el panel y las vistas asociadas.
            </p>
          </div>

          <button
            ref={sidebarSaveRef}
            type="submit"
            disabled={isPending}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#0891B2] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490] disabled:cursor-not-allowed disabled:bg-[#7DD3FC]"
          >
            {isPending ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                {isEditMode ? 'Guardando cambios...' : 'Guardando...'}
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {isEditMode ? 'Guardar cambios' : 'Guardar propiedad'}
              </>
            )}
          </button>
        </section>
      </aside>

      {/* ─── Barra sticky inferior ─── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-sm transition-all duration-300 ${
          showStickyBar
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <div className="h-2 w-2 rounded-full bg-[#0891B2]" />
              <span>
                {completedCount}/{totalCount} secciones completas
              </span>
            </div>
            {isEditMode && <AutoSaveIndicator status={autoSaveStatus} />}
          </div>
          <SaveButton compact />
        </div>
      </div>
    </form>
  )
}
