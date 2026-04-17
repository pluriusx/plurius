import { z } from 'zod'

export const websiteNavigationModeValues = ['simple', 'operaciones'] as const
export const websiteThemePresetValues = ['brisa', 'editorial', 'nocturno'] as const
export const websiteHeroVariantValues = ['split', 'centered', 'immersive'] as const

export type WebsiteNavigationMode = (typeof websiteNavigationModeValues)[number]
export type WebsiteThemePreset = (typeof websiteThemePresetValues)[number]
export type WebsiteHeroVariant = (typeof websiteHeroVariantValues)[number]

function requiredText(label: string, maxLength: number, minimumLength = 1) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z
      .string({
        required_error: `${label} es obligatorio`,
        invalid_type_error: `${label} es obligatorio`,
      })
      .min(minimumLength, `${label} es obligatorio`)
      .max(maxLength, `${label} no puede superar ${maxLength} caracteres`),
  )
}

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined
      }

      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z
      .string({
        invalid_type_error: 'Valor inválido',
      })
      .max(maxLength, `No puede superar ${maxLength} caracteres`)
      .optional(),
  )
}

function optionalEmail() {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined
      }

      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z
      .string({
        invalid_type_error: 'Email inválido',
      })
      .email('Ingresá un email válido')
      .optional(),
  )
}

function optionalUrl() {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined
      }

      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z
      .string({
        invalid_type_error: 'URL inválida',
      })
      .url('Ingresá una URL válida')
      .optional(),
  )
}

function checkboxValue() {
  return z.preprocess(
    (value) =>
      value === true ||
      value === 'true' ||
      value === 'on' ||
      value === 1 ||
      value === '1',
    z.boolean(),
  )
}

function integerRange(label: string, minimum: number, maximum: number) {
  return z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined
      }

      if (typeof value === 'number') {
        return Number.isNaN(value) ? undefined : value
      }

      const parsed = Number(value)
      return Number.isNaN(parsed) ? value : parsed
    },
    z
      .number({
        required_error: `${label} es obligatorio`,
        invalid_type_error: `${label} debe ser numérico`,
      })
      .int(`${label} debe ser entero`)
      .min(minimum, `${label} debe ser al menos ${minimum}`)
      .max(maximum, `${label} no puede superar ${maximum}`),
  )
}

function colorValue(label: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z
      .string({
        required_error: `${label} es obligatorio`,
        invalid_type_error: `${label} es obligatorio`,
      })
      .regex(/^#[0-9a-fA-F]{6}$/, `${label} debe ser un color hexadecimal válido`),
  )
}

export const websiteContentFormSchema = z.object({
  siteTitle: requiredText('El nombre del sitio', 120, 2),
  siteTagline: optionalText(180),
  heroTitle: requiredText('El título principal', 180, 6),
  heroSubtitle: optionalText(480),
  heroCtaLabel: requiredText('El CTA principal', 40, 2),
  heroVariant: z.enum(websiteHeroVariantValues),
  servicesTitle: requiredText('El título de servicios', 120, 3),
  servicesBody: requiredText('El contenido de servicios', 2000, 20),
  aboutTitle: requiredText('El título de nosotros', 120, 3),
  aboutBody: requiredText('El contenido de nosotros', 2500, 20),
  featuredSectionTitle: requiredText('El título de destacadas', 120, 3),
  featuredSectionBody: optionalText(320),
  showHighlightSection: checkboxValue(),
  highlightTitle: requiredText('El título del bloque diferencial', 160, 6),
  highlightBody: requiredText('El contenido del bloque diferencial', 1600, 20),
  highlightCtaLabel: requiredText('El CTA del bloque diferencial', 40, 2),
  recentSectionTitle: requiredText('El título de recientes', 120, 3),
  recentSectionBody: optionalText(320),
  showFinalCta: checkboxValue(),
  finalCtaTitle: requiredText('El título del CTA final', 160, 6),
  finalCtaBody: requiredText('El contenido del CTA final', 1600, 20),
  finalCtaLabel: requiredText('El botón del CTA final', 40, 2),
  contactTitle: requiredText('El título de contacto', 120, 3),
  contactBody: requiredText('El contenido de contacto', 1500, 12),
  navigationMode: z.enum(websiteNavigationModeValues),
  showSaleLink: checkboxValue(),
  showRentLink: checkboxValue(),
  showTemporaryLink: checkboxValue(),
  showFeaturedProperties: checkboxValue(),
  showRecentProperties: checkboxValue(),
  featuredLimit: integerRange('La cantidad de destacadas', 1, 12),
})

export const websiteBrandingFormSchema = z.object({
  primaryPhone: optionalText(40),
  whatsappPhone: optionalText(40),
  publicEmail: optionalEmail(),
  leadEmail: optionalEmail(),
  address: optionalText(180),
  instagramUrl: optionalUrl(),
  facebookUrl: optionalUrl(),
  themePreset: z.enum(websiteThemePresetValues),
  primaryColor: colorValue('El color principal'),
  accentColor: colorValue('El color secundario'),
})

export const publicInquiryFormSchema = z.object({
  fullName: requiredText('El nombre', 120, 3),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z
      .string({
        required_error: 'El email es obligatorio',
        invalid_type_error: 'El email es obligatorio',
      })
      .email('Ingresá un email válido'),
  ),
  phone: optionalText(40),
  message: requiredText('El mensaje', 3000, 10),
  propertyId: optionalText(120),
  source: z.enum(['general', 'propiedad']),
  pagePath: requiredText('La página de origen', 260, 2),
})

export type WebsiteContentFormValues = z.infer<typeof websiteContentFormSchema>
export type WebsiteBrandingFormValues = z.infer<typeof websiteBrandingFormSchema>
export type PublicInquiryFormValues = z.infer<typeof publicInquiryFormSchema>
