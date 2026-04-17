import { ArrowRight, Building2, ChevronRight, MessageSquareText, Sparkles } from 'lucide-react'
import Link from 'next/link'

import type { PropertyListItem, PropertyOperation } from '@/lib/properties/schema'
import { propertyOperationLabels } from '@/lib/properties/schema'
import type { WebsiteSettings } from '@/lib/website/repository'
import { buildWhatsAppUrl, hexToRgba, splitLines, splitParagraphs } from '@/lib/website/utils'

import { PublicPropertyCard } from './public-property-card'

interface PublicPortalHomeProps {
  agencySlug: string
  agencyName: string
  settings: WebsiteSettings
  publishedProperties: PropertyListItem[]
}

const heroVariantLabels: Record<WebsiteSettings['heroVariant'], string> = {
  split: 'Split',
  centered: 'Centrado',
  immersive: 'Inmersivo',
}

export function PublicPortalHome({
  agencySlug,
  agencyName,
  settings,
  publishedProperties,
}: PublicPortalHomeProps) {
  const featuredProperties = settings.showFeaturedProperties
    ? publishedProperties.slice(0, settings.featuredLimit)
    : []
  const recentProperties = settings.showRecentProperties ? publishedProperties.slice(0, 6) : []
  const services = splitLines(settings.servicesBody)
  const aboutParagraphs = splitParagraphs(settings.aboutBody)
  const operationCounts = publishedProperties.reduce<Record<PropertyOperation, number>>(
    (accumulator, property) => {
      accumulator[property.operation] += 1
      return accumulator
    },
    {
      venta: 0,
      alquiler_anual: 0,
      alquiler_temporario: 0,
    },
  )
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappPhone,
    `Hola ${agencyName}, quiero hacer una consulta desde la web.`,
  )
  const primaryActionHref = `/portal/${agencySlug}/propiedades`
  const contactHref = `/portal/${agencySlug}/contacto`
  const supportHref = whatsappHref ?? contactHref

  return (
    <div className="space-y-14 py-8">
      <HeroSection
        agencySlug={agencySlug}
        settings={settings}
        operationCounts={operationCounts}
        supportHref={supportHref}
        primaryActionHref={primaryActionHref}
      />

      {settings.showFeaturedProperties ? (
        <FeaturedSection
          agencySlug={agencySlug}
          settings={settings}
          properties={featuredProperties}
          primaryActionHref={primaryActionHref}
          contactHref={contactHref}
        />
      ) : null}

      {settings.showHighlightSection ? (
        <HighlightSection
          settings={settings}
          contactHref={contactHref}
          supportHref={supportHref}
          operationCounts={operationCounts}
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
            Servicios
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0F172A]">
            {settings.servicesTitle}
          </h2>
          <div className="mt-6 space-y-3">
            {services.map((service) => (
              <div
                key={service}
                className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-4 py-4 text-sm font-medium text-[#334155]"
              >
                {service}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-[#0F172A] p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Nosotros
          </p>
          <h2 className="mt-3 text-3xl font-semibold">{settings.aboutTitle}</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={`/portal/${agencySlug}/nosotros`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            Ver sección completa
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {settings.showRecentProperties ? (
        <RecentSection
          agencySlug={agencySlug}
          settings={settings}
          properties={recentProperties}
          primaryActionHref={primaryActionHref}
        />
      ) : null}

      {settings.showFinalCta ? (
        <FinalCtaSection
          settings={settings}
          supportHref={supportHref}
          contactHref={contactHref}
        />
      ) : null}
    </div>
  )
}

function HeroSection({
  agencySlug,
  settings,
  operationCounts,
  supportHref,
  primaryActionHref,
}: {
  agencySlug: string
  settings: WebsiteSettings
  operationCounts: Record<PropertyOperation, number>
  supportHref: string
  primaryActionHref: string
}) {
  const subtitle =
    settings.heroSubtitle ??
    settings.siteTagline ??
    'Mostrá propiedades y recibí consultas desde una web clara, rápida y alineada a tu marca.'

  if (settings.heroVariant === 'centered') {
    return (
      <section className="relative overflow-hidden rounded-[40px] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-14 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-10 lg:px-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top, rgba(8,145,178,0.08), transparent 42%), radial-gradient(circle at bottom right, rgba(15,23,42,0.08), transparent 35%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <span
            className="inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background: hexToRgba(settings.primaryColor, 0.12),
              color: settings.primaryColor,
            }}
          >
            Portal público conectado al admin
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            {settings.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#475569]">{subtitle}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={primaryActionHref}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: settings.primaryColor }}
            >
              {settings.heroCtaLabel}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={supportHref}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[rgba(15,23,42,0.2)]"
            >
              Contactar ahora
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {([
              { key: 'venta', icon: Sparkles },
              { key: 'alquiler_anual', icon: Building2 },
              { key: 'alquiler_temporario', icon: MessageSquareText },
            ] as const).map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-5 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Icon size={18} className="text-[#0F172A]" />
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                      {heroVariantLabels[settings.heroVariant]}
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                    {propertyOperationLabels[item.key]}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[#0F172A]">
                    {operationCounts[item.key]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (settings.heroVariant === 'immersive') {
    return (
      <section
        className="relative overflow-hidden rounded-[40px] border border-[rgba(15,23,42,0.08)] px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:px-10 lg:px-14"
        style={{
          background: `linear-gradient(135deg, ${settings.accentColor} 0%, ${settings.primaryColor} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-16 top-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center">
          <div className="space-y-6 text-white">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              {heroVariantLabels[settings.heroVariant]}
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/80">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={primaryActionHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-transform hover:-translate-y-0.5"
              >
                {settings.heroCtaLabel}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={supportHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Contactar ahora
              </Link>
            </div>
          </div>

          <div className="relative rounded-[32px] border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
            <div className="rounded-[26px] border border-white/10 bg-[#0F172A]/35 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Hoy en la web
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {publishedCountLabel(operationCounts)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                La home ya consume datos reales del panel. Todo lo que esté en estado publicada
                puede aparecer acá.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {([
                { key: 'venta', icon: Sparkles },
                { key: 'alquiler_anual', icon: Building2 },
                { key: 'alquiler_temporario', icon: MessageSquareText },
              ] as const).map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.key}
                    className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur"
                  >
                    <Icon size={18} />
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
                      {propertyOperationLabels[item.key]}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{operationCounts[item.key]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
      <div className="space-y-6">
        <span
          className="inline-flex rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{
            background: hexToRgba(settings.primaryColor, 0.12),
            color: settings.primaryColor,
          }}
        >
          Portal público conectado al admin
        </span>

        <div className="space-y-4">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#475569]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={primaryActionHref}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: settings.primaryColor }}
          >
            {settings.heroCtaLabel}
            <ArrowRight size={16} />
          </Link>

          <Link
            href={buildContactHref(agencySlug)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[rgba(15,23,42,0.2)]"
          >
            Dejar una consulta
          </Link>

          {supportHref !== buildContactHref(agencySlug) ? (
            <Link
              href={supportHref}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                background: hexToRgba(settings.primaryColor, 0.1),
                color: settings.primaryColor,
              }}
            >
              WhatsApp directo
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-[32px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div
          className="rounded-[24px] p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Hoy en la web
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {publishedCountLabel(operationCounts)}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80">
            La home ya consume datos reales del panel. Todo lo que esté en estado publicada puede
            aparecer acá.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {([
            { key: 'venta', icon: Sparkles },
            { key: 'alquiler_anual', icon: Building2 },
            { key: 'alquiler_temporario', icon: MessageSquareText },
          ] as const).map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.key}
                className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-4"
              >
                <Icon size={18} className="text-[#0F172A]" />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  {propertyOperationLabels[item.key]}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#0F172A]">
                  {operationCounts[item.key]}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeaturedSection({
  agencySlug,
  settings,
  properties,
  primaryActionHref,
  contactHref,
}: {
  agencySlug: string
  settings: WebsiteSettings
  properties: PropertyListItem[]
  primaryActionHref: string
  contactHref: string
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
            Destacadas
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#0F172A]">
            {settings.featuredSectionTitle}
          </h2>
          {settings.featuredSectionBody ? (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#475569]">
              {settings.featuredSectionBody}
            </p>
          ) : null}
        </div>
        <Link
          href={primaryActionHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0891B2] transition-colors hover:text-[#0E7490]"
        >
          Ver todo el catálogo
          <ChevronRight size={16} />
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {properties.map((property) => (
            <PublicPropertyCard
              key={property.id}
              agencySlug={agencySlug}
              property={property}
              primaryColor={settings.primaryColor}
              accentColor={settings.accentColor}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[rgba(15,23,42,0.16)] bg-white/80 p-8">
          <p className="text-sm font-semibold text-[#0F172A]">
            Publicá propiedades para activar esta sección
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#475569]">
            La estructura de destacadas ya está lista. Cuando haya propiedades publicadas, el sitio
            las mostrará acá con la identidad visual de la inmobiliaria.
          </p>
          <Link
            href={contactHref}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0891B2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
          >
            Ir a contacto
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  )
}

function HighlightSection({
  settings,
  contactHref,
  supportHref,
  operationCounts,
}: {
  settings: WebsiteSettings
  contactHref: string
  supportHref: string
  operationCounts: Record<PropertyOperation, number>
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[36px] border border-[rgba(15,23,42,0.08)] px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-8"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(settings.primaryColor, 0.08)} 0%, rgba(255,255,255,0.96) 55%, ${hexToRgba(settings.accentColor, 0.08)} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-16 top-[-48px] h-48 w-48 rounded-full blur-3xl"
          style={{ background: hexToRgba(settings.primaryColor, 0.18) }}
        />
        <div
          className="absolute bottom-[-64px] left-[-42px] h-56 w-56 rounded-full blur-3xl"
          style={{ background: hexToRgba(settings.accentColor, 0.12) }}
        />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
            Bloque diferencial
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
            {settings.highlightTitle}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[#475569]">{settings.highlightBody}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={supportHref}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: settings.primaryColor }}
            >
              {settings.highlightCtaLabel}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A]"
            >
              Ir al formulario
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Ritmo del portal
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {([
                { key: 'venta', icon: Sparkles },
                { key: 'alquiler_anual', icon: Building2 },
                { key: 'alquiler_temporario', icon: MessageSquareText },
              ] as const).map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-[20px] bg-[#F8FAFC] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                        style={{ background: settings.primaryColor }}
                      >
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {propertyOperationLabels[item.key]}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#64748B]">
                          {heroVariantLabels[settings.heroVariant]}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-[#0F172A]">
                      {operationCounts[item.key]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RecentSection({
  agencySlug,
  settings,
  properties,
  primaryActionHref,
}: {
  agencySlug: string
  settings: WebsiteSettings
  properties: PropertyListItem[]
  primaryActionHref: string
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
          Últimas publicaciones
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[#0F172A]">
          {settings.recentSectionTitle}
        </h2>
        {settings.recentSectionBody ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#475569]">
            {settings.recentSectionBody}
          </p>
        ) : null}
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {properties.map((property) => (
            <PublicPropertyCard
              key={property.id}
              agencySlug={agencySlug}
              property={property}
              primaryColor={settings.primaryColor}
              accentColor={settings.accentColor}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[rgba(15,23,42,0.14)] bg-white/80 p-8">
          <p className="text-sm font-semibold text-[#0F172A]">
            Las publicaciones recientes aparecerán acá cuando empieces a cargar contenido
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#475569]">
            Esta sección se mantiene visible para sostener la narrativa del sitio, incluso antes de
            tener muchas propiedades cargadas.
          </p>
          <Link
            href={primaryActionHref}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0891B2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0E7490]"
          >
            Ver catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  )
}

function FinalCtaSection({
  settings,
  supportHref,
  contactHref,
}: {
  settings: WebsiteSettings
  supportHref: string
  contactHref: string
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[36px] border border-[rgba(15,23,42,0.08)] px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:px-8"
      style={{
        background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 top-[-10px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-48px] left-[-20px] h-52 w-52 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            CTA final
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {settings.finalCtaTitle}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-white/80">{settings.finalCtaBody}</p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <Link
            href={supportHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-transform hover:-translate-y-0.5"
          >
            {settings.finalCtaLabel}
            <ArrowRight size={16} />
          </Link>
          <Link href={contactHref} className="inline-flex items-center justify-center text-sm font-semibold text-white/90">
            Ver formulario de contacto
          </Link>
        </div>
      </div>
    </section>
  )
}

function publishedCountLabel(operationCounts: Record<PropertyOperation, number>) {
  const total =
    operationCounts.venta + operationCounts.alquiler_anual + operationCounts.alquiler_temporario

  return total === 0
    ? 'Todavía no hay propiedades publicadas'
    : `${total} propiedades visibles para clientes`
}

function buildContactHref(agencySlug: string) {
  return `/portal/${agencySlug}/contacto`
}
