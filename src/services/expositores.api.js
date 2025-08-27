// src/services/expositores.api.js
import { httpGet, httpPost } from './httpClient'

// Endpoints (podés sobreescribirlos por .env si querés)
const ENDPOINT_EXPOSITORES =
  import.meta.env.VITE_EXPOSITORES_ENDPOINT || 'expositores/TODOS_PANEL/'

const MUTATION_ENDPOINT =
  import.meta.env.VITE_EXPOSITORES_BASE || 'expositores/'

const clip = (txt, n = 500) => {
  if (!txt) return '—'
  const s = String(txt)
  return s.length > n ? `${s.slice(0, n).trim()}…` : s
}

// --- Mapper: fila de API -> fila de la tabla
export function mapApiRowToView(it) {
  return {
    _id: it._id ?? it.id ?? null,
    name: it.nombre ?? '—',
    email: it.email ?? '—',
    telefono: it.telefono ?? '—',
    web: it.web ?? '—',
    marcas: it.marcas ?? '—',
    domicilio: it.domicilio ?? '—',
    cp: it.cp ?? '—',
    localidad: it.localidad ?? '—',
    provincia: it.provincia ?? '—',
    pais: it.pais ?? '—',
    descripcion: clip(it.descripcion, 140),
    descripcion_i: clip(it.descripcion_i, 140),
    activo: it.activo === 1 || it.activo === '1' ? 'Sí' : 'No',
    logo: it.logo ?? '',
    _raw: it,
  }
}

/**
 * GET lista
 * Soporta respuesta como array directo o { data, total }.
 */
export async function fetchExpositores({ page = 1, limit = 50, search = '' } = {}) {
  const json = await httpGet(ENDPOINT_EXPOSITORES, {
    query: { page, limit, search },
  })

  const data = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : []

  const total =
    (typeof json?.total === 'number' && json.total) ||
    (typeof json?.count === 'number' && json.count) ||
    data.length

  const rows = data.map(mapApiRowToView)
  return { rows, total }
}

/**
 * POST insert/update
 * Tu API hace INSERT si NO viene _id, UPDATE si viene _id.
 * Exponemos helpers separados por claridad.
 */

// Columnas permitidas por el backend (whitelist)
const allowed = [
  'email', 'nombre', 'domicilio', 'cp', 'localidad', 'provincia', 'pais',
  'telefono', 'web', 'marcas', 'descripcion', 'descripcion_i', 'logo', 'activo',
]

// Normaliza payload y convierte activo a 0/1
function toApiPayload(values) {
  const out = {}
  for (const k of allowed) {
    if (values[k] !== undefined) out[k] = values[k]
  }
  if ('activo' in out) {
    const v = out.activo
    out.activo =
      typeof v === 'number' ? (v ? 1 : 0) :
      /^(true|1)$/i.test(String(v)) ? 1 : 0
  }
  return out
}

export async function createExpositor(values) {
  const payload = toApiPayload(values)
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  // API: { status: "created", row: { ... } }
  const created = res?.row || {}
  return mapApiRowToView(created)
}


export async function updateExpositor(values) {
  console.log('[updateExpositor] payload ->', values) // debería incluir _id
  if (!values?._id) throw new Error('Falta _id para actualizar')
  const payload = { _id: values._id, ...toApiPayload(values) }
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  console.log('[updateExpositor] respuesta ->', res)
  const updated = res?.row || {}
  return mapApiRowToView(updated)
}
