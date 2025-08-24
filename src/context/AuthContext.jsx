// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const AuthContext = createContext()

const LS_TOKEN = 'token'
const LS_USER = 'user'

function safeParse(json) {
  if (json == null) return null
  const s = String(json).trim()
  if (!s || s === 'undefined' || s === 'null') return null
  try { return JSON.parse(s) } catch { return null }
}

function readToken() {
  try { return localStorage.getItem(LS_TOKEN) || null } catch { return null }
}
function writeToken(v) {
  try { v ? localStorage.setItem(LS_TOKEN, v) : localStorage.removeItem(LS_TOKEN) } catch {}
}
function readUser() {
  return safeParse(localStorage.getItem(LS_USER))
}
function writeUser(u) {
  try { u ? localStorage.setItem(LS_USER, JSON.stringify(u)) : localStorage.removeItem(LS_USER) } catch {}
}

// Decodifica un JWT (sin verificar firma) para leer exp
function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch { return null }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const logoutTimer = useRef(null)

  // programa un auto-logout cuando expira el token
  const scheduleAutoLogout = (tkn) => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    const payload = decodeJwt(tkn)
    if (!payload?.exp) return
    const ms = payload.exp * 1000 - Date.now()
    if (ms > 0) {
      logoutTimer.current = setTimeout(() => logout(), ms)
    } else {
      // ya expiró
      logout()
    }
  }

  // hidratación inicial desde localStorage
  useEffect(() => {
    const t = readToken()
    const u = readUser()
    if (t) {
      const payload = decodeJwt(t)
      if (payload?.exp && payload.exp * 1000 > Date.now()) {
        setToken(t)
        setUser(u ?? { id: payload.id ?? payload.sub, email: payload.email, name: payload.name ?? '', role: payload.role ?? 'usuario' })
        scheduleAutoLogout(t)
      } else {
        // expirado o inválido
        writeToken(null)
        writeUser(null)
      }
    }
    setHydrated(true)
    // cleanup
    return () => logoutTimer.current && clearTimeout(logoutTimer.current)
  }, [])

  // login: guarda y programa auto-logout
  const login = ({ token: tkn, user: usr }) => {
    setToken(tkn || null)
    setUser(usr || null)
    writeToken(tkn || null)
    writeUser(usr || null)
    if (tkn) scheduleAutoLogout(tkn)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    writeToken(null)
    writeUser(null)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
  }

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user])

  const value = useMemo(() => ({ user, token, isAuthenticated, login, logout, hydrated }), [
    user, token, isAuthenticated, hydrated
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
