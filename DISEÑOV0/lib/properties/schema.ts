import { z } from 'zod'

export const propertyOperationValues = [
  'venta',
  'alquiler_anual',
  'alquiler_temporario',
] as const

export const propertyTypeValues = [
  'casa',
  'departamento',
  'duplex',
  'local',
  'terreno',
] as const

export const propertyCurrencyValues = ['ARS', 'USD'] as const

export const propertyStatusValues = [
  'borrador',
  'publicada',
  'reservada',
  'vendida',
  'alquilada',
] as const

export const propertyLocationModeValues = [
  'exacta',
  'aproximada',
  'oculta',
] as const

export type PropertyOperation = (typeof propertyOperationValues)[number]
export type PropertyType = (typeof propertyTypeValues)[number]
export type PropertyCurrency = (typeof propertyCurrencyValues)[number]
export type PropertyStatus = (typeof propertyStatusValues)[number]
export type PropertyLocationMode = (typeof propertyLocationModeValues)[number]

export const propertyOperationOptions: Array<{ value: PropertyOperation; label: string }> = [
  { value: 'venta', label: 'Venta' },
  { value: 'alquiler_anual', label: 'Alquiler anual' },
  { value: 'alquiler_temporario', label: 'Alquiler temporario' },
]

export const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'duplex', label: 'Dúplex' },
  { value: 'local', label: 'Local' },
  { value: 'terreno', label: 'Terreno' },
]

export const propertyCurrencyOptions: Array<{ value: PropertyCurrency; label: string }> = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' },
]

export const propertyStatusOptions: Array<{ value: PropertyStatus; label: string }> = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'reservada', label: 'Reservada' },
  { value: 'vendida', label: 'Vendida' },
  { value: 'alquilada', label: 'Alquilada' },
]

export const propertyLocationModeOptions: Array<{
  value: PropertyLocationMode
  label: string
}> = [
  { value: 'exacta', label: 'Exacta' },
  { value: 'aproximada', label: 'Aproximada' },
  { value: 'oculta', label: 'Oculta' },
]

export const propertyOperationLabels: Record<PropertyOperation, string> = {
  venta: 'Venta',
  alquiler_anual: 'Alquiler anual',
  alquiler_temporario: 'Alquiler temporario',
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  duplex: 'Dúplex',
  local: 'Local',
  terreno: 'Terreno',
}

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  borrador: 'Borrador',
  publicada: 'Publicada',
  reservada: 'Reservada',
  vendida: 'Vendida',
  alquilada: 'Alquilada',
}

export const propertyLocationModeLabels: Record<PropertyLocationMode, string> = {
  exacta: 'Exacta',
  aproximada: 'Aproximada',
  oculta: 'Oculta',
}

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

function requiredNumber(label: string) {
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
      .positive(`${label} debe ser mayor a 0`),
  )
}

function optionalNumber(label: string, integer = false) {
  const baseSchema = integer
    ? z
        .number({
          invalid_type_error: `${label} debe ser numérico`,
        })
        .int(`${label} debe ser un número entero`)
        .nonnegative(`${label} debe ser mayor o igual a 0`)
    : z
        .number({
          invalid_type_error: `${label} debe ser numérico`,
        })
        .nonnegative(`${label} debe ser mayor o igual a 0`)

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
    baseSchema.optional(),
  )
}

export const propertyFormSchema = z.object({
  title: requiredText('El título', 160, 5),
  internalCode: requiredText('El código interno', 50, 2),
  operation: z.enum(propertyOperationValues),
  propertyType: z.enum(propertyTypeValues),
  price: requiredNumber('El precio'),
  currency: z.enum(propertyCurrencyValues),
  status: z.enum(propertyStatusValues),
  showPrice: z.boolean().default(true),
  address: requiredText('La dirección', 180, 3),
  city: requiredText('La ciudad', 120, 2),
  neighborhood: optionalText(120),
  locationMode: z.enum(propertyLocationModeValues),
  bedrooms: optionalNumber('Dormitorios', true),
  bathrooms: optionalNumber('Baños', true),
  coveredArea: optionalNumber('La superficie cubierta'),
  totalArea: optionalNumber('La superficie total'),
  description: optionalText(5000),
  slug: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return undefined
      }

      const normalized = slugify(value)
      return normalized === '' ? undefined : normalized
    },
    z
      .string()
      .max(160, 'El slug no puede superar 160 caracteres')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras, números y guiones')
      .optional(),
  ),
  metaTitle: optionalText(180),
  metaDescription: optionalText(260),
})

export type PropertyFormValues = z.infer<typeof propertyFormSchema>

export interface PropertyListItem {
  id: string
  title: string
  internalCode: string
  operation: PropertyOperation
  propertyType: PropertyType
  price: number
  currency: PropertyCurrency
  status: PropertyStatus
  showPrice: boolean
  address: string
  city: string
  neighborhood?: string | null
  locationMode: PropertyLocationMode
  bedrooms?: number | null
  bathrooms?: number | null
  coveredArea?: number | null
  totalArea?: number | null
  description?: string | null
  slug: string
  metaTitle?: string | null
  metaDescription?: string | null
  coverImageUrl?: string | null
  coverImageAlt?: string | null
  mediaCount?: number
  createdAt: string
  updatedAt: string
}

export function getPropertyFormValues(property: PropertyListItem): PropertyFormValues {
  return {
    title: property.title,
    internalCode: property.internalCode,
    operation: property.operation,
    propertyType: property.propertyType,
    price: property.price,
    currency: property.currency,
    status: property.status,
    showPrice: property.showPrice,
    address: property.address,
    city: property.city,
    neighborhood: property.neighborhood ?? undefined,
    locationMode: property.locationMode,
    bedrooms: property.bedrooms ?? undefined,
    bathrooms: property.bathrooms ?? undefined,
    coveredArea: property.coveredArea ?? undefined,
    totalArea: property.totalArea ?? undefined,
    description: property.description ?? undefined,
    slug: property.slug,
    metaTitle: property.metaTitle ?? undefined,
    metaDescription: property.metaDescription ?? undefined,
  }
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function formatPropertyPrice({
  price,
  currency,
  showPrice,
}: Pick<PropertyListItem, 'price' | 'currency' | 'showPrice'>) {
  if (!showPrice) {
    return 'Consultar precio'
  }

  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
  })

  return formatter.format(price)
}

export function buildPropertyLocationLabel(property: Pick<
  PropertyListItem,
  'address' | 'city' | 'neighborhood' | 'locationMode'
>) {
  const parts: string[] = []

  if (property.locationMode === 'exacta') {
    parts.push(property.address)
  }

  if (property.neighborhood) {
    parts.push(property.neighborhood)
  }

  parts.push(property.city)

  return parts.join(', ')
}

export const propertyFormDefaultValues: Partial<PropertyFormValues> = {
  title: '',
  internalCode: '',
  operation: 'venta',
  propertyType: 'casa',
  price: undefined,
  currency: 'USD',
  status: 'borrador',
  showPrice: true,
  address: '',
  city: 'Córdoba',
  neighborhood: undefined,
  locationMode: 'exacta',
  bedrooms: undefined,
  bathrooms: undefined,
  coveredArea: undefined,
  totalArea: undefined,
  description: undefined,
  slug: undefined,
  metaTitle: undefined,
  metaDescription: undefined,
}
