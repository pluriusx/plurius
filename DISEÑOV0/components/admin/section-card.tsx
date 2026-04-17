import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SectionCardProps {
  eyebrow?: string
  title: string
  description: string
  items?: string[]
  ctaLabel?: string
  href?: string
  accent?: boolean
  className?: string
}

export function SectionCard({
  eyebrow,
  title,
  description,
  items,
  ctaLabel,
  href,
  accent = false,
  className,
}: SectionCardProps) {
  return (
    <section
      className={`${accent ? 'card-cyan p-5' : 'card p-5'} ${className ?? ''}`}
      style={accent ? undefined : { minHeight: 220 }}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="space-y-2">
          {eyebrow ? (
            <p
              className={
                accent
                  ? 'text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100'
                  : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]'
              }
            >
              {eyebrow}
            </p>
          ) : null}
          <div>
            <h2
              className={
                accent
                  ? 'text-[20px] font-semibold text-white'
                  : 'text-[20px] font-semibold text-[#0F1117]'
              }
            >
              {title}
            </h2>
            <p
              className={
                accent
                  ? 'mt-2 text-sm leading-6 text-cyan-100'
                  : 'mt-2 text-sm leading-6 text-[#6B7280]'
              }
            >
              {description}
            </p>
          </div>
        </div>

        {items?.length ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className={
                  accent
                    ? 'rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white'
                    : 'rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium text-[#4B5563]'
                }
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {ctaLabel && href ? (
          <div className="mt-auto pt-2">
            <Link
              href={href}
              className={
                accent
                  ? 'inline-flex items-center gap-2 text-sm font-semibold text-white'
                  : 'inline-flex items-center gap-2 text-sm font-semibold text-[#0891B2] transition-colors hover:text-[#0E7490]'
              }
            >
              {ctaLabel}
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
