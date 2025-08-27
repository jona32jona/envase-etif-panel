// src/services/expositores_usuarios.api.js
import { httpGet, httpPost, httpDelete } from './httpClient'

// Endpoints (overrideables por .env)
const LIST_ENDPOINT =
  import.meta.env.VITE_EXPOSITORES_USUARIOS_ENDPOINT
  || 'expositores_usuarios/TODOS_PANEL/'

const MUTATION_ENDPOINT =
  import.meta.env.VITE_EXPOSITORES_USUARIOS_BASE
  || 'expositores_usuarios/'

// Endpoint para el combo de expositores
const EXPO_LIST_ENDPOINT =
  import.meta.env.VITE_EXPOSITORES_USUARIOS_EXPO_LIST
  || 'expositores_usuarios/EXPOSITORES_LIST/'

const clip = (txt, n = 500) => {
  if (!txt) return '—'
  const s = String(txt)
  return s.length > n ? `${s.slice(0, n).trim()}…` : s
}

// --- Mapper: fila de API -> fila de la tabla
export function mapApiRowToView(it = {}) {
  const adminBool =
    it.admin === 1 || it.admin === '1' || it.admin === true || it.admin === 'true'

  const nombreExpositor =
    it.nombre_expositor ??
    it.expositor_nombre ??
    it.expositor?.nombre ??
    it.expositor?.name ??
    '—'

  return {
    _id: it._id ?? it.id ?? null,
    id_expositor: it.id_expositor ?? it.expositor_id ?? it.expositorId ?? null,
    nombre_expositor: nombreExpositor,
    email: it.email ?? '—',
    nombre: it.nombre ?? it.name ?? '—',
    admin: adminBool ? 'Sí' : 'No',
    codigo: it.codigo ?? '—',
    fecha_codigo: it.fecha_codigo ?? it.fechaCodigo ?? '—',
    _raw: it,
  }
}

/**
 * GET lista de usuarios de expositores
 * Soporta respuesta como array directo o { data, total }.
 */
export async function fetchExpositoresUsuarios({ page = 1, limit = 200, search = '' } = {}) {
  const json = await httpGet(LIST_ENDPOINT, { query: { page, limit, search } })

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
 * Lista de expositores para el select del modal
 * Devuelve [{ value, label, _id, nombre }]
 */
export async function fetchExpositoresUsuariosList() {
  const json = await httpGet(EXPO_LIST_ENDPOINT)
  const arr = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : []

  return arr
    .map(it => {
      const idNum = Number(it._id ?? it.id ?? it.id_expositor ?? it.expositor_id)
      const nombre = it.nombre ?? it.nombre_expositor ?? it.expositor_nombre ?? `Expositor #${idNum || ''}`
      return {
        value: String(idNum), // <- 👈 select-friendly
        label: nombre,
        _id: idNum,           // útil si lo necesitás numérico
        nombre,
        _raw: it,
      }
    })
    .filter(opt => Number.isFinite(opt._id))
}

// Columnas permitidas (whitelist)
const allowed = [
  '_id', 'id_expositor', 'email', 'nombre', 'admin', 'codigo', 'fecha_codigo'
]

// Normaliza payload a lo que espera el backend
function toApiPayload(values = {}) {
  const out = {}
  for (const k of allowed) {
    if (values[k] !== undefined && values[k] !== null) out[k] = values[k]
  }

  // admin -> 0/1
  if ('admin' in out) {
    const v = out.admin
    out.admin =
      typeof v === 'number' ? (v ? 1 : 0)
      : /^(true|1|sí|si)$/i.test(String(v)) ? 1 : 0
  }

  // ids numéricos por las dudas
  if ('_id' in out && out._id !== null) out._id = Number(out._id)
  if ('id_expositor' in out && out.id_expositor !== null) out.id_expositor = Number(out.id_expositor)

  // normaliza strings vacíos a undefined en campos opcionales
  if (out.codigo === '') delete out.codigo
  if (out.fecha_codigo === '') delete out.fecha_codigo

  return out
}

export async function createExpositorUsuario(values) {
  const payload = toApiPayload(values)
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  const created = res?.row || res?.data || payload // fallback
  return mapApiRowToView(created)
}

export async function updateExpositorUsuario(values) {
  if (!values?._id) throw new Error('Falta _id para actualizar')
  const payload = toApiPayload(values)
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  const updated = res?.row || res?.data || payload // fallback
  return mapApiRowToView(updated)
}

export async function deleteExpositorUsuario(id) {
  const _id = Number(id)
  if (Number.isNaN(_id)) throw new Error('ID inválido')

  try {
    // Opción A: DELETE /expositores_usuarios/:id
    const res = await httpDelete(`${MUTATION_ENDPOINT}${_id}`)
    return res ?? { ok: true }
  } catch {
    // Opción B (fallback): POST con flag de borrado
    const res = await httpPost(MUTATION_ENDPOINT, { _id, __delete: 1 })
    return res ?? { ok: true }
  }
}
