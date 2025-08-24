// src/pages/Logout.jsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Logout = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)

  const handleCancel = useCallback(() => {
    navigate('/', { replace: true })
  }, [navigate])

  const handleConfirm = useCallback(() => {
    if (submitting) return
    setSubmitting(true)
    // Si tu backend tuviera endpoint para invalidar tokens, llamalo acá
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate, submitting])

  // Soporte: /salir?force=1 (o ?auto=1 / ?confirm=1) -> desloguea sin preguntar
  useEffect(() => {
    const force = searchParams.get('force') || searchParams.get('auto') || searchParams.get('confirm')
    if (force) {
      handleConfirm()
    }
  }, [searchParams, handleConfirm])

  // Si ya no está autenticado, redirige a login
  useEffect(() => {
    if (!isAuthenticated && !submitting) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, submitting, navigate])

  // Accesibilidad: Enter confirma, Escape cancela
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Enter') handleConfirm()
      if (e.key === 'Escape') handleCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleConfirm, handleCancel])

  if (!isAuthenticated) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        className="w-[92%] max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">¿Cerrar sesión?</h2>
        <p className="text-gray-600 mb-4">
          {user?.name ? (
            <>Vas a salir de la cuenta <strong>{user.name}</strong>.</>
          ) : (
            <>Vas a salir de tu cuenta actual.</>
          )}{' '}
          Podés volver a entrar cuando quieras.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar (Esc)
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${
              submitting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? 'Cerrando…' : 'Cerrar sesión (Enter)'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Logout
