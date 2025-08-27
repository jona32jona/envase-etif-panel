// src/services/expositores.api.js
import { httpGet, httpPost, httpDelete } from './httpClient' // 👈 agregar httpDelete si no estaba

// Endpoints (podés sobreescribirlos por .env si querés)
const ENDPOINT_EXPOSITORES =
  import.meta.env.VITE_EXPOSITORES_ENDPOINT || 'expositores/TODOS_PANEL/'

const MUTATION_ENDPOINT =
  import.meta.env.VITE_EXPOSITORES_BASE || 'expositores/'

// Base URL para multipart
const API_BASE = import.meta.env.VITE_API_URL ?? ''

// --- helpers internos para multipart ---
function getStoredToken() {
  try { return localStorage.getItem('token') || null } catch { return null }
}
async function handleResponse(res, method, path) {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Error desconocido')
    throw new Error(`${method} ${path} ${res.status}: ${text}`)
  }
  return res.json()
}
async function postMultipart(path, formData) {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // No seteamos Content-Type; el browser define el boundary
    },
    body: formData,
    credentials: 'include',
  })
  return handleResponse(res, 'POST', path)
}

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
 * POST insert/update (JSON o multipart si hay archivo)
 * Tu API hace INSERT si NO viene _id, UPDATE si viene _id.
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

// armar formData con campos permitidos + logo (File)
function toFormData(values = {}, file /* File */) {
  const fd = new FormData()
  // Campos de texto
  for (const k of allowed) {
    if (k === 'logo') continue // 'logo' (string) lo maneja el back al subir archivo
    if (values[k] !== undefined && values[k] !== null) {
      fd.append(k, k === 'activo'
        ? ((values[k] ? 1 : 0).toString())
        : String(values[k]))
    }
  }
  // archivo de logo (si viene)
  if (file instanceof File) {
    fd.append('logo', file) // <- el campo del archivo debe llamarse 'logo'
  }
  return fd
}

export async function createExpositor(values, file /* File opcional */) {
  if (file instanceof File) {
    // multipart: crea y sube logo
    const fd = toFormData(values, file)
    const res = await postMultipart(MUTATION_ENDPOINT, fd)
    const created = res?.row || res?.data || res || {}
    return mapApiRowToView(created)
  } else {
    // JSON tradicional
    const payload = toApiPayload(values)
    const res = await httpPost(MUTATION_ENDPOINT, payload)
    const created = res?.row || {}
    return mapApiRowToView(created)
  }
}

export async function updateExpositor(values, file /* File opcional */) {
  if (!values?._id) throw new Error('Falta _id para actualizar')

  if (file instanceof File) {
    // multipart: actualiza y reemplaza logo si se envía
    const fd = toFormData(values, file)
    fd.append('_id', String(values._id))
    const res = await postMultipart(MUTATION_ENDPOINT, fd)
    const updated = res?.row || res?.data || res || {}
    return mapApiRowToView(updated)
  } else {
    // JSON tradicional
    const payload = { _id: values._id, ...toApiPayload(values) }
    const res = await httpPost(MUTATION_ENDPOINT, payload)
    const updated = res?.row || {}
    return mapApiRowToView(updated)
  }
}

export async function deleteExpositor(id) {
  const _id = Number(id)
  if (!Number.isFinite(_id) || _id <= 0) throw new Error('ID inválido')
  try {
    // Preferido: ruta /ID/{_id}
    return await httpDelete(`${MUTATION_ENDPOINT}ID/${_id}`)
  } catch (e) {
    // Fallback: query ?_id=
    return await httpDelete(`${MUTATION_ENDPOINT}?_id=${_id}`)
  }
}