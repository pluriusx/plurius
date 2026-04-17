export interface PropertyMediaItem {
  id: string
  agencyId: string
  propertyId: string
  url: string
  altText?: string | null
  sortOrder: number
  isCover: boolean
  createdAt: string
  updatedAt: string
}

export interface PropertyMediaFormItem {
  url: string
  altText?: string
  isCover?: boolean
}

export interface PropertyMediaPreview {
  coverImageUrl?: string | null
  coverImageAlt?: string | null
  mediaCount: number
}

export function getPropertyMediaFormValues(
  items: PropertyMediaItem[],
): PropertyMediaFormItem[] {
  return items.map((item) => ({
    url: item.url,
    altText: item.altText ?? '',
    isCover: item.isCover,
  }))
}

export function getPropertyCoverPreview(
  items: Array<Pick<PropertyMediaItem, 'url' | 'altText' | 'isCover'>>,
): Pick<PropertyMediaPreview, 'coverImageUrl' | 'coverImageAlt'> {
  const coverItem = items.find((item) => item.isCover) ?? items[0]

  return {
    coverImageUrl: coverItem?.url ?? null,
    coverImageAlt: coverItem?.altText ?? null,
  }
}
