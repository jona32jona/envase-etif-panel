import { httpPost } from './httpClient'

// Llamada para enviar código
export async function requestLoginCode(email) {
  return await httpPost('users/', {
    action: 'request_code',
    email
  })
}

// Llamada para verificar código
export async function verifyLoginCode(email, code) {
  return await httpPost('users/', {
    action: 'verify_code',
    email,
    code
  })
}