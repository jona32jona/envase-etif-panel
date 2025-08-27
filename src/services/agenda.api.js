// src/services/agenda.api.js
import { httpGet, httpPost, httpDelete } from './httpClient'

// Endpoints (overrideables por .env)
const LIST_ENDPOINT =
  import.meta.env.VITE_EVENTOS_ENDPOINT || 'eventos/TODOS_PANEL/'

const MUTATION_ENDPOINT =
  import.meta.env.VITE_EVENTOS_BASE || 'eventos/'

// Helpers
const clip = (txt, n = 300) => {
  if (!txt) return '—'
  const s = String(txt)
  return s.length > n ? `${s.slice(0, n).trim()}…` : s
}

const toDisplayDateTime = (v) => {
  if (!v) return '—'
  const s = String(v).replace('T', ' ')
  // Esperamos "YYYY-MM-DD HH:mm[:ss]"
  return s.length >= 16 ? s.slice(0, 16) : s
}

const toMySQLDateTime = (v) => {
  if (!v) return null
  // Acepta "YYYY-MM-DDTHH:mm" o "YYYY-MM-DD HH:mm" y normaliza a "YYYY-MM-DD HH:mm:00"
  const s = String(v).trim()
  const base = s.replace('T', ' ')
  const hasSeconds = /:\d{2}:\d{2}$/.test(base)
  const hasMinutes = /:\d{2}$/.test(base)
  if (hasSeconds) return base
  if (hasMinutes) return `${base}:00`
  return base // si viene con otro formato, lo dejamos tal cual
}

// --- Mapper: fila de API -> fila para la tabla
export function mapApiRowToView(it = {}) {
  return {
    _id: it._id ?? it.id ?? null,
    nombre: it.nombre ?? '—',
    orador: it.orador ?? '—',
    lugar: it.lugar ?? '—',
    descripcion: clip(it.descripcion, 140),
    fecha_hora: toDisplayDateTime(it.fecha_hora),
    activo: it.activo === 1 || it.activo === '1' || it.activo === true ? 'Sí' : 'No',
    _raw: it,
  }
}

/**
 * GET lista
 * Soporta respuesta como array directo o { data, total }.
 */
export async function fetchAgenda({ page = 1, limit = 200, search = '' } = {}) {
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

// Whitelist columnas aceptadas por el backend
const allowed = ['nombre', 'orador', 'lugar', 'descripcion', 'fecha_hora', 'activo']

function toApiPayload(values = {}) {
  const out = {}
  for (const k of allowed) {
    if (values[k] !== undefined) out[k] = values[k]
  }
  if ('activo' in out) {
    const v = out.activo
    out.activo =
      typeof v === 'number' ? (v ? 1 : 0)
      : /^(true|1|sí|si)$/i.test(String(v)) ? 1 : 0
  }
  if ('fecha_hora' in out && out.fecha_hora) {
    out.fecha_hora = toMySQLDateTime(out.fecha_hora)
  }
  return out
}

export async function createAgenda(values) {
  const payload = toApiPayload(values)
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  const created = res?.row || res?.data || payload
  return mapApiRowToView(created)
}

export async function updateAgenda(values) {
  if (!values?._id) throw new Error('Falta _id para actualizar')
  const payload = { _id: values._id, ...toApiPayload(values) }
  const res = await httpPost(MUTATION_ENDPOINT, payload)
  const updated = res?.row || res?.data || payload
  return mapApiRowToView(updated)
}

export async function deleteAgenda(id) {
  const _id = Number(id)
  if (Number.isNaN(_id)) throw new Error('ID inválido')
  try {
    // Opción A: DELETE /eventos/:id
    const res = await httpDelete(`${MUTATION_ENDPOINT}${_id}`)
    return res ?? { ok: true }
  } catch {
    // Opción B: POST con flag de borrado
    const res = await httpPost(MUTATION_ENDPOINT, { _id, __delete: 1 })
    return res ?? { ok: true }
  }
}
