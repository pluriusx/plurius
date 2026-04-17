'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Globe,
  Layers,
  Monitor,
  Navigation,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wand2,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import {
  websiteHeroVariantMeta,
  websiteThemePresetMeta,
} from '@/lib/website/personalization'
import type { WebsiteSettings } from '@/lib/website/repository'
import type {
  WebsiteHeroVariant,
  WebsiteNavigationMode,
} from '@/lib/website/schema'

/* ------------------------------------------------------------------ */
/*  Types & constants                                                 */
/* ------------------------------------------------------------------ */

const fieldClassName =
  'mt-1.5 w-full rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-[0_2px_6px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-[#94A3B8] focus:border-[rgba(8,145,178,0.3)] focus:ring-2 focus:ring-[rgba(8,145,178,0.12)]'

type PreviewDevice = 'desktop' | 'mobile'

type EditorSection = 'portada' | 'bloques' | 'navegacion' | 'paginas'

const editorSections: { id: EditorSection; label: string; icon: typeof Globe }[] = [
  { id: 'portada', label: 'Portada', icon: Globe },
  { id: 'bloques', label: 'Bloques', icon: Layers },
  { id: 'navegacion', label: 'Navegación', icon: Navigation },
  { id: 'paginas', label: 'Páginas', icon: FileText },
]

type WebsiteBuilderState = {
  siteTitle: string
  siteTagline: string
  heroTitle: string
  heroSubtitle: string
  heroCtaLabel: string
  heroVariant: WebsiteHeroVariant
  navigationMode: WebsiteNavigationMode
  featuredLimit: string
  showSaleLink: boolean
  showRentLink: boolean
  showTemporaryLink: boolean
  showFeaturedProperties: boolean
  showRecentProperties: boolean
  featuredSectionTitle: string
  featuredSectionBody: string
  showHighlightSection: boolean
  highlightTitle: string
  highlightBody: string
  highlightCtaLabel: string
  recentSectionTitle: string
  recentSectionBody: string
  showFinalCta: boolean
  finalCtaTitle: string
  finalCtaBody: string
  finalCtaLabel: string
  servicesTitle: string
  servicesBody: string
  aboutTitle: string
  aboutBody: string
  contactTitle: string
  contactBody: string
}

interface WebsiteBuilderProps {
  agencyName: string
  agencySlug: string
  settings: WebsiteSettings
  saveAction: (formData: FormData) => void | Promise<void>
  saved?: boolean
  error?: boolean
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function WebsiteBuilder({
  agencyName,
  agencySlug,
  settings,
  saveAction,
  saved,
  error,
}: WebsiteBuilderProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [state, setState] = useState<WebsiteBuilderState>(() =>
    buildBuilderState(settings),
  )
  const [activeSection, setActiveSection] = useState<EditorSection>('portada')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastError, setToastError] = useState(false)

  useEffect(() => {
    if (saved || error) {
      setToastVisible(true)
      setToastError(!!error)
      const timer = setTimeout(() => setToastVisible(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [saved, error])

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) {
      const src = iframeRef.current.src
      iframeRef.current.src = ''
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.src = src
      })
    }
  }, [])

  const portalUrl = `/portal/${agencySlug}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F1F3F5]">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(15,23,42,0.08)] bg-white px-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3">
          <Link
            href="/sitio-web"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="mx-1 h-5 w-px bg-[#E2E8F0]" />

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            <Sparkles size={14} className="text-[#0891B2]" />
            <span className="text-sm font-semibold text-[#0F172A]">Constructor</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="hidden rounded-lg bg-[#F1F5F9] p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition',
                device === 'desktop'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#334155]',
              )}
            >
              <Monitor size={14} />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition',
                device === 'mobile'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#334155]',
              )}
            >
              <Smartphone size={14} />
              Mobile
            </button>
          </div>

          <button
            type="button"
            onClick={refreshPreview}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            title="Refrescar preview"
          >
            <RefreshCw size={15} />
          </button>

          <div className="mx-0.5 h-5 w-px bg-[#E2E8F0]" />

          <Link
            href={portalUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <ExternalLink size={14} />
            <span className="hidden md:inline">Ver sitio</span>
          </Link>

          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0891B2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E7490] active:scale-[0.97]"
          >
            Guardar
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside
          className={cn(
            'flex shrink-0 flex-col border-r border-[rgba(15,23,42,0.08)] bg-white transition-all duration-300 ease-in-out',
            sidebarOpen ? 'w-[420px]' : 'w-0',
          )}
        >
          <div className={cn('flex h-full min-w-[420px] flex-col overflow-hidden', !sidebarOpen && 'invisible')}>
            {/* Section tabs */}
            <nav className="flex gap-1 border-b border-[rgba(15,23,42,0.06)] px-3 py-2">
              {editorSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
                      activeSection === section.id
                        ? 'bg-[#F0F9FF] text-[#0891B2]'
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]',
                    )}
                  >
                    <Icon size={14} />
                    {section.label}
                  </button>
                )
              })}
            </nav>

            {/* Form */}
            <form
              ref={formRef}
              action={saveAction}
              className="flex-1 overflow-y-auto"
            >
              {/* ── Portada ──────────────────────────────── */}
              <div className={cn('space-y-5 p-5', activeSection !== 'portada' && 'hidden')}>
                <SidebarHeading
                  title="Identidad y portada"
                  description="Nombre del sitio, mensaje principal y composición del hero."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <BuilderField label="Nombre del sitio" htmlFor="siteTitle">
                    <input
                      id="siteTitle"
                      name="siteTitle"
                      value={state.siteTitle}
                      onChange={(e) => updateField(setState, 'siteTitle', e.target.value)}
                      className={fieldClassName}
                      placeholder={agencyName}
                      required
                    />
                  </BuilderField>

                  <BuilderField label="Bajada corta" htmlFor="siteTagline">
                    <input
                      id="siteTagline"
                      name="siteTagline"
                      value={state.siteTagline}
                      onChange={(e) => updateField(setState, 'siteTagline', e.target.value)}
                      className={fieldClassName}
                      placeholder="Tu inmobiliaria de confianza"
                    />
                  </BuilderField>
                </div>

                <BuilderField label="Título principal del hero" htmlFor="heroTitle">
                  <input
                    id="heroTitle"
                    name="heroTitle"
                    value={state.heroTitle}
                    onChange={(e) => updateField(setState, 'heroTitle', e.target.value)}
                    className={fieldClassName}
                    placeholder="Encontrá tu próximo hogar"
                    required
                  />
                </BuilderField>

                <BuilderField label="Texto de apoyo" htmlFor="heroSubtitle">
                  <textarea
                    id="heroSubtitle"
                    name="heroSubtitle"
                    value={state.heroSubtitle}
                    onChange={(e) => updateField(setState, 'heroSubtitle', e.target.value)}
                    className={cn(fieldClassName, 'min-h-24 resize-y')}
                    placeholder="Descripción breve del portal..."
                  />
                </BuilderField>

                <BuilderField label="Texto del botón CTA" htmlFor="heroCtaLabel">
                  <input
                    id="heroCtaLabel"
                    name="heroCtaLabel"
                    value={state.heroCtaLabel}
                    onChange={(e) => updateField(setState, 'heroCtaLabel', e.target.value)}
                    className={fieldClassName}
                    placeholder="Ver propiedades"
                    required
                  />
                </BuilderField>

                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-[#0F172A]">Variante de portada</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <HeroVariantCard
                      value="split"
                      checked={state.heroVariant === 'split'}
                      onChange={(v) => updateField(setState, 'heroVariant', v)}
                    />
                    <HeroVariantCard
                      value="centered"
                      checked={state.heroVariant === 'centered'}
                      onChange={(v) => updateField(setState, 'heroVariant', v)}
                    />
                    <HeroVariantCard
                      value="immersive"
                      checked={state.heroVariant === 'immersive'}
                      onChange={(v) => updateField(setState, 'heroVariant', v)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Bloques ──────────────────────────────── */}
              <div className={cn('space-y-5 p-5', activeSection !== 'bloques' && 'hidden')}>
                <SidebarHeading
                  title="Bloques de la home"
                  description="Activá y configurá cada sección que aparece en la página principal."
                />

                <div className="space-y-3">
                  <ToggleCard
                    name="showFeaturedProperties"
                    label="Propiedades destacadas"
                    description="Abre la home con propiedades ancla."
                    checked={state.showFeaturedProperties}
                    onCheckedChange={(v) => updateField(setState, 'showFeaturedProperties', v)}
                  />

                  {state.showFeaturedProperties && (
                    <CollapsibleFields>
                      <BuilderField label="Título de sección" htmlFor="featuredSectionTitle">
                        <input
                          id="featuredSectionTitle"
                          name="featuredSectionTitle"
                          value={state.featuredSectionTitle}
                          onChange={(e) => updateField(setState, 'featuredSectionTitle', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Texto de apoyo" htmlFor="featuredSectionBody">
                        <textarea
                          id="featuredSectionBody"
                          name="featuredSectionBody"
                          value={state.featuredSectionBody}
                          onChange={(e) => updateField(setState, 'featuredSectionBody', e.target.value)}
                          className={cn(fieldClassName, 'min-h-20 resize-y')}
                        />
                      </BuilderField>
                    </CollapsibleFields>
                  )}

                  <ToggleCard
                    name="showHighlightSection"
                    label="Bloque diferencial"
                    description="Cuenta por qué esta inmobiliaria se presenta distinto."
                    checked={state.showHighlightSection}
                    onCheckedChange={(v) => updateField(setState, 'showHighlightSection', v)}
                  />

                  {state.showHighlightSection && (
                    <CollapsibleFields>
                      <BuilderField label="Título del bloque" htmlFor="highlightTitle">
                        <input
                          id="highlightTitle"
                          name="highlightTitle"
                          value={state.highlightTitle}
                          onChange={(e) => updateField(setState, 'highlightTitle', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Contenido" htmlFor="highlightBody">
                        <textarea
                          id="highlightBody"
                          name="highlightBody"
                          value={state.highlightBody}
                          onChange={(e) => updateField(setState, 'highlightBody', e.target.value)}
                          className={cn(fieldClassName, 'min-h-24 resize-y')}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Texto del botón" htmlFor="highlightCtaLabel">
                        <input
                          id="highlightCtaLabel"
                          name="highlightCtaLabel"
                          value={state.highlightCtaLabel}
                          onChange={(e) => updateField(setState, 'highlightCtaLabel', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                    </CollapsibleFields>
                  )}

                  <ToggleCard
                    name="showRecentProperties"
                    label="Propiedades recientes"
                    description="Mantiene la portada en movimiento con publicaciones nuevas."
                    checked={state.showRecentProperties}
                    onCheckedChange={(v) => updateField(setState, 'showRecentProperties', v)}
                  />

                  {state.showRecentProperties && (
                    <CollapsibleFields>
                      <BuilderField label="Título de sección" htmlFor="recentSectionTitle">
                        <input
                          id="recentSectionTitle"
                          name="recentSectionTitle"
                          value={state.recentSectionTitle}
                          onChange={(e) => updateField(setState, 'recentSectionTitle', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Texto de apoyo" htmlFor="recentSectionBody">
                        <textarea
                          id="recentSectionBody"
                          name="recentSectionBody"
                          value={state.recentSectionBody}
                          onChange={(e) => updateField(setState, 'recentSectionBody', e.target.value)}
                          className={cn(fieldClassName, 'min-h-20 resize-y')}
                        />
                      </BuilderField>
                    </CollapsibleFields>
                  )}

                  <ToggleCard
                    name="showFinalCta"
                    label="CTA final"
                    description="Cierra el recorrido con una llamada a la acción fuerte."
                    checked={state.showFinalCta}
                    onCheckedChange={(v) => updateField(setState, 'showFinalCta', v)}
                  />

                  {state.showFinalCta && (
                    <CollapsibleFields>
                      <BuilderField label="Título final" htmlFor="finalCtaTitle">
                        <input
                          id="finalCtaTitle"
                          name="finalCtaTitle"
                          value={state.finalCtaTitle}
                          onChange={(e) => updateField(setState, 'finalCtaTitle', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Contenido" htmlFor="finalCtaBody">
                        <textarea
                          id="finalCtaBody"
                          name="finalCtaBody"
                          value={state.finalCtaBody}
                          onChange={(e) => updateField(setState, 'finalCtaBody', e.target.value)}
                          className={cn(fieldClassName, 'min-h-24 resize-y')}
                          required
                        />
                      </BuilderField>
                      <BuilderField label="Texto del botón" htmlFor="finalCtaLabel">
                        <input
                          id="finalCtaLabel"
                          name="finalCtaLabel"
                          value={state.finalCtaLabel}
                          onChange={(e) => updateField(setState, 'finalCtaLabel', e.target.value)}
                          className={fieldClassName}
                          required
                        />
                      </BuilderField>
                    </CollapsibleFields>
                  )}
                </div>

                {/* Hidden inputs for fields not visible when toggle is off */}
                {!state.showFeaturedProperties && (
                  <>
                    <input type="hidden" name="featuredSectionTitle" value={state.featuredSectionTitle} />
                    <input type="hidden" name="featuredSectionBody" value={state.featuredSectionBody} />
                  </>
                )}
                {!state.showHighlightSection && (
                  <>
                    <input type="hidden" name="highlightTitle" value={state.highlightTitle} />
                    <input type="hidden" name="highlightBody" value={state.highlightBody} />
                    <input type="hidden" name="highlightCtaLabel" value={state.highlightCtaLabel} />
                  </>
                )}
                {!state.showRecentProperties && (
                  <>
                    <input type="hidden" name="recentSectionTitle" value={state.recentSectionTitle} />
                    <input type="hidden" name="recentSectionBody" value={state.recentSectionBody} />
                  </>
                )}
                {!state.showFinalCta && (
                  <>
                    <input type="hidden" name="finalCtaTitle" value={state.finalCtaTitle} />
                    <input type="hidden" name="finalCtaBody" value={state.finalCtaBody} />
                    <input type="hidden" name="finalCtaLabel" value={state.finalCtaLabel} />
                  </>
                )}
              </div>

              {/* ── Navegación ───────────────────────────── */}
              <div className={cn('space-y-5 p-5', activeSection !== 'navegacion' && 'hidden')}>
                <SidebarHeading
                  title="Navegación"
                  description="Definí cómo se estructura el menú principal del sitio."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <BuilderField label="Modo de navegación" htmlFor="navigationMode">
                    <select
                      id="navigationMode"
                      name="navigationMode"
                      value={state.navigationMode}
                      onChange={(e) =>
                        updateField(setState, 'navigationMode', e.target.value as WebsiteNavigationMode)
                      }
                      className={fieldClassName}
                    >
                      <option value="simple">Simple</option>
                      <option value="operaciones">Con accesos por operación</option>
                    </select>
                  </BuilderField>

                  <BuilderField label="Límite de destacadas" htmlFor="featuredLimit">
                    <input
                      id="featuredLimit"
                      name="featuredLimit"
                      type="number"
                      min={1}
                      max={12}
                      value={state.featuredLimit}
                      onChange={(e) => updateField(setState, 'featuredLimit', e.target.value)}
                      className={fieldClassName}
                      required
                    />
                  </BuilderField>
                </div>

                {state.navigationMode === 'operaciones' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Accesos directos en el header
                    </p>
                    <ToggleCard
                      name="showSaleLink"
                      label="En venta"
                      description="Acceso directo desde el header."
                      checked={state.showSaleLink}
                      onCheckedChange={(v) => updateField(setState, 'showSaleLink', v)}
                    />
                    <ToggleCard
                      name="showRentLink"
                      label="En alquiler"
                      description="Entrada dedicada al alquiler anual."
                      checked={state.showRentLink}
                      onCheckedChange={(v) => updateField(setState, 'showRentLink', v)}
                    />
                    <ToggleCard
                      name="showTemporaryLink"
                      label="Temporario"
                      description="Destacar alquileres temporarios."
                      checked={state.showTemporaryLink}
                      onCheckedChange={(v) => updateField(setState, 'showTemporaryLink', v)}
                    />
                  </div>
                )}

                {/* Hidden inputs when mode is simple */}
                {state.navigationMode === 'simple' && (
                  <>
                    <input type="hidden" name="showSaleLink" value={state.showSaleLink ? 'on' : ''} />
                    <input type="hidden" name="showRentLink" value={state.showRentLink ? 'on' : ''} />
                    <input type="hidden" name="showTemporaryLink" value={state.showTemporaryLink ? 'on' : ''} />
                  </>
                )}

                {/* Nav preview */}
                <div className="rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#F8FAFC] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Preview del header
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {buildNavigationItems(state).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#334155] shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Páginas ──────────────────────────────── */}
              <div className={cn('space-y-5 p-5', activeSection !== 'paginas' && 'hidden')}>
                <SidebarHeading
                  title="Páginas institucionales"
                  description="Editá el contenido de las páginas de Servicios, Nosotros y Contacto."
                />

                <CollapsibleSection title="Servicios" defaultOpen>
                  <BuilderField label="Título" htmlFor="servicesTitle">
                    <input
                      id="servicesTitle"
                      name="servicesTitle"
                      value={state.servicesTitle}
                      onChange={(e) => updateField(setState, 'servicesTitle', e.target.value)}
                      className={fieldClassName}
                      required
                    />
                  </BuilderField>
                  <BuilderField label="Items (uno por línea)" htmlFor="servicesBody">
                    <textarea
                      id="servicesBody"
                      name="servicesBody"
                      value={state.servicesBody}
                      onChange={(e) => updateField(setState, 'servicesBody', e.target.value)}
                      className={cn(fieldClassName, 'min-h-36 resize-y')}
                      required
                    />
                  </BuilderField>
                </CollapsibleSection>

                <CollapsibleSection title="Nosotros">
                  <BuilderField label="Título" htmlFor="aboutTitle">
                    <input
                      id="aboutTitle"
                      name="aboutTitle"
                      value={state.aboutTitle}
                      onChange={(e) => updateField(setState, 'aboutTitle', e.target.value)}
                      className={fieldClassName}
                      required
                    />
                  </BuilderField>
                  <BuilderField label="Contenido (párrafos)" htmlFor="aboutBody">
                    <textarea
                      id="aboutBody"
                      name="aboutBody"
                      value={state.aboutBody}
                      onChange={(e) => updateField(setState, 'aboutBody', e.target.value)}
                      className={cn(fieldClassName, 'min-h-36 resize-y')}
                      required
                    />
                  </BuilderField>
                </CollapsibleSection>

                <CollapsibleSection title="Contacto">
                  <BuilderField label="Título" htmlFor="contactTitle">
                    <input
                      id="contactTitle"
                      name="contactTitle"
                      value={state.contactTitle}
                      onChange={(e) => updateField(setState, 'contactTitle', e.target.value)}
                      className={fieldClassName}
                      required
                    />
                  </BuilderField>
                  <BuilderField label="Contenido (párrafos)" htmlFor="contactBody">
                    <textarea
                      id="contactBody"
                      name="contactBody"
                      value={state.contactBody}
                      onChange={(e) => updateField(setState, 'contactBody', e.target.value)}
                      className={cn(fieldClassName, 'min-h-36 resize-y')}
                      required
                    />
                  </BuilderField>
                </CollapsibleSection>
              </div>

              {/* Hidden fields for inactive sections */}
              {activeSection !== 'portada' && (
                <>
                  <input type="hidden" name="siteTitle" value={state.siteTitle} />
                  <input type="hidden" name="siteTagline" value={state.siteTagline} />
                  <input type="hidden" name="heroTitle" value={state.heroTitle} />
                  <input type="hidden" name="heroSubtitle" value={state.heroSubtitle} />
                  <input type="hidden" name="heroCtaLabel" value={state.heroCtaLabel} />
                  <input type="hidden" name="heroVariant" value={state.heroVariant} />
                </>
              )}
              {activeSection !== 'navegacion' && (
                <>
                  <input type="hidden" name="navigationMode" value={state.navigationMode} />
                  <input type="hidden" name="featuredLimit" value={state.featuredLimit} />
                  {state.navigationMode === 'operaciones' && (
                    <>
                      <input type="hidden" name="showSaleLink" value={state.showSaleLink ? 'on' : ''} />
                      <input type="hidden" name="showRentLink" value={state.showRentLink ? 'on' : ''} />
                      <input type="hidden" name="showTemporaryLink" value={state.showTemporaryLink ? 'on' : ''} />
                    </>
                  )}
                </>
              )}
              {activeSection !== 'bloques' && (
                <>
                  <input type="hidden" name="showFeaturedProperties" value={state.showFeaturedProperties ? 'on' : ''} />
                  <input type="hidden" name="showRecentProperties" value={state.showRecentProperties ? 'on' : ''} />
                  <input type="hidden" name="showHighlightSection" value={state.showHighlightSection ? 'on' : ''} />
                  <input type="hidden" name="showFinalCta" value={state.showFinalCta ? 'on' : ''} />
                  <input type="hidden" name="featuredSectionTitle" value={state.featuredSectionTitle} />
                  <input type="hidden" name="featuredSectionBody" value={state.featuredSectionBody} />
                  <input type="hidden" name="highlightTitle" value={state.highlightTitle} />
                  <input type="hidden" name="highlightBody" value={state.highlightBody} />
                  <input type="hidden" name="highlightCtaLabel" value={state.highlightCtaLabel} />
                  <input type="hidden" name="recentSectionTitle" value={state.recentSectionTitle} />
                  <input type="hidden" name="recentSectionBody" value={state.recentSectionBody} />
                  <input type="hidden" name="finalCtaTitle" value={state.finalCtaTitle} />
                  <input type="hidden" name="finalCtaBody" value={state.finalCtaBody} />
                  <input type="hidden" name="finalCtaLabel" value={state.finalCtaLabel} />
                </>
              )}
              {activeSection !== 'paginas' && (
                <>
                  <input type="hidden" name="servicesTitle" value={state.servicesTitle} />
                  <input type="hidden" name="servicesBody" value={state.servicesBody} />
                  <input type="hidden" name="aboutTitle" value={state.aboutTitle} />
                  <input type="hidden" name="aboutBody" value={state.aboutBody} />
                  <input type="hidden" name="contactTitle" value={state.contactTitle} />
                  <input type="hidden" name="contactBody" value={state.contactBody} />
                </>
              )}

              {/* Sidebar footer with save */}
              <div className="sticky bottom-0 border-t border-[rgba(15,23,42,0.06)] bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A]">
                      {websiteThemePresetMeta[settings.themePreset].label}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-md border border-black/10"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      <span
                        className="h-4 w-4 rounded-md border border-black/10"
                        style={{ backgroundColor: settings.accentColor }}
                      />
                      <Link
                        href="/configuracion"
                        className="ml-1 text-[11px] font-semibold text-[#0891B2] hover:underline"
                      >
                        Ajustar estilo
                      </Link>
                    </div>
                  </div>
                  <SaveButton />
                </div>
              </div>
            </form>
          </div>
        </aside>

        {/* ── Canvas ──────────────────────────────────────── */}
        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#E5E7EB] p-4 sm:p-6">
          {/* Checkerboard pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
            }}
          />

          <div
            className={cn(
              'relative flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-500',
              device === 'desktop'
                ? 'h-full w-full max-w-full'
                : 'h-[812px] w-[375px]',
            )}
          >
            {/* Browser chrome */}
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#E5E7EB] bg-[#F9FAFB] px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FDE68A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#6EE7B7]" />
              <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-[#94A3B8]">
                <Globe size={11} />
                <span className="truncate">{agencyName.toLowerCase().replace(/\s+/g, '')}.inmob.ia</span>
              </div>
            </div>

            {/* iframe preview */}
            <iframe
              ref={iframeRef}
              src={portalUrl}
              className="flex-1 border-0"
              title="Preview del portal"
            />
          </div>
        </main>
      </div>

      {/* ── Toast ────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transition-all duration-300',
          toastVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg',
            toastError
              ? 'border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
              : 'border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]',
          )}
        >
          {toastError ? (
            <>No se pudo guardar. Revisá los campos obligatorios.</>
          ) : (
            <>
              <Check size={16} />
              Sitio actualizado correctamente
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sidebar sub-components                                            */
/* ------------------------------------------------------------------ */

function SidebarHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-1">
      <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{description}</p>
    </div>
  )
}

function BuilderField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[#334155]">
      {label}
      {children}
    </label>
  )
}

function CollapsibleFields({ children }: { children: ReactNode }) {
  return (
    <div className="ml-3 space-y-3 border-l-2 border-[#E0F2FE] pl-4 pt-1">
      {children}
    </div>
  )
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#FAFBFC]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
      >
        <span className="text-sm font-semibold text-[#0F172A]">{title}</span>
        <ChevronDown
          size={15}
          className={cn('text-[#94A3B8] transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </div>
  )
}

function ToggleCard({
  name,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  name: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3.5 transition',
        checked
          ? 'border-[rgba(8,145,178,0.2)] bg-[#F0F9FF]'
          : 'border-[rgba(15,23,42,0.06)] bg-white hover:border-[rgba(8,145,178,0.15)]',
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">{description}</p>
      </div>

      <span
        className={cn(
          'inline-flex h-6 w-10 shrink-0 rounded-full border p-0.5 transition',
          checked
            ? 'justify-end border-transparent bg-[#0891B2]'
            : 'justify-start border-[rgba(15,23,42,0.1)] bg-[#E5E7EB]',
        )}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
      </span>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  )
}

function HeroVariantCard({
  value,
  checked,
  onChange,
}: {
  value: WebsiteHeroVariant
  checked: boolean
  onChange: (value: WebsiteHeroVariant) => void
}) {
  const meta = websiteHeroVariantMeta[value]
  const shortLabel =
    value === 'split' ? 'Split' : value === 'centered' ? 'Centro' : 'Inmersivo'

  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="heroVariant"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />

      <div
        className={cn(
          'rounded-xl border p-3 text-center transition',
          checked
            ? 'border-[rgba(8,145,178,0.3)] bg-[#F0F9FF] shadow-sm'
            : 'border-[rgba(15,23,42,0.06)] bg-white hover:border-[rgba(8,145,178,0.18)]',
        )}
      >
        {/* Mini layout preview */}
        <div
          className={cn(
            'mx-auto mb-2 h-12 w-full rounded-lg p-1.5',
            value === 'immersive' ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]',
          )}
        >
          <div
            className={cn(
              'flex h-full gap-1.5 rounded-md p-1',
              value === 'split'
                ? 'flex-row'
                : value === 'centered'
                  ? 'flex-col items-center justify-center'
                  : 'flex-col justify-center',
            )}
          >
            {value === 'split' ? (
              <>
                <div className="flex flex-1 flex-col justify-center gap-1">
                  <span className="h-1.5 w-8 rounded-full bg-[#0F172A]" />
                  <span className="h-1 w-6 rounded-full bg-[#94A3B8]" />
                </div>
                <span className="w-5 rounded bg-[#E0F2FE]" />
              </>
            ) : value === 'centered' ? (
              <>
                <span className="h-1.5 w-8 rounded-full bg-[#0F172A]" />
                <span className="h-1 w-6 rounded-full bg-[#94A3B8]" />
              </>
            ) : (
              <>
                <span className="h-1.5 w-10 rounded-full bg-white" />
                <span className="h-1 w-7 rounded-full bg-white/50" />
              </>
            )}
          </div>
        </div>

        <p className="text-xs font-semibold text-[#0F172A]">{shortLabel}</p>
        {checked && (
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0891B2]">
            <Check size={10} /> Activa
          </span>
        )}
      </div>
    </label>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-[#0891B2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E7490] disabled:opacity-70"
    >
      {pending ? (
        <>
          <Wand2 size={14} className="animate-pulse" />
          Guardando...
        </>
      ) : (
        <>
          Guardar
          <ArrowRight size={14} />
        </>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function buildBuilderState(settings: WebsiteSettings): WebsiteBuilderState {
  return {
    siteTitle: settings.siteTitle,
    siteTagline: settings.siteTagline ?? '',
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle ?? '',
    heroCtaLabel: settings.heroCtaLabel,
    heroVariant: settings.heroVariant,
    navigationMode: settings.navigationMode,
    featuredLimit: String(settings.featuredLimit),
    showSaleLink: settings.showSaleLink,
    showRentLink: settings.showRentLink,
    showTemporaryLink: settings.showTemporaryLink,
    showFeaturedProperties: settings.showFeaturedProperties,
    showRecentProperties: settings.showRecentProperties,
    featuredSectionTitle: settings.featuredSectionTitle,
    featuredSectionBody: settings.featuredSectionBody ?? '',
    showHighlightSection: settings.showHighlightSection,
    highlightTitle: settings.highlightTitle,
    highlightBody: settings.highlightBody,
    highlightCtaLabel: settings.highlightCtaLabel,
    recentSectionTitle: settings.recentSectionTitle,
    recentSectionBody: settings.recentSectionBody ?? '',
    showFinalCta: settings.showFinalCta,
    finalCtaTitle: settings.finalCtaTitle,
    finalCtaBody: settings.finalCtaBody,
    finalCtaLabel: settings.finalCtaLabel,
    servicesTitle: settings.servicesTitle,
    servicesBody: settings.servicesBody,
    aboutTitle: settings.aboutTitle,
    aboutBody: settings.aboutBody,
    contactTitle: settings.contactTitle,
    contactBody: settings.contactBody,
  }
}

function updateField<K extends keyof WebsiteBuilderState>(
  setState: Dispatch<SetStateAction<WebsiteBuilderState>>,
  key: K,
  value: WebsiteBuilderState[K],
) {
  setState((current) => ({ ...current, [key]: value }))
}

function buildNavigationItems(state: WebsiteBuilderState) {
  const items = ['Inicio', 'Propiedades']

  if (state.navigationMode === 'operaciones') {
    if (state.showSaleLink) items.push('En venta')
    if (state.showRentLink) items.push('En alquiler')
    if (state.showTemporaryLink) items.push('Temporario')
  }

  items.push('Servicios', 'Nosotros', 'Contacto')
  return items
}
