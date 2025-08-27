import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Traducciones iniciales
const resources = {
  en: {
    translation: {
      header_expositores: "Companies",
      btn_nuevo: "New",
      btn_guardar: "Save",
      btn_cancelar: "Cancel",
      content_expositores: "Companies content...",
      header_expositores_usuarios: "USUARIOS EXPOSITORES",
      content_expositores_usuarios: "Manage users linked to each exhibitor: create/edit/delete, role assignment, and approval of requests."
    }
  },
  es: {
    translation: {
      header_expositores: "Expositores",
      btn_nuevo: "Nuevo",
      btn_guardar: "Guardar",
      btn_cancelar: "Cancelar",
      content_expositores: "Lista de expositores...",
      header_expositores_usuarios: "USUARIOS EXPOSITORES",
      content_expositores_usuarios: "Administrá los usuarios asociados a cada expositor: alta/edición/baja, asignación de roles y aprobación de solicitudes."
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  })

export default i18n