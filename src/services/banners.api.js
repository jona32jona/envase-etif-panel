// src/services/banners.api.js
import { httpGet, httpPost, httpDelete } from './httpClient'

const LIST_ENDPOINT =
  import.meta.env.VITE_BANNERS_ENDPOINT || 'banners/TODOS_PANEL/'

const BASE =
  import.meta.env.VITE_BANNERS_BASE || 'banners/'

// Base URL (para multipart usamos fetch directo)
const API_BASE = import.meta.env.VITE_API_URL ?? ''

// --- helpers internos (multipart) ---
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
      // ❗️NO seteamos Content-Type: el navegador define boundary
    },
    body: formData,
    credentials: 'include',
  })
  return handleResponse(res, 'POST', path)
}

const clip = (txt, n = 120) => {
  if (!txt) return '—'
  const s = String(txt)
  return s.length > n ? `${s.slice(0, n).trim()}…` : s
}

// --- Mapper API -> view
export function mapApiRowToView(it = {}) {
  const activo = it.activo === 1 || it.activo === '1' || it.activo === true
  const app = it.app === 1 || it.app === '1' || it.app === true
  return {
    _id: it._id ?? it.id ?? null,
    nombre: it.nombre ?? '—',
    imagen: it.imagen ?? '',
    link: it.link ?? '—',
    activo: activo ? 'Sí' : 'No',
    id_exposicion: it.id_exposicion ?? null,
    _raw: it,
    _bools: { activo, app },
  }
}

// --- GET lista banners
export async function fetchBanners({ page = 1, limit = 200, search = '' } = {}) {
  const json = await httpGet(LIST_ENDPOINT, { query: { page, limit, search } })
  const data = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  const total =
    (typeof json?.total === 'number' && json.total) ||
    (typeof json?.count === 'number' && json.count) ||
    data.length
  const rows = data.map(mapApiRowToView)
  return { rows, total }
}

// --- payload JSON (cuando no hay archivo)
const allowed = ['nombre', 'link', 'activo', 'app']
function toApiJson(values = {}) {
  const out = {}
  for (const k of allowed) if (values[k] !== undefined) out[k] = values[k]
  if ('activo' in out) {
    const v = out.activo
    out.activo = typeof v === 'number' ? (v ? 1 : 0) : /^(true|1|sí|si)$/i.test(String(v)) ? 1 : 0
  }
  if ('app' in out) {
    const v = out.app
    out.app = typeof v === 'number' ? (v ? 1 : 0) : /^(true|1|sí|si)$/i.test(String(v)) ? 1 : 0
  }
  return out
}

// --- create/update con soporte de archivo opcional
export async function createBanner(values = {}, file /* File | undefined */) {
  if (file instanceof File) {
    const fd = new FormData()
    fd.append('nombre', values.nombre ?? '')
    fd.append('link', values.link ?? '')
    fd.append('activo', (values.activo ? 1 : 0).toString())
    fd.append('app', '0')                         // 👈 forzado
    fd.append('imagen', file) // <- campo requerido por el back
    const res = await postMultipart(BASE, fd)
    const created = res?.row || res?.data || res || values
    return mapApiRowToView(created)
  } else {
    // Sin archivo, JSON común
    const payload = toApiJson(values)
    const res = await httpPost(BASE, payload)
    const created = res?.row || res?.data || res || values
    return mapApiRowToView(created)
  }
}

export async function updateBanner(values = {}, file /* File | undefined */) {
  const id = values?._id ?? values?.id
  if (!id) throw new Error('Falta _id para actualizar')

  if (file instanceof File) {
    const fd = new FormData()
    fd.append('_id', String(id))
    if (values.nombre != null) fd.append('nombre', values.nombre)
    if (values.link != null) fd.append('link', values.link)
    if (values.activo != null) fd.append('activo', (values.activo ? 1 : 0).toString())
    fd.append('app', '0')                         // 👈 forzado
    fd.append('imagen', file) // reemplaza imagen en el back
    const res = await postMultipart(BASE, fd)
    const updated = res?.row || res?.data || res || values
    return mapApiRowToView(updated)
  } else {
    const payload = { _id: id, ...toApiJson(values) }
    const res = await httpPost(BASE, payload)
    const updated = res?.row || res?.data || res || values
    return mapApiRowToView(updated)
  }
}

export async function deleteBanner(id) {
  const _id = Number(id)
  if (Number.isNaN(_id)) throw new Error('ID inválido')
  // DELETE /banners/ID/{_id}
  return httpDelete(`${BASE}ID/${_id}`)
}
