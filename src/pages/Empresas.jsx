import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { FiHome } from 'react-icons/fi'
import { useLoading } from '../context/LoadingContext'
import { fetchEmpresas } from '../services/empresas.api'
import { useAuth } from '../context/AuthContext' // si guardas token aquí (opcional)

const Empresas = () => {
  const { t } = useTranslation()
  const { show, hide } = useLoading()
  const { user } = useAuth() || {}
  const token = user?.token // ajusta si lo necesitas

  const [footerHeight, setFooterHeight] = useState(0)
  const footerRef = useRef(null)

  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)

  // Medir footer para dejar espacio al scroll del contenido
  useLayoutEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight)
    }
  }, [])

  // Carga inicial desde API
  useEffect(() => {
    let alive = true

    const load = async () => {
      show()
      setError(null)
      try {
        const { rows } = await fetchEmpresas({ page: 1, limit: 100, token })
        if (alive) setRows(rows)
      } catch (err) {
        console.error('[Empresas] Error API:', err)
        if (alive) setError(err)
      } finally {
        // 🔴 Importante: ocultar el loader SIEMPRE
        hide()
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [token, show, hide])

  // Acciones footer (demo)
  const handleNuevoClick = () => alert('Nuevo Empresa')
  const handleGuardarClick = () => alert('Guardar Empresa')
  const handleCancelarClick = () => alert('Cancelar')

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header */}
      <div className="p-4">
        <PageHeader title={t('header_empresas')} icon={<FiHome />} />
        <p className="text-text_secondary mt-2">{t('content_empresas')}</p>
      </div>

      {/* Contenido scrollable (deja espacio para el footer fijo) */}
      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
        {error && (
          <div className="mb-3 p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando empresas. {error.message}
          </div>
        )}

        <SectionView
          type="table"
          config={{
            columns: [
              { header: 'Nombre', accessor: 'name' },
              { header: 'CUIT/Código', accessor: 'cuit' },
              { header: 'Domicilio', accessor: 'direccion' },
              { header: 'Email', accessor: 'email' },
              { header: 'Servicio', accessor: 'tipoServicio' },
              { header: 'Fecha Código', accessor: 'fechaCodigo' },
            ],
            rows
          }}
        />
      </div>

      {/* Footer */}
      <div ref={footerRef}>
        <PageFooter
          showBtn1
          btn1Text={t('btn_nuevo')}
          onBtn1Click={handleNuevoClick}
          showBtn2
          btn2Text={t('btn_guardar')}
          onBtn2Click={handleGuardarClick}
          showBtn3
          btn3Text={t('btn_cancelar')}
          onBtn3Click={handleCancelarClick}
        />
      </div>
    </div>
  )
}

export default Empresas