import 'server-only'

import { cache } from 'react'

import type { Agency } from '@/lib/agencies'
import type {
  PublicInquiryFormValues,
  WebsiteBrandingFormValues,
  WebsiteContentFormValues,
  WebsiteHeroVariant,
  WebsiteNavigationMode,
  WebsiteThemePreset,
} from '@/lib/website/schema'
import {
  assertNoSupabaseError,
  isSupabaseDuplicateError,
  requireSupabaseData,
} from '@/lib/supabase/repository'
import { createClient } from '@/utils/supabase/server'

interface WebsiteSettingsRow {
  agency_id: string
  site_title: string
  site_tagline: string | null
  hero_title: string
  hero_subtitle: string | null
  hero_cta_label: string
  services_title: string
  services_body: string
  about_title: string
  about_body: string
  contact_title: string
  contact_body: string
  primary_phone: string | null
  whatsapp_phone: string | null
  public_email: string | null
  lead_email: string | null
  address: string | null
  instagram_url: string | null
  facebook_url: string | null
  theme_preset: WebsiteThemePreset
  primary_color: string
  accent_color: string
  hero_variant: WebsiteHeroVariant
  navigation_mode: WebsiteNavigationMode
  show_sale_link: boolean | number
  show_rent_link: boolean | number
  show_temporary_link: boolean | number
  show_featured_properties: boolean | number
  show_recent_properties: boolean | number
  featured_limit: number
  featured_section_title: string
  featured_section_body: string | null
  show_highlight_section: boolean | number
  highlight_title: string
  highlight_body: string
  highlight_cta_label: string
  recent_section_title: string
  recent_section_body: string | null
  show_final_cta: boolean | number
  final_cta_title: string
  final_cta_body: string
  final_cta_label: string
  created_at: string
  updated_at: string
}

export type InquirySource = 'general' | 'propiedad'
export type InquiryStatus = 'nueva' | 'leida' | 'respondida'

interface InquiryRow {
  id: string
  full_name: string
  email: string
  phone: string | null
  message: string
  source: InquirySource
  status: InquiryStatus
  page_path: string
  created_at: string
  properties: Array<{ title: string }> | null
}

export interface WebsiteSettings {
  agencyId: string
  siteTitle: string
  siteTagline?: string
  heroTitle: string
  heroSubtitle?: string
  heroCtaLabel: string
  servicesTitle: string
  servicesBody: string
  aboutTitle: string
  aboutBody: string
  contactTitle: string
  contactBody: string
  primaryPhone?: string
  whatsappPhone?: string
  publicEmail?: string
  leadEmail?: string
  address?: string
  instagramUrl?: string
  facebookUrl?: string
  themePreset: WebsiteThemePreset
  primaryColor: string
  accentColor: string
  heroVariant: WebsiteHeroVariant
  navigationMode: WebsiteNavigationMode
  showSaleLink: boolean
  showRentLink: boolean
  showTemporaryLink: boolean
  showFeaturedProperties: boolean
  showRecentProperties: boolean
  featuredLimit: number
  featuredSectionTitle: string
  featuredSectionBody?: string
  showHighlightSection: boolean
  highlightTitle: string
  highlightBody: string
  highlightCtaLabel: string
  recentSectionTitle: string
  recentSectionBody?: string
  showFinalCta: boolean
  finalCtaTitle: string
  finalCtaBody: string
  finalCtaLabel: string
  createdAt: string
  updatedAt: string
}

export interface InquiryListItem {
  id: string
  fullName: string
  email: string
  phone?: string
  message: string
  source: InquirySource
  status: InquiryStatus
  pagePath: string
  propertyTitle?: string
  createdAt: string
}

function mapWebsiteSettingsRow(row: WebsiteSettingsRow): WebsiteSettings {
  return {
    agencyId: row.agency_id,
    siteTitle: row.site_title,
    siteTagline: row.site_tagline ?? undefined,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle ?? undefined,
    heroCtaLabel: row.hero_cta_label,
    servicesTitle: row.services_title,
    servicesBody: row.services_body,
    aboutTitle: row.about_title,
    aboutBody: row.about_body,
    contactTitle: row.contact_title,
    contactBody: row.contact_body,
    primaryPhone: row.primary_phone ?? undefined,
    whatsappPhone: row.whatsapp_phone ?? undefined,
    publicEmail: row.public_email ?? undefined,
    leadEmail: row.lead_email ?? undefined,
    address: row.address ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    facebookUrl: row.facebook_url ?? undefined,
    themePreset: row.theme_preset,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    heroVariant: row.hero_variant,
    navigationMode: row.navigation_mode,
    showSaleLink: Boolean(row.show_sale_link),
    showRentLink: Boolean(row.show_rent_link),
    showTemporaryLink: Boolean(row.show_temporary_link),
    showFeaturedProperties: Boolean(row.show_featured_properties),
    showRecentProperties: Boolean(row.show_recent_properties),
    featuredLimit: row.featured_limit,
    featuredSectionTitle: row.featured_section_title,
    featuredSectionBody: row.featured_section_body ?? undefined,
    showHighlightSection: Boolean(row.show_highlight_section),
    highlightTitle: row.highlight_title,
    highlightBody: row.highlight_body,
    highlightCtaLabel: row.highlight_cta_label,
    recentSectionTitle: row.recent_section_title,
    recentSectionBody: row.recent_section_body ?? undefined,
    showFinalCta: Boolean(row.show_final_cta),
    finalCtaTitle: row.final_cta_title,
    finalCtaBody: row.final_cta_body,
    finalCtaLabel: row.final_cta_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapInquiryRow(row: InquiryRow): InquiryListItem {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message,
    source: row.source,
    status: row.status,
    pagePath: row.page_path,
    propertyTitle: row.properties?.[0]?.title ?? undefined,
    createdAt: row.created_at,
  }
}

function buildDefaultWebsiteSettings(agency: Agency): WebsiteSettings {
  return {
    agencyId: agency.id,
    siteTitle: agency.name,
    siteTagline: 'Propiedades, asesoramiento y presencia digital con identidad propia.',
    heroTitle: 'Tu vidriera inmobiliaria profesional, clara y lista para captar consultas.',
    heroSubtitle:
      'Mostrá venta, alquiler anual y temporario con una experiencia más moderna, rápida y confiable para tus clientes.',
    heroCtaLabel: 'Ver propiedades',
    servicesTitle: 'Servicios destacados',
    servicesBody:
      'Publicación profesional de propiedades\nAcompañamiento comercial cercano\nTasaciones y consultas personalizadas',
    aboutTitle: 'Una inmobiliaria cercana, visualmente cuidada y lista para responder rápido.',
    aboutBody:
      'Inmos.ia parte de una base simple: propiedades bien presentadas, navegación clara y contacto visible desde el primer día.\n\nEsta base está pensada para que la inmobiliaria salga con una web seria, configurable y alineada al panel de carga.',
    contactTitle: 'Conversemos sobre la propiedad que estás buscando',
    contactBody:
      'Podés escribirnos desde el formulario o usar los canales directos visibles en esta página. La consulta queda registrada para seguimiento interno.',
    primaryPhone: undefined,
    whatsappPhone: undefined,
    publicEmail: undefined,
    leadEmail: undefined,
    address: undefined,
    instagramUrl: undefined,
    facebookUrl: undefined,
    themePreset: 'brisa',
    primaryColor: '#0891B2',
    accentColor: '#0F172A',
    heroVariant: 'split',
    navigationMode: 'simple',
    showSaleLink: true,
    showRentLink: true,
    showTemporaryLink: true,
    showFeaturedProperties: true,
    showRecentProperties: true,
    featuredLimit: 3,
    featuredSectionTitle: 'Propiedades destacadas',
    featuredSectionBody:
      'Una selección inicial para abrir el catálogo con las propiedades que mejor representan a la inmobiliaria.',
    showHighlightSection: true,
    highlightTitle: 'Una presencia digital más clara, confiable y lista para captar consultas.',
    highlightBody:
      'La home ya puede combinar identidad visual, propiedades reales y llamados a la acción visibles. Esta capa de personalización apunta a que cada cliente sienta el sitio más propio sin perder velocidad de salida.',
    highlightCtaLabel: 'Hablar con la inmobiliaria',
    recentSectionTitle: 'Últimas incorporaciones',
    recentSectionBody:
      'Novedades publicadas recientemente para mantener la portada viva y transmitir movimiento comercial.',
    showFinalCta: true,
    finalCtaTitle: 'Coordinemos una búsqueda o una visita con tu próximo cliente.',
    finalCtaBody:
      'El sitio ya tiene consultas conectadas al panel. Sumando identidad y bloques editables, la experiencia se siente mucho más cercana a la marca de cada inmobiliaria.',
    finalCtaLabel: 'Quiero hacer una consulta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function buildWebsiteSettingsPayload(settings: WebsiteSettings) {
  return {
    agency_id: settings.agencyId,
    site_title: settings.siteTitle,
    site_tagline: settings.siteTagline ?? null,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle ?? null,
    hero_cta_label: settings.heroCtaLabel,
    services_title: settings.servicesTitle,
    services_body: settings.servicesBody,
    about_title: settings.aboutTitle,
    about_body: settings.aboutBody,
    contact_title: settings.contactTitle,
    contact_body: settings.contactBody,
    primary_phone: settings.primaryPhone ?? null,
    whatsapp_phone: settings.whatsappPhone ?? null,
    public_email: settings.publicEmail ?? null,
    lead_email: settings.leadEmail ?? null,
    address: settings.address ?? null,
    instagram_url: settings.instagramUrl ?? null,
    facebook_url: settings.facebookUrl ?? null,
    theme_preset: settings.themePreset,
    primary_color: settings.primaryColor,
    accent_color: settings.accentColor,
    hero_variant: settings.heroVariant,
    navigation_mode: settings.navigationMode,
    show_sale_link: settings.showSaleLink ? 1 : 0,
    show_rent_link: settings.showRentLink ? 1 : 0,
    show_temporary_link: settings.showTemporaryLink ? 1 : 0,
    show_featured_properties: settings.showFeaturedProperties ? 1 : 0,
    show_recent_properties: settings.showRecentProperties ? 1 : 0,
    featured_limit: settings.featuredLimit,
    featured_section_title: settings.featuredSectionTitle,
    featured_section_body: settings.featuredSectionBody ?? null,
    show_highlight_section: settings.showHighlightSection ? 1 : 0,
    highlight_title: settings.highlightTitle,
    highlight_body: settings.highlightBody,
    highlight_cta_label: settings.highlightCtaLabel,
    recent_section_title: settings.recentSectionTitle,
    recent_section_body: settings.recentSectionBody ?? null,
    show_final_cta: settings.showFinalCta ? 1 : 0,
    final_cta_title: settings.finalCtaTitle,
    final_cta_body: settings.finalCtaBody,
    final_cta_label: settings.finalCtaLabel,
    created_at: settings.createdAt,
    updated_at: settings.updatedAt,
  }
}

const getWebsiteSettingsByAgency = cache(
  async (agencyId: string, agencyName: string): Promise<WebsiteSettings> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('agency_id', agencyId)
      .maybeSingle()

    assertNoSupabaseError(error, 'No se pudo leer la configuración del sitio')

    if (data) {
      return mapWebsiteSettingsRow(data as WebsiteSettingsRow)
    }

    const defaults = buildDefaultWebsiteSettings({
      id: agencyId,
      name: agencyName,
      slug: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const insertPayload = buildWebsiteSettingsPayload(defaults)
    const { data: insertedData, error: insertError } = await supabase
      .from('website_settings')
      .insert(insertPayload)
      .select('*')
      .single()

    if (isSupabaseDuplicateError(insertError)) {
      const { data: duplicatedData, error: duplicatedError } = await supabase
        .from('website_settings')
        .select('*')
        .eq('agency_id', agencyId)
        .single()

      assertNoSupabaseError(
        duplicatedError,
        'No se pudo recuperar la configuración del sitio luego del bootstrap',
      )

      return mapWebsiteSettingsRow(
        requireSupabaseData(
          duplicatedData as WebsiteSettingsRow | null,
          'Supabase no devolvió la configuración de sitio ya existente.',
        ),
      )
    }

    assertNoSupabaseError(insertError, 'No se pudo crear la configuración inicial del sitio')

    return mapWebsiteSettingsRow(
      requireSupabaseData(
        insertedData as WebsiteSettingsRow | null,
        'Supabase no devolvió la configuración del sitio recién creada.',
      ),
    )
  },
)

export function getWebsiteSettings(agency: Agency) {
  return getWebsiteSettingsByAgency(agency.id, agency.name)
}

export async function updateWebsiteContent(
  agency: Agency,
  values: WebsiteContentFormValues,
) {
  await getWebsiteSettings(agency)
  const supabase = await createClient()
  const { error } = await supabase
    .from('website_settings')
    .update({
      site_title: values.siteTitle,
      site_tagline: values.siteTagline ?? null,
      hero_title: values.heroTitle,
      hero_subtitle: values.heroSubtitle ?? null,
      hero_cta_label: values.heroCtaLabel,
      hero_variant: values.heroVariant,
      services_title: values.servicesTitle,
      services_body: values.servicesBody,
      about_title: values.aboutTitle,
      about_body: values.aboutBody,
      featured_section_title: values.featuredSectionTitle,
      featured_section_body: values.featuredSectionBody ?? null,
      show_highlight_section: values.showHighlightSection ? 1 : 0,
      highlight_title: values.highlightTitle,
      highlight_body: values.highlightBody,
      highlight_cta_label: values.highlightCtaLabel,
      recent_section_title: values.recentSectionTitle,
      recent_section_body: values.recentSectionBody ?? null,
      show_final_cta: values.showFinalCta ? 1 : 0,
      final_cta_title: values.finalCtaTitle,
      final_cta_body: values.finalCtaBody,
      final_cta_label: values.finalCtaLabel,
      contact_title: values.contactTitle,
      contact_body: values.contactBody,
      navigation_mode: values.navigationMode,
      show_sale_link: values.showSaleLink ? 1 : 0,
      show_rent_link: values.showRentLink ? 1 : 0,
      show_temporary_link: values.showTemporaryLink ? 1 : 0,
      show_featured_properties: values.showFeaturedProperties ? 1 : 0,
      show_recent_properties: values.showRecentProperties ? 1 : 0,
      featured_limit: values.featuredLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('agency_id', agency.id)

  assertNoSupabaseError(error, 'No se pudo actualizar el contenido del sitio')
}

export async function updateWebsiteBranding(
  agency: Agency,
  values: WebsiteBrandingFormValues,
) {
  await getWebsiteSettings(agency)
  const supabase = await createClient()
  const { error } = await supabase
    .from('website_settings')
    .update({
      primary_phone: values.primaryPhone ?? null,
      whatsapp_phone: values.whatsappPhone ?? null,
      public_email: values.publicEmail ?? null,
      lead_email: values.leadEmail ?? null,
      address: values.address ?? null,
      instagram_url: values.instagramUrl ?? null,
      facebook_url: values.facebookUrl ?? null,
      theme_preset: values.themePreset,
      primary_color: values.primaryColor,
      accent_color: values.accentColor,
      updated_at: new Date().toISOString(),
    })
    .eq('agency_id', agency.id)

  assertNoSupabaseError(error, 'No se pudo actualizar la configuración general del sitio')
}

export async function createInquiry(agencyId: string, values: PublicInquiryFormValues) {
  const supabase = await createClient()
  let propertyId: string | null = null
  const now = new Date().toISOString()

  if (values.propertyId) {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('id', values.propertyId)
      .maybeSingle()

    assertNoSupabaseError(error, 'No se pudo validar la propiedad asociada a la consulta')
    propertyId = data?.id ?? null
  }

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      agency_id: agencyId,
      property_id: propertyId,
      full_name: values.fullName,
      email: values.email,
      phone: values.phone ?? null,
      message: values.message,
      source: values.source,
      page_path: values.pagePath,
      status: 'nueva',
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  assertNoSupabaseError(error, 'No se pudo guardar la consulta')

  return requireSupabaseData(
    data as { id: string } | null,
    'Supabase no devolvió la consulta creada.',
  ).id
}

export async function getInquiries(agencyId: string, limit?: number) {
  const supabase = await createClient()
  let query = supabase
    .from('inquiries')
    .select('id, full_name, email, phone, message, source, status, page_path, created_at, properties(title)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })

  if (typeof limit === 'number' && limit > 0) {
    query = query.limit(Math.floor(limit))
  }

  const { data, error } = await query

  assertNoSupabaseError(error, 'No se pudieron cargar las consultas')

  return (data ?? []).map((row) => mapInquiryRow(row as InquiryRow))
}

export async function updateInquiryStatus(
  agencyId: string,
  inquiryId: string,
  status: InquiryStatus,
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('agency_id', agencyId)
    .eq('id', inquiryId)
    .select('id')
    .maybeSingle()

  assertNoSupabaseError(error, 'No se pudo actualizar el estado de la consulta')

  return requireSupabaseData(
    data as { id: string } | null,
    'La consulta que intentás actualizar ya no existe o no pertenece a la agencia activa.',
  ).id
}
