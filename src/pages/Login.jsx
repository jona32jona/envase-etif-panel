// src/pages/Login.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestLoginCode, verifyLoginCode } from '../services/auth.api'
import { useLoading } from '../context/LoadingContext'

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { show, hide } = useLoading()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1: email, 2: code
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0) // segs para reenvío
  const tickRef = useRef(null)

  const emailTrimmed = useMemo(() => email.trim().toLowerCase(), [email])
  const codeTrimmed = useMemo(() => code.trim(), [code])

  const canSendEmail = emailRegex.test(emailTrimmed) && !submitting
  const canVerify = codeTrimmed.length > 0 && !submitting

  useEffect(() => {
    // cleanup timer
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  const startCooldown = (seconds = 30) => {
    setCooldown(seconds)
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(tickRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRequestCode = async () => {
    if (!canSendEmail) return
    setError(null)
    setSubmitting(true)
    show()
    try {
      await requestLoginCode(emailTrimmed)
      setStep(2)
      startCooldown(30)
    } catch (err) {
      console.error('[Login] requestLoginCode error:', err)
      setError('Usuario incorrecto. Verificá el email.')
    } finally {
      hide()
      setSubmitting(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!canVerify) return
    setError(null)
    setSubmitting(true)
    show()
    try {
      const { token, user } = await verifyLoginCode(emailTrimmed, codeTrimmed) // backend devuelve { token, user }
      if (!token) throw new Error('Sin token')
      login({ token, user })
      navigate('/')
    } catch (err) {
      console.error('[Login] verifyLoginCode error:', err)
      setError('Código incorrecto o expirado.')
    } finally {
      hide()
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || submitting) return
    await handleRequestCode()
  }

  const handleKeyDownEmail = (e) => {
    if (e.key === 'Enter' && canSendEmail) {
      handleRequestCode()
    }
  }

  const handleKeyDownCode = (e) => {
    if (e.key === 'Enter' && canVerify) {
      handleVerifyCode()
    }
  }

  const maskedEmail = useMemo(() => {
    if (!emailTrimmed) return ''
    const [userPart, domain] = emailTrimmed.split('@')
    if (!domain) return emailTrimmed
    const visible = userPart.slice(0, 2)
    return `${visible}${userPart.length > 2 ? '***' : ''}@${domain}`
  }, [emailTrimmed])

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200">
      <div className="bg-white p-8 shadow-md rounded-md w-80">
        <h2 className="text-xl mb-4 font-bold text-center">Iniciar Sesión</h2>

        {step === 1 && (
          <>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDownEmail}
              placeholder="tu@email.com"
              autoFocus
              className="w-full border p-2 mb-4 rounded outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleRequestCode}
              disabled={!canSendEmail}
              className={`w-full py-2 rounded text-white ${
                canSendEmail ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Enviando…' : 'Ingresar'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm mb-3">
              Código enviado a: <strong>{maskedEmail}</strong>
            </p>

            <label className="text-sm text-gray-600 mb-1 block">Código de ingreso</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDownCode}
              placeholder="123456"
              autoFocus
              inputMode="numeric"
              className="w-full border p-2 mb-4 rounded outline-none focus:ring-2 focus:ring-green-300 tracking-widest text-center"
            />

            <button
              onClick={handleVerifyCode}
              disabled={!canVerify}
              className={`w-full py-2 rounded text-white mb-3 ${
                canVerify ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Verificando…' : 'Verificar'}
            </button>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="underline"
                disabled={submitting}
              >
                Cambiar email
              </button>
              <button
                type="button"
                onClick={handleResend}
                className={`underline ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={cooldown > 0 || submitting}
                title={cooldown > 0 ? `Podés reenviar en ${cooldown}s` : 'Reenviar código'}
              >
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
              </button>
            </div>
          </>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}

export default Login
