import { Building2, ChevronRight, Globe, LayoutDashboard, MessageSquare, Palette, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0891B2]">
              <Building2 size={16} color="white" strokeWidth={2.2} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-gray-900">Inmos.ia</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-[14px] font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-[#0891B2] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0E7490]"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-[13px] font-medium text-[#0891B2]">
              <Sparkles size={14} />
              Plataforma para inmobiliarias argentinas
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Tu inmobiliaria,{' '}
              <span className="bg-gradient-to-r from-[#0891B2] to-[#06B6D4] bg-clip-text text-transparent">
                online y organizada
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-500 sm:text-xl">
              Publicá propiedades, recibí consultas y tené tu sitio web profesional en minutos.
              Sin conocimientos técnicos. Todo desde un solo panel.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0891B2] px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-cyan-200/50 transition-all hover:bg-[#0E7490] hover:shadow-xl hover:shadow-cyan-200/50"
              >
                Crear mi cuenta gratis
                <ChevronRight size={16} />
              </Link>
              <Link
                href="#funcionalidades"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-8 py-3.5 text-[15px] font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Ver funcionalidades
              </Link>
            </div>

            <p className="mt-5 text-[13px] text-gray-400">
              Sin tarjeta de crédito. Configurá todo en menos de 10 minutos.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitás para operar
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Un sistema pensado para la operación diaria de inmobiliarias reales.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="Gestión de propiedades"
              description="Cargá propiedades con fotos, precios, características y campos personalizados. Controlá el estado de cada publicación."
            />
            <FeatureCard
              icon={Globe}
              title="Sitio web profesional"
              description="Tu propio sitio con dominio personalizado, adaptado a tu marca. Sin tocar código, todo editable desde el panel."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Captura de consultas"
              description="Cada consulta desde tu sitio llega al panel. Sabé de qué propiedad vienen y respondé rápido."
            />
            <FeatureCard
              icon={Palette}
              title="Tu marca, tu estilo"
              description="Elegí colores, tipografías y temas. Personalizá secciones del sitio para que refleje tu identidad."
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Panel de control"
              description="Dashboard con métricas clave, actividad reciente y acceso rápido a todo lo importante."
            />
            <FeatureCard
              icon={Zap}
              title="Rápido y simple"
              description="Interfaz diseñada para agilizar la operación diaria. Sin complejidad innecesaria."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Empezá en 3 pasos
            </h2>
          </div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            <StepCard
              number="1"
              title="Creá tu cuenta"
              description="Registrate con Google en segundos. Sin formularios largos."
            />
            <StepCard
              number="2"
              title="Configurá tu inmobiliaria"
              description="Subí tu logo, elegí colores y personalizá tu sitio web."
            />
            <StepCard
              number="3"
              title="Publicá propiedades"
              description="Cargá tus propiedades y compartilas desde tu sitio profesional."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0891B2] to-[#0E7490] px-8 py-16 text-center sm:px-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Llevá tu inmobiliaria al siguiente nivel
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-cyan-100">
                Unite a las inmobiliarias que ya gestionan sus propiedades y clientes de forma profesional.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-[15px] font-semibold text-[#0891B2] shadow-lg transition-all hover:bg-cyan-50"
              >
                Comenzar ahora
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0891B2]">
                <Building2 size={14} color="white" strokeWidth={2.2} />
              </div>
              <span className="text-[15px] font-bold text-gray-900">Inmos.ia</span>
            </div>
            <p className="text-[13px] text-gray-400">
              &copy; {new Date().getFullYear()} Inmos.ia. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-gray-100/50">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h3 className="text-[16px] font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0891B2] text-[18px] font-bold text-white">
        {number}
      </div>
      <h3 className="text-[16px] font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}
