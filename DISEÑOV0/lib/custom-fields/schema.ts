import { z } from 'zod'

export const customFieldTypeValues = [
  'short_text',
  'long_text',
  'number',
  'boolean',
  'single_select',
  'multi_select',
  'url',
] as const

export type CustomFieldType = (typeof customFieldTypeValues)[number]

export const customFieldTypeOptions: Array<{ value: CustomFieldType; label: string }> = [
  { value: 'short_text', label: 'Texto corto' },
  { value: 'long_text', label: 'Texto largo' },
  { value: 'number', label: 'Numero' },
  { value: 'boolean', label: 'Si / no' },
  { value: 'single_select', label: 'Opcion unica' },
  { value: 'multi_select', label: 'Multiples opciones' },
  { value: 'url', label: 'URL' },
]

export const customFieldTypeLabels: Record<CustomFieldType, string> = {
  short_text: 'Texto corto',
  long_text: 'Texto largo',
  number: 'Numero',
  boolean: 'Si / no',
  single_select: 'Opcion unica',
  multi_select: 'Multiples opciones',
  url: 'URL',
}

export type CustomFieldStoredValue = string | number | boolean | string[]

export interface CustomFieldDefinition {
  id: string
  name: string
  slug: string
  fieldType: CustomFieldType
  options: string[]
  showInPublic: boolean
  isRequired: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
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
        invalid_type_error: 'Valor invalido',
      })
      .max(maxLength, `No puede superar ${maxLength} caracteres`)
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

export function slugifyCustomField(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function parseCustomFieldOptions(value?: string) {
  if (!value) {
    return []
  }

  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

export const customFieldFormSchema = z
  .object({
    name: requiredText('El nombre del campo', 80, 2),
    fieldType: z.enum(customFieldTypeValues),
    optionsBody: optionalText(1500),
    showInPublic: checkboxValue(),
    isRequired: checkboxValue(),
  })
  .superRefine((values, context) => {
    const options = parseCustomFieldOptions(values.optionsBody)

    if (
      (values.fieldType === 'single_select' || values.fieldType === 'multi_select') &&
      options.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['optionsBody'],
        message: 'Agregá al menos una opcion para este tipo de campo.',
      })
    }
  })

export type CustomFieldFormValues = z.infer<typeof customFieldFormSchema>

export function formatCustomFieldValue(
  field: Pick<CustomFieldDefinition, 'fieldType'>,
  value: CustomFieldStoredValue | undefined,
) {
  if (value === undefined) {
    return null
  }

  switch (field.fieldType) {
    case 'boolean':
      return value === true ? 'Si' : value === false ? 'No' : null
    case 'multi_select':
      return Array.isArray(value) && value.length > 0 ? value.join(', ') : null
    case 'number':
      return typeof value === 'number'
        ? new Intl.NumberFormat('es-AR').format(value)
        : typeof value === 'string' && value.trim()
          ? value.trim()
          : null
    default:
      return typeof value === 'string' && value.trim() ? value.trim() : null
  }
}
