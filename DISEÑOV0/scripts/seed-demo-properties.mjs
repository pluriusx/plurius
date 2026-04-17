import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const contents = fs.readFileSync(filePath, 'utf8')

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)

    if (!match) {
      continue
    }

    const [, key, rawValue] = match

    if (process.env[key] !== undefined) {
      continue
    }

    let value = rawValue.trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function isoDaysAgo(daysAgo) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString()
}

function stableUuid(seed) {
  const hex = createHash('sha1').update(seed).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function getEnv() {
  loadEnvFile(path.join(projectRoot, '.env.local'))
  loadEnvFile(path.join(projectRoot, '.env'))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y/o una key usable. Usá SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return {
    supabaseUrl,
    supabaseKey,
    agencySlug: (process.env.INMOBIA_DEFAULT_AGENCY_SLUG ?? 'agencia-demo').trim().toLowerCase(),
    agencyName: (process.env.INMOBIA_DEFAULT_AGENCY_NAME ?? 'Agencia Demo').trim(),
  }
}

async function ensureAgency(supabase, agencySlug, agencyName) {
  const existingAgencyResponse = await supabase
    .from('agencies')
    .select('id, slug, name')
    .eq('slug', agencySlug)
    .maybeSingle()

  if (existingAgencyResponse.error) {
    throw existingAgencyResponse.error
  }

  if (existingAgencyResponse.data) {
    return existingAgencyResponse.data
  }

  const insertedAgencyResponse = await supabase
    .from('agencies')
    .insert({
      id: stableUuid(`agency:${agencySlug}`),
      slug: agencySlug,
      name: agencyName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, slug, name')
    .single()

  if (!insertedAgencyResponse.error) {
    return insertedAgencyResponse.data
  }

  const retryAgencyResponse = await supabase
    .from('agencies')
    .select('id, slug, name')
    .eq('slug', agencySlug)
    .maybeSingle()

  if (retryAgencyResponse.error) {
    throw retryAgencyResponse.error
  }

  if (!retryAgencyResponse.data) {
    throw insertedAgencyResponse.error
  }

  return retryAgencyResponse.data
}

function buildDemoProperties(agencyId) {
  const items = [
    {
      title: 'Casa de 3 dormitorios con patio en General Paz',
      internal_code: 'DEMO-001',
      operation: 'venta',
      property_type: 'casa',
      price_amount: '185000',
      currency: 'USD',
      status: 'publicada',
      show_price: true,
      address: 'Rosario de Santa Fe 1450',
      city: 'Córdoba',
      neighborhood: 'General Paz',
      location_mode: 'exacta',
      bedrooms: 3,
      bathrooms: 2,
      covered_area: '148',
      total_area: '220',
      description:
        'Propiedad lista para habitar, con living comedor amplio, cocina separada y patio verde ideal para familia.',
      meta_title: 'Casa en venta en General Paz',
      meta_description:
        'Casa de 3 dormitorios con patio y cochera en General Paz. Lista para publicar en el MVP.',
      created_at: isoDaysAgo(1),
    },
    {
      title: 'Departamento de 1 dormitorio en Nueva Córdoba',
      internal_code: 'DEMO-002',
      operation: 'alquiler_anual',
      property_type: 'departamento',
      price_amount: '650000',
      currency: 'ARS',
      status: 'publicada',
      show_price: true,
      address: 'Obispo Trejo 980',
      city: 'Córdoba',
      neighborhood: 'Nueva Córdoba',
      location_mode: 'exacta',
      bedrooms: 1,
      bathrooms: 1,
      covered_area: '48',
      total_area: '52',
      description:
        'Unidad luminosa, con balcón al frente y excelente acceso a Ciudad Universitaria y zona gastronómica.',
      meta_title: 'Departamento en alquiler en Nueva Córdoba',
      meta_description:
        'Departamento de 1 dormitorio en alquiler anual, ideal para estudiantes o profesionales.',
      created_at: isoDaysAgo(2),
    },
    {
      title: 'Local comercial vidriado en el Centro',
      internal_code: 'DEMO-003',
      operation: 'alquiler_anual',
      property_type: 'local',
      price_amount: '980000',
      currency: 'ARS',
      status: 'borrador',
      show_price: false,
      address: 'Av. Colón 320',
      city: 'Córdoba',
      neighborhood: 'Centro',
      location_mode: 'aproximada',
      bedrooms: null,
      bathrooms: 1,
      covered_area: '95',
      total_area: '95',
      description:
        'Local con frente vidriado, alto tránsito peatonal y espacio flexible para showroom, oficina o retail.',
      meta_title: 'Local comercial en el Centro',
      meta_description:
        'Local comercial sobre avenida con excelente visibilidad. Queda como borrador para pruebas del flujo.',
      created_at: isoDaysAgo(3),
    },
    {
      title: 'Terreno apto desarrollo en Villa Belgrano',
      internal_code: 'DEMO-004',
      operation: 'venta',
      property_type: 'terreno',
      price_amount: '145000',
      currency: 'USD',
      status: 'reservada',
      show_price: true,
      address: 'Las Magnolias 5400',
      city: 'Córdoba',
      neighborhood: 'Villa Belgrano',
      location_mode: 'aproximada',
      bedrooms: null,
      bathrooms: null,
      covered_area: null,
      total_area: '720',
      description:
        'Lote de muy buen frente, con entorno residencial consolidado y potencial para vivienda o desarrollo boutique.',
      meta_title: 'Terreno en venta en Villa Belgrano',
      meta_description:
        'Terreno amplio y reservado en Villa Belgrano para testear estados intermedios del sistema.',
      created_at: isoDaysAgo(4),
    },
    {
      title: 'Dúplex moderno en Cerro de las Rosas',
      internal_code: 'DEMO-005',
      operation: 'venta',
      property_type: 'duplex',
      price_amount: '210000',
      currency: 'USD',
      status: 'publicada',
      show_price: true,
      address: 'Tejeda 4100',
      city: 'Córdoba',
      neighborhood: 'Cerro de las Rosas',
      location_mode: 'exacta',
      bedrooms: 3,
      bathrooms: 3,
      covered_area: '172',
      total_area: '210',
      description:
        'Dúplex con diseño contemporáneo, cochera, asador y distribución pensada para vida cotidiana cómoda.',
      meta_title: 'Dúplex en venta en Cerro de las Rosas',
      meta_description:
        'Dúplex de 3 dormitorios con cochera y patio en una de las zonas más buscadas de Córdoba.',
      created_at: isoDaysAgo(5),
    },
    {
      title: 'Departamento temporario equipado en Güemes',
      internal_code: 'DEMO-006',
      operation: 'alquiler_temporario',
      property_type: 'departamento',
      price_amount: '75',
      currency: 'USD',
      status: 'publicada',
      show_price: true,
      address: 'Belgrano 890',
      city: 'Córdoba',
      neighborhood: 'Güemes',
      location_mode: 'oculta',
      bedrooms: 1,
      bathrooms: 1,
      covered_area: '44',
      total_area: '47',
      description:
        'Unidad amoblada y lista para alquiler temporario, cerca del polo gastronómico y cultural.',
      meta_title: 'Departamento temporario en Güemes',
      meta_description:
        'Propiedad ideal para probar publicaciones temporarias con ubicación oculta en el sistema.',
      created_at: isoDaysAgo(6),
    },
    {
      title: 'Casa reciclada con cochera en Alta Córdoba',
      internal_code: 'DEMO-007',
      operation: 'venta',
      property_type: 'casa',
      price_amount: '132000',
      currency: 'USD',
      status: 'vendida',
      show_price: true,
      address: 'Jerónimo Luis de Cabrera 2150',
      city: 'Córdoba',
      neighborhood: 'Alta Córdoba',
      location_mode: 'exacta',
      bedrooms: 2,
      bathrooms: 2,
      covered_area: '126',
      total_area: '180',
      description:
        'Casa reciclada con ambientes amplios y cochera. Se usa para validar cierres de venta en el dashboard.',
      meta_title: 'Casa vendida en Alta Córdoba',
      meta_description:
        'Caso demo de propiedad vendida para que los KPIs reflejen operaciones cerradas.',
      created_at: isoDaysAgo(7),
    },
    {
      title: 'Departamento de 2 dormitorios en Cofico',
      internal_code: 'DEMO-008',
      operation: 'alquiler_anual',
      property_type: 'departamento',
      price_amount: '720000',
      currency: 'ARS',
      status: 'alquilada',
      show_price: true,
      address: 'Bedoya 760',
      city: 'Córdoba',
      neighborhood: 'Cofico',
      location_mode: 'exacta',
      bedrooms: 2,
      bathrooms: 1,
      covered_area: '63',
      total_area: '68',
      description:
        'Departamento con buena distribución y balcón, marcado como alquilado para mostrar cierre de alquiler.',
      meta_title: 'Departamento alquilado en Cofico',
      meta_description:
        'Caso demo de propiedad alquilada para completar el circuito mínimo del MVP.',
      created_at: isoDaysAgo(8),
    },
  ]

  return items.map((item) => ({
    id: stableUuid(`property:${agencyId}:${item.internal_code}`),
    agency_id: agencyId,
    ...item,
    show_price: item.show_price ? 1 : 0,
    slug: slugify(item.title),
    updated_at: item.created_at,
  }))
}

async function main() {
  const { supabaseUrl, supabaseKey, agencySlug, agencyName } = getEnv()
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const agency = await ensureAgency(supabase, agencySlug, agencyName)
  const demoProperties = buildDemoProperties(agency.id)

  const upsertResponse = await supabase
    .from('properties')
    .upsert(demoProperties, {
      onConflict: 'agency_id,internal_code',
      ignoreDuplicates: false,
    })
    .select('id, internal_code, title, status')

  if (upsertResponse.error) {
    throw upsertResponse.error
  }

  const countResponse = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('agency_id', agency.id)

  if (countResponse.error) {
    throw countResponse.error
  }

  console.log(`Agencia demo: ${agency.slug} (${agency.id})`)
  console.log(`Propiedades seed insertadas/actualizadas: ${upsertResponse.data.length}`)
  console.log(`Total actual en la agencia: ${countResponse.count ?? 0}`)

  for (const property of upsertResponse.data) {
    console.log(`- ${property.internal_code}: ${property.title} [${property.status}]`)
  }
}

main().catch((error) => {
  console.error('No se pudo ejecutar el seed de propiedades demo.')
  console.error(error)
  process.exitCode = 1
})
