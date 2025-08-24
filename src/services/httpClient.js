const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// Helper para construir headers (token opcional)
const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

// Manejo de errores centralizado
async function handleResponse(res, method, path) {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Error desconocido')
    throw new Error(`${method} ${path} ${res.status}: ${text}`)
  }
  return res.json()
}

// Obtener token de localStorage (si existe)
function getStoredToken() {
  try {
    return localStorage.getItem('token') || null
  } catch {
    return null
  }
}

// GET con soporte de query params
export async function httpGet(path, { token, query } = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v)
      }
    })
  }

  const tkn = token ?? getStoredToken()

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: defaultHeaders(tkn),
    credentials: 'include',
  })

  return handleResponse(res, 'GET', path)
}

// POST
export async function httpPost(path, body = {}, { token } = {}) {
  const url = `${BASE_URL}${path}`
  const tkn = token ?? getStoredToken()

  const res = await fetch(url, {
    method: 'POST',
    headers: defaultHeaders(tkn),
    body: JSON.stringify(body),
    credentials: 'include',
  })

  return handleResponse(res, 'POST', path)
}

// PUT
export async function httpPut(path, body = {}, { token } = {}) {
  const url = `${BASE_URL}${path}`
  const tkn = token ?? getStoredToken()

  const res = await fetch(url, {
    method: 'PUT',
    headers: defaultHeaders(tkn),
    body: JSON.stringify(body),
    credentials: 'include',
  })

  return handleResponse(res, 'PUT', path)
}

// DELETE
export async function httpDelete(path, { token } = {}) {
  const url = `${BASE_URL}${path}`
  const tkn = token ?? getStoredToken()

  const res = await fetch(url, {
    method: 'DELETE',
    headers: defaultHeaders(tkn),
    credentials: 'include',
  })

  return handleResponse(res, 'DELETE', path)
}
