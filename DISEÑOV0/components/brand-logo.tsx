import Image from 'next/image'

interface BrandLogoProps {
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

export function BrandLogo({
  className,
  priority = false,
  width = 116,
  height = 28,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Plurius"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  )
}

interface BrandLockupProps {
  className?: string
  logoClassName?: string
  subtitle?: string
  priority?: boolean
}

export function BrandLockup({
  className,
  logoClassName,
  priority = false,
}: Omit<BrandLockupProps, 'subtitle'>) {
  return (
    <div className={`flex items-center ${className ?? ''}`}>
      <BrandLogo
        width={106}
        height={26}
        priority={priority}
        className={logoClassName ?? 'h-auto w-[106px]'}
      />
    </div>
  )
}
