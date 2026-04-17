import { AdminShell } from '@/components/admin/admin-shell'
import { SectionCard } from '@/components/admin/section-card'
import { PropertiesTable } from '@/components/properties-table'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>
}) {
  const params = await searchParams

  return (
    <AdminShell
      title="Propiedades"
      description="Listado, estados y base operativa del circuito de publicación"
      action={{ label: 'Nueva propiedad', href: '/propiedades/nueva' }}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          eyebrow="Flujo base"
          title="Estados de publicación"
          description="El circuito de publicación ya contempla borrador, publicada, reservada, vendida y alquilada."
          items={['Borrador', 'Publicada', 'Reservada', 'Vendida', 'Alquilada']}
        />
        <SectionCard
          eyebrow="Filtros"
          title="Búsqueda útil desde el día uno"
          description="La pantalla de propiedades ya debería dejar visible el recorte comercial que más se usa para operar."
          items={[
            'Operación',
            'Tipo',
            'Ubicación',
            'Precio',
            'Dormitorios',
            'Código',
          ]}
        />
      </div>

      {params.created === '1' ? (
        <div className="card border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#166534]">Propiedad creada correctamente</p>
          <p className="mt-1 text-sm text-[#15803D]">
            La nueva propiedad ya quedó guardada y forma parte del listado conectado.
          </p>
        </div>
      ) : null}

      <PropertiesTable
        title="Listado principal"
        description="Listado conectado a Supabase, listo para seguir con acciones y filtros."
        ctaLabel="Crear propiedad"
        ctaHref="/propiedades/nueva"
      />
    </AdminShell>
  )
}
