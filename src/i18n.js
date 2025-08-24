import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Traducciones iniciales
const resources = {
  en: {
    translation: {
      header_empresas: "Companies",
      btn_nuevo: "New",
      btn_guardar: "Save",
      btn_cancelar: "Cancel",
      content_empresas: "Companies content..."
    }
  },
  es: {
    translation: {
      header_empresas: "Empresas",
      btn_nuevo: "Nuevo",
      btn_guardar: "Guardar",
      btn_cancelar: "Cancelar",
      content_empresas: "Contenido de empresas..."
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