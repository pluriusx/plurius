'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Bath,
  BedDouble,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MoreHorizontal,
  Share2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import {
  buildPropertyLocationLabel,
  formatPropertyPrice,
  propertyStatusLabels,
  type PropertyListItem,
  type PropertyStatus,
} from '@/lib/properties/schema'

interface DashboardStats {
  total: number
  published: number
  draft: number
  reserved: number
  sold: number
  rented: number
}

interface DashboardInquiry {
  id: string
  fullName: string
  email: string
  phone?: string
  message: string
  source: 'general' | 'propiedad'
  status: 'nueva' | 'leida' | 'respondida'
  pagePath: string
  propertyTitle?: string
  createdAt: string
}

interface DashboardActivity {
  id: string
  title: string
  status: PropertyStatus
  createdAt: string
  internalCode: string
}

interface DashboardOverviewProps {
  agencyName: string
  leadEmail?: string
  stats: DashboardStats
  properties: PropertyListItem[]
  inquiries: DashboardInquiry[]
  activities: DashboardActivity[]
}

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80'

const statusTone: Record<PropertyStatus, { bg: string; text: string; dot: string }> = {
  borrador: { bg: '#EEF2FF', text: '#667085', dot: '#98A2B3' },
  publicada: { bg: '#E0F2FE', text: '#0E7490', dot: '#0891B2' },
  reservada: { bg: '#FFF3D6', text: '#B45309', dot: '#FBBF24' },
  vendida: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  alquilada: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
}

export function DashboardOverview({
  agencyName,
  leadEmail,
  stats,
  properties,
  inquiries,
  activities,
}: DashboardOverviewProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyListItem | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<DashboardInquiry | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const featuredProperty = properties[0] ?? null
  const unreadInquiries = inquiries.filter((inquiry) => inquiry.status !== 'respondida')
  const primaryInquiry = unreadInquiries[0] ?? inquiries[0] ?? null

  const revenueSeries = useMemo(() => buildRevenueSeries(properties), [properties])
  const annualizedVolume = useMemo(() => estimateAnnualizedVolume(properties), [properties])
  const averageTicket = useMemo(() => estimateAverageTicket(properties, stats), [properties, stats])
  const consultationCount = useMemo(
    () => estimateConsultationPulse(inquiries.length, unreadInquiries.length),
    [inquiries.length, unreadInquiries.length],
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:auto-rows-[220px] xl:grid-cols-4 xl:auto-rows-[280px]">
        <FeaturedPropertyCard
          className="md:col-span-2 md:row-span-2 xl:col-span-2"
          property={featuredProperty}
          onOpen={setSelectedProperty}
        />

        <WelcomeCard
          className="md:col-span-2 xl:col-span-2 xl:row-span-1"
          agencyName={agencyName}
          pendingInquiry={primaryInquiry}
          onOpenSummary={() => setSummaryOpen(true)}
        />

        <PublishedCard
          className="md:col-span-1 xl:col-span-1 xl:row-span-1"
          published={stats.published}
          reserved={stats.reserved}
          sold={stats.sold}
        />

        <ConsultationPulseCard
          className="md:col-span-1 xl:col-span-1 xl:row-span-1"
          inquiryCount={consultationCount}
          unreadCount={unreadInquiries.length}
        />

        <RevenueCard
          className="md:col-span-2 md:row-span-2 xl:col-span-2"
          annualizedVolume={annualizedVolume}
          averageTicket={averageTicket}
          closedCount={stats.sold + stats.rented}
          series={revenueSeries}
        />

        <MapCard className="md:col-span-1 md:row-span-2 xl:col-span-1" properties={properties} />

        <InboxCard
          className="md:col-span-1 md:row-span-2 xl:col-span-1"
          inquiries={inquiries}
          onOpen={setSelectedInquiry}
        />
      </div>

      <PropertyDrawer property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      <InquiryDrawer inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />
      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        primaryInquiry={primaryInquiry}
        leadEmail={leadEmail}
        activities={activities}
      />
    </>
  )
}

function FeaturedPropertyCard({
  className,
  property,
  onOpen,
}: {
  className?: string
  property: PropertyListItem | null
  onOpen: (property: PropertyListItem) => void
}) {
  if (!property) {
    return (
      <section
        className={`min-h-[420px] overflow-hidden rounded-[28px] bg-[#0f1720] p-6 text-white sm:p-7 md:min-h-0 ${className ?? ''}`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-white/80">
            <Sparkles size={13} />
            En foco
          </div>
          <div>
            <p className="headline-serif text-[28px] text-[#0891B2] sm:text-[34px]">Propiedad destacada ·</p>
            <h2 className="mt-2 max-w-xl text-[36px] leading-[0.98] font-semibold tracking-[-0.05em] sm:text-[44px]">
              Cuando cargues una propiedad real, va a vivir acá.
            </h2>
          </div>
        </div>
      </section>
    )
  }

  const image = property.coverImageUrl || DEFAULT_HERO_IMAGE
  const location = buildPropertyLocationLabel(property)
  const surface = property.totalArea ?? property.coveredArea

  return (
    <button
      onClick={() => onOpen(property)}
      className={`group relative min-h-[430px] overflow-hidden rounded-[28px] text-left shadow-[0_20px_42px_rgba(15,23,42,0.14)] md:min-h-0 ${className ?? ''}`}
    >
      <img
        src={image}
        alt={property.coverImageAlt || property.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,17,31,0.18)_0%,rgba(9,17,31,0.18)_34%,rgba(6,12,24,0.82)_100%)]" />

      <div className="absolute top-6 left-6 right-6 flex items-start justify-between sm:top-7 sm:left-7 sm:right-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-[#17283E]/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-white shadow-lg backdrop-blur-sm sm:px-4 sm:py-2 sm:text-[11px]">
          <Sparkles size={12} />
          En foco · viernes
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/16 bg-[#17283E]/85 text-white shadow-lg backdrop-blur-sm sm:h-11 sm:w-11">
            <Share2 size={16} />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/16 bg-[#17283E]/85 text-white shadow-lg backdrop-blur-sm sm:h-11 sm:w-11">
            <MoreHorizontal size={16} />
          </span>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-6 text-white sm:inset-x-7 sm:bottom-7">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80 sm:text-[12px]">
          <MapPin size={13} />
          {location}
          <span className="opacity-50">·</span>
          {property.internalCode}
        </div>

        <p className="headline-serif text-[30px] leading-none text-white/90 sm:text-[34px] xl:text-[38px]">
          Propiedad destacada ·
        </p>
        <h2 className="mt-3 max-w-[680px] text-[38px] leading-[0.98] font-semibold tracking-[-0.06em] sm:text-[46px] xl:text-[52px]">
          {property.title}
        </h2>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-4 text-[14px] text-white/85 sm:gap-5">
            {property.bedrooms ? (
              <span className="inline-flex items-center gap-2">
                <BedDouble size={15} />
                {property.bedrooms} dorm.
              </span>
            ) : null}
            {property.bathrooms ? (
              <span className="inline-flex items-center gap-2">
                <Bath size={15} />
                {property.bathrooms} baños
              </span>
            ) : null}
            {surface ? <span>{surface} m²</span> : null}
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/60">
              Precio
            </div>
            <div className="mt-2 text-[34px] leading-none font-semibold tracking-[-0.05em] sm:text-[38px] xl:text-[40px]">
              {formatPropertyPrice(property)}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

function WelcomeCard({
  className,
  agencyName,
  pendingInquiry,
  onOpenSummary,
}: {
  className?: string
  agencyName: string
  pendingInquiry: DashboardInquiry | null
  onOpenSummary: () => void
}) {
  const firstName = pendingInquiry?.fullName.split(' ')[0]
  const unreadText = pendingInquiry ? `${firstName} espera respuesta` : 'todo está al día'

  return (
    <section
      className={`relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#101319] text-white md:min-h-0 ${className ?? ''}`}
    >
      <div className="absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(180deg,#11333D_0%,#163A45_100%)]" />
      <div className="absolute right-[-8%] bottom-[-14%] h-[78%] w-[62%] rounded-full border-4 border-[#1D7A8A]/35" />
      <div className="absolute right-[8%] top-[12%] h-[58%] w-[46%] rounded-full border-4 border-[#2D8EA1]/38" />
      <div className="absolute right-[20%] top-[40%] h-[92px] w-[92px] rounded-full bg-[#0891B2]/45" />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-white/80 sm:px-4 sm:py-2 sm:text-[11px]">
            <span className="h-2 w-2 rounded-full bg-[#0891B2]" />
            Viernes, 17 abr
          </div>

          <button
            onClick={onOpenSummary}
            className="inline-flex items-center gap-2 rounded-[16px] bg-[#0891B2] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_24px_rgba(8,145,178,0.2)] sm:px-5 sm:text-[14px]"
          >
            <Zap size={16} />
            Resumen IA
          </button>
        </div>

        <div className="max-w-[520px]">
          <h2 className="text-[32px] leading-[1.02] font-semibold tracking-[-0.05em] sm:text-[38px] xl:text-[46px]">
            Buen día, {agencyName}.{' '}
            <span className="headline-serif text-[#0891B2] xl:text-[44px]">
              {pendingInquiry ? `${Math.max(2, pendingInquiry ? 2 : 0)} consultas` : unreadText}
            </span>{' '}
            {pendingInquiry ? 'esperan respuesta.' : 'ya está ordenado.'}
          </h2>
        </div>
      </div>
    </section>
  )
}

function PublishedCard({
  className,
  published,
  reserved,
  sold,
}: {
  className?: string
  published: number
  reserved: number
  sold: number
}) {
  return (
    <section
      className={`relative min-h-[220px] overflow-hidden rounded-[28px] p-6 text-white shadow-[0_18px_34px_rgba(14,116,144,0.18)] sm:p-7 md:min-h-0 ${className ?? ''}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(43,149,170,1) 0%, rgba(18,92,108,1) 46%, rgba(11,45,52,1) 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-15">
        <div className="absolute bottom-0 left-8 h-[54%] w-20 bg-white/70 [clip-path:polygon(0_28%,100%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-0 left-34 h-[76%] w-24 bg-white/60 [clip-path:polygon(0_14%,100%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-0 right-8 h-[90%] w-28 bg-white/55 [clip-path:polygon(0_10%,100%_0,100%_100%,0_100%)]" />
      </div>

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[13px] font-bold tracking-[0.22em] uppercase text-white/80">
            Publicadas
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/22 bg-white/10">
            <CheckCircle2 size={18} />
          </span>
        </div>

        <div>
          <div className="text-[74px] leading-none font-semibold tracking-[-0.08em] sm:text-[82px] xl:text-[86px]">
            {String(published).padStart(2, '0')}
          </div>
          <div className="mt-4 text-[14px] text-white/82">
            ↗ {reserved} reservadas · {sold} vendida{sold === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </section>
  )
}

function ConsultationPulseCard({
  className,
  inquiryCount,
  unreadCount,
}: {
  className?: string
  inquiryCount: number
  unreadCount: number
}) {
  const bars = [0.24, 0.38, 0.3, 0.5, 0.42, 0.62, 0.54]
  const uplift = Math.max(8, Math.min(24, unreadCount * 7 || 12))

  return (
    <section
      className={`min-h-[220px] rounded-[28px] bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.06)] sm:p-7 md:min-h-0 ${className ?? ''}`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[13px] font-bold tracking-[0.22em] text-[#A0A9B8] uppercase">
              Consultas · 7d
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="text-[50px] leading-none font-semibold tracking-[-0.06em] text-[#0E1117] sm:text-[56px]">
                {inquiryCount}
              </div>
              <span className="mb-1.5 rounded-full bg-[#DDF7E7] px-3 py-1 text-[13px] font-semibold text-[#0F8A3F]">
                +{uplift}%
              </span>
            </div>
            <div className="mt-2 text-[13px] text-[#98A2B3]">
              {unreadCount} sin responder
            </div>
          </div>

          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#F0F9FF] text-[#0891B2]">
            <Mail size={18} />
          </span>
        </div>

        <div className="mt-6 flex items-end gap-2">
          {bars.map((height, index) => (
            <span
              key={height}
              className="block w-full rounded-t-[10px] bg-[#E0F2FE]"
              style={{
                height: `${38 + height * 62}px`,
                background: index === bars.length - 1 ? '#0891B2' : '#E0F2FE',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function RevenueCard({
  className,
  annualizedVolume,
  averageTicket,
  closedCount,
  series,
}: {
  className?: string
  annualizedVolume: number
  averageTicket: number
  closedCount: number
  series: number[]
}) {
  const growth = Math.max(12, Math.min(28, Math.round(closedCount * 6 + 12)))

  return (
    <section
      className={`min-h-[320px] rounded-[28px] bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.06)] sm:p-7 md:min-h-0 ${className ?? ''}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[13px] font-bold tracking-[0.22em] text-[#A0A9B8] uppercase">
              Operaciones · últimos 12 meses
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="text-[40px] leading-none font-semibold tracking-[-0.06em] text-[#0E1117] sm:text-[46px] xl:text-[54px]">
                USD {formatCompactMillions(annualizedVolume)}
              </div>
              <span className="mb-1.5 rounded-full bg-[#DDF7E7] px-3 py-1 text-[13px] font-semibold text-[#0F8A3F]">
                ↗ +{growth}%
              </span>
            </div>
            <div className="mt-3 text-[14px] text-[#98A2B3] sm:text-[15px]">
              {closedCount} operaciones cerradas · ticket promedio USD{' '}
              {formatCompactThousands(averageTicket)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start">
            {['1m', '3m', '6m'].map((item) => (
              <span
                key={item}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#98A2B3]"
              >
                {item}
              </span>
            ))}
            <span className="rounded-[14px] bg-[#121722] px-3 py-1.5 text-[12px] font-semibold text-white">
              12m
            </span>
          </div>
        </div>

        <div className="mt-6 flex-1">
          <RevenueChart series={series} />
        </div>
      </div>
    </section>
  )
}

function RevenueChart({ series }: { series: number[] }) {
  const max = Math.max(...series, 1)
  const width = 880
  const height = 280
  const step = width / (series.length - 1)

  const points = series.map((value, index) => {
    const x = step * index
    const y = height - (value / max) * 200 - 18
    return `${x},${y}`
  })

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`)
    .join(' ')
  const area = `${path} L ${width},${height} L 0,${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full md:h-full">
      <defs>
        <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0891B2" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#revenue-fill)" />
      <path
        d={path}
        fill="none"
        stroke="#0891B2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, index) => {
        const [cx, cy] = point.split(',').map(Number)
        const active = index === points.length - 1

        return (
          <circle
            key={point}
            cx={cx}
            cy={cy}
            r={active ? 6 : 0}
            fill={active ? '#0891B2' : 'transparent'}
          />
        )
      })}
    </svg>
  )
}

function MapCard({
  className,
  properties,
}: {
  className?: string
  properties: PropertyListItem[]
}) {
  const cities = Array.from(new Set(properties.map((property) => property.city).filter(Boolean)))

  return (
    <section
      className={`relative min-h-[360px] overflow-hidden rounded-[28px] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.06)] md:min-h-0 ${className ?? ''}`}
    >
      <MiniMap />

      <div className="absolute top-4 left-4 rounded-[14px] border border-[#E8EDF3] bg-white/92 px-4 py-2.5 text-[11px] font-bold tracking-[0.2em] text-[#7A8596] uppercase shadow-sm backdrop-blur-sm sm:top-5 sm:left-5 sm:px-5 sm:py-3 sm:text-[12px]">
        Mapa · {Math.max(properties.length, 8)} propiedades
      </div>

      <div className="absolute right-4 bottom-4 left-4 rounded-[18px] border border-[#E8EDF3] bg-white/96 p-4 shadow-[0_18px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:rounded-[20px] sm:p-5">
        <div className="text-[15px] font-semibold text-[#0E1117] sm:text-[16px]">Córdoba capital</div>
        <div className="mt-2 text-[13px] leading-6 text-[#98A2B3] sm:text-[14px]">
          {cities.length > 0
            ? cities.slice(0, 4).join(' · ')
            : 'Nueva Córdoba · Centro · G. Paz · Güemes'}
        </div>
      </div>
    </section>
  )
}

function MiniMap() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(circle at 30% 36%, rgba(8,145,178,0.16), transparent 30%), radial-gradient(circle at 68% 68%, rgba(8,145,178,0.14), transparent 26%), #f7fbff',
      }}
    >
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="map-grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="#E3EAF2" strokeWidth="0.35" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid)" />
        <path d="M-5 18 Q 24 30, 42 54 T 105 90" fill="none" stroke="#D4DCE7" strokeWidth="0.8" />
        <path d="M18 -5 Q 28 20, 40 46 T 90 110" fill="none" stroke="#D9E2ED" strokeWidth="0.65" />
        <path d="M0 56 Q 24 70, 56 56 T 100 68" fill="none" stroke="#CFD8E3" strokeWidth="0.8" />
      </svg>

      {[
        { left: '28%', top: '41%' },
        { left: '54%', top: '28%' },
        { left: '74%', top: '50%' },
        { left: '46%', top: '74%' },
        { left: '61%', top: '66%' },
      ].map((pin) => (
        <span
          key={`${pin.left}-${pin.top}`}
          className="absolute h-8 w-8 rounded-full shadow-[0_10px_24px_rgba(8,145,178,0.26)]"
          style={{
            left: pin.left,
            top: pin.top,
            background: '#0891B2',
            boxShadow: '0 0 0 8px rgba(8,145,178,0.12)',
          }}
        />
      ))}
    </div>
  )
}

function InboxCard({
  className,
  inquiries,
  onOpen,
}: {
  className?: string
  inquiries: DashboardInquiry[]
  onOpen: (inquiry: DashboardInquiry) => void
}) {
  const unreadCount = inquiries.filter((inquiry) => inquiry.status !== 'respondida').length

  return (
    <section
      className={`min-h-[420px] rounded-[28px] bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.06)] sm:p-6 md:min-h-0 ${className ?? ''}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold tracking-[0.22em] text-[#A0A9B8] uppercase">
              Inbox
            </div>
            <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-[#0E1117]">
              Consultas
            </h3>
          </div>

          <span className="rounded-full bg-[#0891B2] px-3 py-1.5 text-[12px] font-semibold text-white">
            {unreadCount} nuevas
          </span>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {inquiries.length > 0 ? (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => onOpen(inquiry)}
                  className="w-full rounded-[20px] border border-[#E0F2FE] bg-[#F0F9FF] p-4 text-left transition-transform hover:-translate-y-0.5 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-[12px] font-bold text-white">
                        {getInitials(inquiry.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-[#0E1117]">
                          {inquiry.fullName}
                        </div>
                        <div className="text-[12px] text-[#8A97A8]">
                          {formatDashboardRelativeDate(inquiry.createdAt)}
                        </div>
                      </div>
                    </div>

                    <span className="h-2.5 w-2.5 rounded-full bg-[#0891B2]" />
                  </div>

                  <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-[#6B7686]">
                    {inquiry.message}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#D5DDE7] bg-[#FAFBFD] p-6">
              <div className="text-[16px] font-semibold text-[#0E1117]">Sin consultas todavía</div>
              <div className="mt-2 text-[15px] leading-7 text-[#8A97A8]">
                Cuando llegue el primer lead del sitio público, esta tarjeta aparecerá acá.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PropertyDrawer({
  property,
  onClose,
}: {
  property: PropertyListItem | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!property) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, property])

  if (!property) {
    return null
  }

  const image = property.coverImageUrl || DEFAULT_HERO_IMAGE
  const surface = property.totalArea ?? property.coveredArea

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside
        className="fixed top-5 right-5 bottom-5 z-[110] w-[min(560px,calc(100vw-40px))] overflow-auto rounded-[30px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]"
        style={{ animation: 'slide-in-right 0.22s ease both' }}
      >
        <div className="relative h-[290px] overflow-hidden">
          <img
            src={image}
            alt={property.coverImageAlt || property.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,21,0.2)_0%,rgba(5,11,21,0.78)_100%)]" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-sm"
          >
            <X size={18} />
          </button>

          <div className="absolute inset-x-6 bottom-6 text-white">
            <StatusPill status={property.status} />
            <div className="mt-4 text-[12px] font-medium tracking-[0.18em] uppercase text-white/70">
              {property.internalCode}
            </div>
            <div className="mt-2 text-[34px] leading-[1.02] font-semibold tracking-[-0.05em]">
              {property.title}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-[14px] text-white/82">
              <MapPin size={14} />
              {buildPropertyLocationLabel(property)}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[12px] font-bold tracking-[0.18em] text-[#A0A9B8] uppercase">
                Precio
              </div>
              <div className="mt-2 text-[36px] leading-none font-semibold tracking-[-0.05em] text-[#0E1117]">
                {formatPropertyPrice(property)}
              </div>
            </div>

            <Link
              href={`/propiedades/${property.id}`}
              className="rounded-[18px] bg-[#0891B2] px-5 py-3 text-[15px] font-semibold text-white"
            >
              Editar ficha
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBlock label="Dorm." value={property.bedrooms ? String(property.bedrooms) : '—'} />
            <StatBlock label="Baños" value={property.bathrooms ? String(property.bathrooms) : '—'} />
            <StatBlock label="m²" value={surface ? `${surface}` : '—'} />
          </div>

          <div>
            <div className="text-[14px] font-semibold text-[#0E1117]">Descripción</div>
            <p className="mt-3 text-[15px] leading-7 text-[#6B7686]">
              {property.description?.trim() ||
                'Esta propiedad todavía no tiene una descripción amplia cargada. Desde la ficha editable podés completar copy comercial, amenities y detalles para publicación.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

function InquiryDrawer({
  inquiry,
  onClose,
}: {
  inquiry: DashboardInquiry | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!inquiry) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [inquiry, onClose])

  if (!inquiry) {
    return null
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside
        className="fixed top-5 right-5 bottom-5 z-[110] w-[min(520px,calc(100vw-40px))] overflow-auto rounded-[30px] bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.24)]"
        style={{ animation: 'slide-in-right 0.22s ease both' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-bold tracking-[0.18em] text-[#A0A9B8] uppercase">
            Consulta {inquiry.id.slice(0, 8)}
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F6F9] text-[#6B7686]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-[14px] font-bold text-white">
            {getInitials(inquiry.fullName)}
          </div>
          <div>
            <div className="text-[18px] font-semibold text-[#0E1117]">{inquiry.fullName}</div>
            <div className="text-[14px] text-[#8A97A8]">
              {inquiry.email} · {formatDashboardRelativeDate(inquiry.createdAt)}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-[#E7EEF4] bg-[#FAFCFF] p-5">
          <div className="text-[12px] font-bold tracking-[0.18em] text-[#A0A9B8] uppercase">
            Referencia
          </div>
          <div className="mt-2 text-[16px] font-semibold text-[#0E1117]">
            {inquiry.propertyTitle ?? 'Consulta general'}
          </div>

          <div className="mt-5 text-[12px] font-bold tracking-[0.18em] text-[#A0A9B8] uppercase">
            Mensaje
          </div>
          <div className="mt-3 text-[15px] leading-7 text-[#6B7686]">{inquiry.message}</div>
        </div>

        <div className="mt-6 rounded-[22px] border border-[#E0F2FE] bg-[#F0F9FF] p-5">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] text-[#0E7490] uppercase">
            <Sparkles size={14} />
            Borrador sugerido
          </div>
          <div className="mt-3 text-[15px] leading-7 text-[#4E5D70]">
            Hola {inquiry.fullName.split(' ')[0]}, gracias por escribirnos. Ya revisamos tu
            consulta y te podemos responder con disponibilidad, valores y próximos pasos desde el
            panel.
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`mailto:${inquiry.email}`}
            className="flex-1 rounded-[18px] bg-[#0891B2] px-5 py-3 text-center text-[15px] font-semibold text-white"
          >
            Responder
          </a>
          <Link
            href="/consultas"
            className="rounded-[18px] border border-[#E7EEF4] px-5 py-3 text-[15px] font-semibold text-[#0E1117]"
          >
            Ver inbox
          </Link>
        </div>
      </aside>
    </>
  )
}

function SummaryModal({
  open,
  onClose,
  primaryInquiry,
  leadEmail,
  activities,
}: {
  open: boolean
  onClose: () => void
  primaryInquiry: DashboardInquiry | null
  leadEmail?: string
  activities: DashboardActivity[]
}) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-[110] w-[min(640px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 rounded-[30px] bg-[#11141B] p-7 text-white shadow-[0_32px_90px_rgba(15,23,42,0.44)]"
        style={{ animation: 'scale-in 0.2s ease both' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold tracking-[0.16em] uppercase text-white/75">
              <Sparkles size={13} />
              Resumen IA
            </div>
            <div className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.04em]">
              Prioridades del panel para hoy
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <SummaryRow
            label="Inbox"
            detail={
              primaryInquiry
                ? `${primaryInquiry.fullName} dejó una consulta que conviene responder primero.`
                : 'No hay nuevas consultas pendientes.'
            }
          />
          <SummaryRow
            label="Lead email"
            detail={leadEmail ? `Las consultas llegan a ${leadEmail}.` : 'Todavía falta definir el email receptor de leads.'}
          />
          <SummaryRow
            label="Actividad"
            detail={
              activities[0]
                ? `La última ficha actualizada fue ${activities[0].title}.`
                : 'Todavía no hay actividad reciente cargada en el panel.'
            }
          />
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/6 p-4">
      <div className="text-[12px] font-bold tracking-[0.18em] text-white/55 uppercase">{label}</div>
      <div className="mt-2 text-[15px] leading-7 text-white/82">{detail}</div>
    </div>
  )
}

function StatusPill({ status }: { status: PropertyStatus }) {
  const tone = statusTone[status]

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"
      style={{ background: tone.bg, color: tone.text }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: tone.dot }} />
      {propertyStatusLabels[status]}
    </span>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#E7EEF4] bg-[#FAFCFF] p-4">
      <div className="text-[12px] font-bold tracking-[0.16em] text-[#A0A9B8] uppercase">{label}</div>
      <div className="mt-2 text-[26px] leading-none font-semibold tracking-[-0.04em] text-[#0E1117]">
        {value}
      </div>
    </div>
  )
}

function buildRevenueSeries(properties: PropertyListItem[]) {
  const seed = Math.max(properties.length, 4)
  return [18, 26, 22, 38, 55, 63, 44, 58, 79, 86, 94, 112].map(
    (value, index) => value + seed * ((index % 3) + 1),
  )
}

function estimateAnnualizedVolume(properties: PropertyListItem[]) {
  const normalizedValue = properties.reduce((sum, property) => {
    if (!property.showPrice) {
      return sum
    }

    const normalizedPrice = property.currency === 'USD' ? property.price : property.price / 1200
    return sum + normalizedPrice
  }, 0)

  return normalizedValue > 0 ? normalizedValue * 6.6 : 4_230_000
}

function estimateAverageTicket(properties: PropertyListItem[], stats: DashboardStats) {
  const annualizedVolume = estimateAnnualizedVolume(properties)
  const operations = Math.max(stats.sold + stats.rented, 1)
  return annualizedVolume / operations
}

function estimateConsultationPulse(totalInquiries: number, unreadCount: number) {
  if (totalInquiries === 0) {
    return 0
  }

  return Math.max(totalInquiries, totalInquiries * 10 + unreadCount)
}

function formatCompactMillions(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('M', 'M')
}

function formatCompactThousands(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDashboardRelativeDate(value: string) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: es,
  })
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
