import { Building2, CheckCircle2, Clock3, PencilLine, TrendingUp } from 'lucide-react'

import { getCurrentAgency } from '@/lib/agencies'
import { getPropertyDashboardStats } from '@/lib/properties/repository'

export async function KPICards() {
  const agency = await getCurrentAgency()
  const stats = await getPropertyDashboardStats(agency.id)
  const closed = stats.sold + stats.rented

  return (
    <>
      {/* Hero KPI — Publicadas (ocupa 1 col × 2 rows en bento) */}
      <div className="card-cyan flex flex-col justify-between p-6 lg:row-span-2">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
            Propiedades publicadas
          </p>
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[12px] bg-white/20">
            <CheckCircle2 size={17} strokeWidth={1.8} color="white" />
          </span>
        </div>
        <div>
          <p className="text-[52px] font-bold leading-none text-white">{stats.published}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-cyan-100">
            <TrendingUp size={12} color="rgba(255,255,255,0.7)" />
            {stats.reserved} reservadas
          </p>
        </div>
      </div>

      {/* KPI — Totales */}
      <div className="card flex flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between">
          <p className="max-w-[80%] text-[12px] font-medium leading-tight text-[#6B7280]">
            Propiedades totales
          </p>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6]">
            <Building2 size={15} strokeWidth={1.8} color="#6B7280" />
          </span>
        </div>
        <div>
          <p className="text-[32px] font-bold leading-none text-[#0F1117]">{stats.total}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <TrendingUp size={11} color="#10B981" />
            {stats.published} publicadas
          </p>
        </div>
      </div>

      {/* KPI — Borradores */}
      <div className="card flex flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between">
          <p className="max-w-[80%] text-[12px] font-medium leading-tight text-[#6B7280]">
            Borradores listos
          </p>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6]">
            <PencilLine size={15} strokeWidth={1.8} color="#6B7280" />
          </span>
        </div>
        <div>
          <p className="text-[32px] font-bold leading-none text-[#0F1117]">{stats.draft}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <TrendingUp size={11} color="#10B981" />
            pendientes de revisión
          </p>
        </div>
      </div>

      {/* KPI — Operaciones cerradas */}
      <div className="card flex flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between">
          <p className="max-w-[80%] text-[12px] font-medium leading-tight text-[#6B7280]">
            Operaciones cerradas
          </p>
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6]">
            <Clock3 size={15} strokeWidth={1.8} color="#6B7280" />
          </span>
        </div>
        <div>
          <p className="text-[32px] font-bold leading-none text-[#0F1117]">{String(closed)}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#9CA3AF]">
            <TrendingUp size={11} color="#10B981" />
            {stats.sold} vendidas y {stats.rented} alquiladas
          </p>
        </div>
      </div>
    </>
  )
}
