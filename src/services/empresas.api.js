import { httpGet } from './httpClient'

export async function fetchEmpresas({ page = 1, limit = 50, search = '', token } = {}) {
  const json = await httpGet('/empresas/TODASPANEL/', {
    token,
    query: { page, limit, search }
  })

  // Si tu API devuelve array directo
  const data = Array.isArray(json)
  ? json
  : Array.isArray(json?.data)
    ? json.data
    : []

  // Mapeamos a la estructura usada en la UI
  const rows = data.map(it => ({
    name: it.nombre ?? '—',
    cuit: it.codigo_fijo ?? it.codigo ?? '—',
    direccion: it.domicilio ?? '—',
    email: it.email ?? '—',
    tipoServicio: it.tipoServicio ?? '—',
    fechaCodigo: it.fecha_codigo ?? '—',
  }))

  return {
    rows,
    total: data.length,
  }
}