// src/pages/Expositores.jsx
import { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { FiBriefcase } from 'react-icons/fi'
import { useLoading } from '../context/LoadingContext'
import { fetchExpositores, createExpositor, updateExpositor, deleteExpositor  } from '../services/expositores.api'
import ExpositorFormModal from '../components/ExpositorFormModal'
import { useModal } from '../context/ModalContext'

const LOGO_BASE =
  import.meta.env.VITE_EXPOSITORES_LOGO_BASE ||
  'https://envaseetifapp.com.ar/Imagenes/expositores/'

const Expositores = () => {
  const { t } = useTranslation()
  const { show, hide } = useLoading()
  const { openModal, closeModal } = useModal()

  const [footerHeight, setFooterHeight] = useState(0)
  const footerRef = useRef(null)

  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)

  useLayoutEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    let alive = true
    const load = async () => {
      show()
      setError(null)
      try {
        const { rows } = await fetchExpositores({ page: 1, limit: 100 })
        if (alive) setRows(rows)
      } catch (err) {
        console.error('[Expositores] Error API:', err)
        if (alive) setError(err)
      } finally {
        hide()
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [show, hide])

  // Editar
  const handleEditExpositor = (expositor) => {
    const raw = expositor?._raw ?? expositor

    openModal(
      <ExpositorFormModal
        initialData={raw}
        onSave={async (values, file) => {
          const nombre = (values?.nombre ?? '').trim()
          if (!nombre) {
            alert('El nombre del expositor es obligatorio.')
            return
          }

          // asegurar _id
          const payload = { ...values, _id: values?._id ?? raw?._id }

          try {
            show()
            const actualizado = await updateExpositor(payload, file)
            setRows(list =>
              list.map(row =>
                Number(row._id) === Number(actualizado._id) ? actualizado : row
              )
            )
            closeModal()
          } catch (err) {
            console.error('[Expositores] update error:', err)
            alert('No se pudo actualizar el expositor. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-5xl w-[96vw]'
    )
  }

  // Eliminar (mock local)
  const handleDeleteExpositor = (expositor) => {
  openModal(
    <div className="p-5">
      <h3 className="text-lg font-semibold mb-2">Eliminar expositor</h3>
      <p className="text-sm">
        ¿Estás seguro que deseas eliminar a <b>{expositor.nombre || expositor.name}</b>?
      </p>

      <div className="flex gap-2 mt-6 justify-end">
        <button onClick={closeModal} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300">
          Cancelar
        </button>
        <button
          onClick={async () => {
            const id = Number(expositor._id ?? expositor?._raw?._id)
            if (!id) { alert('ID inválido'); return }
            try {
              show()
              await deleteExpositor(id)
              setRows(list => list.filter(x => Number(x._id) !== id))
              closeModal()
            } catch (err) {
              console.error('[Expositores] delete error:', err)
              alert('No se pudo eliminar en el servidor. ' + (err?.message || ''))
            } finally {
              hide()
            }
          }}
          className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>,
    'max-w-sm'
  )
}

  // Doble click en fila = editar (usa mismo handler)
  const handleRowDoubleClick = (expositor) => handleEditExpositor(expositor)

  // Filas con logo miniatura
  const viewRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        logoNode: r.logo
          ? (
            <img
              src={`${LOGO_BASE}${r.logo}`}
              alt={r.name || 'logo expositor'}
              className="h-8 w-8 object-contain rounded bg-white border border-gray-200"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent && parent.childElementCount === 1) {
                  const span = document.createElement('span')
                  span.textContent = '—'
                  span.className = 'text-gray-400'
                  parent.appendChild(span)
                }
              }}
            />
          )
          : '—',
      })),
    [rows]
  )

  // Nuevo
  const handleNuevoClick = () => {
    openModal(
      <ExpositorFormModal
        initialData={null}
        onSave={async (values, file) => {
          const nombre = (values?.nombre ?? '').trim()
          if (!nombre) {
            alert('El nombre del expositor es obligatorio.')
            return
          }

          try {
            show()
            const nuevoRow = await createExpositor({ ...values, nombre }, file)
            setRows(list => [nuevoRow, ...list])
            closeModal()
          } catch (err) {
            console.error('[Expositores] crear error:', err)
            alert('No se pudo crear el expositor. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-5xl w-[96vw]'
    )
  }

  const handleGuardarClick = () => alert('Guardar Expositor')
  const handleCancelarClick = () => alert('Cancelar')

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header */}
      <div className="p-4">
        <PageHeader title={t('header_expositores') || 'Expositores'} icon={<FiBriefcase />} />
        <p className="text-text_secondary mt-2">
          {t('content_expositores') || 'Listado de expositores.'}
        </p>
      </div>

      {/* Contenido scrollable */}
      <div
        className="flex-1 overflow-y-auto px-4"
        style={{ paddingBottom: `${footerHeight}px` }}
      >
        {error && (
          <div className="mb-3 p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando expositores. {error.message}
          </div>
        )}

        <SectionView
          type="table"
          config={{
            columns: [
              { header: 'ID', accessor: '_id' },
              { header: 'Nombre', accessor: 'name' },
              { header: 'Email', accessor: 'email' },
              { header: 'Teléfono', accessor: 'telefono' },
              { header: 'Web', accessor: 'web' },
              { header: 'Marcas', accessor: 'marcas' },
              { header: 'Domicilio', accessor: 'domicilio' },
              { header: 'CP', accessor: 'cp' },
              { header: 'Localidad', accessor: 'localidad' },
              { header: 'Provincia', accessor: 'provincia' },
              { header: 'País', accessor: 'pais' },
              { header: 'Descripción', accessor: 'descripcion' },
              { header: 'Descripción Ingles', accessor: 'descripcion_i' },
              { header: 'Activo', accessor: 'activo' },
              { header: 'Logo', accessor: 'logoNode' },
            ],
            rows: viewRows,
            onRowDoubleClick: handleRowDoubleClick,
            onEdit: handleEditExpositor,
            onDelete: handleDeleteExpositor,
          }}
        />
      </div>

      {/* Footer */}
      <div ref={footerRef}>
        <PageFooter
          showBtn1
          btn1Text={t('btn_nuevo') || 'Nuevo'}
          onBtn1Click={handleNuevoClick}
          showBtn2={false}
          btn2Text={t('btn_guardar') || 'Guardar'}
          onBtn2Click={handleGuardarClick}
          showBtn3={false}
          btn3Text={t('btn_cancelar') || 'Cancelar'}
          onBtn3Click={handleCancelarClick}
        />
      </div>
    </div>
  )
}

export default Expositores
