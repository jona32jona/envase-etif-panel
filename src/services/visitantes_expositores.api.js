// src/services/visitantes_expositores.api.js
import { httpGet, httpPost, httpDelete } from './httpClient'

// Endpoints overrideables por .env
const LIST_ENDPOINT =
  import.meta.env.VITE_VISITANTES_EXPO_ENDPOINT ||
  'visitantes_expositores/TODOS_PANEL/'

const BASE =
  import.meta.env.VITE_VISITANTES_EXPO_BASE ||
  'visitantes_expositores/'

const APPROVE_ENDPOINT = `${BASE}APROBAR`              // POST
const DELETE_ID_PREFIX = `${BASE}ID/`                  // DELETE /ID/{_id}

// Mapper fila API -> vista
export function mapSolicitud(it = {}) {
  return {
    _id: it._id ?? it.id ?? null,
    id_visitante: it.id_visitante ?? null,
    nombreyapellido: it.nombreyapellido ?? it.nombre ?? '—',
    email: it.email ?? '—',
    fecha_solicitud: it.fecha_solicitud ?? '—',
    app: (it.app === 1 || it.app === '1') ? 'Sí' : 'No',
    id_expositor: it.id_expositor ?? it.expositor_id ?? null,
    expositor: it.expositor ?? it.nombre_expositor ?? '—',
    _raw: it
  }
}

// GET: listar pendientes
export async function fetchSolicitudesVisitantes() {
  const json = await httpGet(LIST_ENDPOINT)
  const arr = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  return arr.map(mapSolicitud)
}

// POST: aprobar solicitud  {_id, admin}
export async function approveSolicitudVisitante({_id, admin = 0}) {
  const body = { _id: Number(_id), admin: admin ? 1 : 0 }
  const res = await httpPost(APPROVE_ENDPOINT, body)
  return res // { status: "approved" | "already_exists", ... }
}

// DELETE: eliminar solicitud
export async function deleteSolicitudVisitante(_id) {
  const id = Number(_id)
  if (!Number.isFinite(id)) throw new Error('ID inválido')
  return httpDelete(`${DELETE_ID_PREFIX}${id}`)
}
