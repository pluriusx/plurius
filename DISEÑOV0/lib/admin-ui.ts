export type AdminTheme = 'light' | 'dark'
export type AdminVariant = 'editorial' | 'cinematic'

export const ADMIN_THEME_STORAGE_KEY = 'plurius.theme'
export const ADMIN_VARIANT_STORAGE_KEY = 'plurius.variant'
export const ADMIN_UI_EVENT = 'plurius-ui-change'

function isTheme(value: string | null): value is AdminTheme {
  return value === 'light' || value === 'dark'
}

function isVariant(value: string | null): value is AdminVariant {
  return value === 'editorial' || value === 'cinematic'
}

export function readStoredAdminTheme(): AdminTheme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const value = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
  return isTheme(value) ? value : 'light'
}

export function readStoredAdminVariant(): AdminVariant {
  if (typeof window === 'undefined') {
    return 'editorial'
  }

  const value = window.localStorage.getItem(ADMIN_VARIANT_STORAGE_KEY)
  return isVariant(value) ? value : 'editorial'
}

export function applyAdminTheme(theme: AdminTheme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('data-theme', theme)
}

export function emitAdminUiChange(detail: Partial<{ theme: AdminTheme; variant: AdminVariant }>) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(ADMIN_UI_EVENT, { detail }))
}

export function storeAdminTheme(theme: AdminTheme) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme)
  applyAdminTheme(theme)
  emitAdminUiChange({ theme })
}

export function storeAdminVariant(variant: AdminVariant) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ADMIN_VARIANT_STORAGE_KEY, variant)
  emitAdminUiChange({ variant })
}
