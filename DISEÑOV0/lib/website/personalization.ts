import type { WebsiteHeroVariant, WebsiteThemePreset } from '@/lib/website/schema'

export const websiteThemePresetMeta: Record<
  WebsiteThemePreset,
  { label: string; description: string; preview: [string, string, string] }
> = {
  brisa: {
    label: 'Brisa',
    description: 'Superficies suaves, fondos luminosos y una presencia más cercana.',
    preview: ['#F7F2E8', '#E6FFFB', '#0F172A'],
  },
  editorial: {
    label: 'Editorial',
    description: 'Más contraste, marcos limpios y un look sobrio tipo estudio.',
    preview: ['#FFFCF7', '#E7E5E4', '#111827'],
  },
  nocturno: {
    label: 'Nocturno',
    description: 'Fondos profundos y bloques con más tensión visual para marcas audaces.',
    preview: ['#0F172A', '#1E293B', '#F8FAFC'],
  },
}

export const websiteHeroVariantMeta: Record<
  WebsiteHeroVariant,
  { label: string; description: string }
> = {
  split: {
    label: 'Split',
    description: 'Texto a la izquierda y bloque visual a la derecha.',
  },
  centered: {
    label: 'Centrado',
    description: 'Mensaje principal al centro, ideal para una portada más editorial.',
  },
  immersive: {
    label: 'Inmersivo',
    description: 'Un hero más envolvente y expresivo con foco en marca.',
  },
}
