// src/pages/ExpositoresUsuarios.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { FiUsers } from 'react-icons/fi'
import { useLoading } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'

import {
  fetchExpositoresUsuarios,
  createExpositorUsuario,
  updateExpositorUsuario,
  fetchExpositoresUsuariosList, // 👈 precarga combo
} from '../services/expositores_usuarios.api'

import ExpositorUsuarioFormModal from '../components/ExpositorUsuarioFormModal'
import SolicitudesExpositoresModal from '../components/SolicitudesExpositoresModal'

const ExpositoresUsuarios = () => {
  const { t } = useTranslation()
  const { show, hide } = useLoading()
  const { openModal, closeModal } = useModal()

  const [footerHeight, setFooterHeight] = useState(0)
  const footerRef = useRef(null)

  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)

  useLayoutEffect(() => {
    if (footerRef.current) setFooterHeight(footerRef.current.offsetHeight)
  }, [])

  const reloadRows = async () => {
    try {
      show()
      setError(null)
      const { rows } = await fetchExpositoresUsuarios({ page: 1, limit: 200 })
      setRows(rows)
    } catch (err) {
      console.error('[ExpositoresUsuarios] Error API:', err)
      setError(err)
    } finally {
      hide()
    }
  }

  useEffect(() => {
    let alive = true
    const load = async () => {
      show()
      setError(null)
      try {
        const { rows } = await fetchExpositoresUsuarios({ page: 1, limit: 200 })
        if (alive) setRows(rows)
      } catch (err) {
        console.error('[ExpositoresUsuarios] Error API:', err)
        if (alive) setError(err)
      } finally {
        hide()
      }
    }
    load()
    return () => { alive = false }
  }, [show, hide])

  // --- helper: abre el form SOLO cuando ya tenemos el combo de expositores
  const openFormWithOptions = async ({ initialData, onSave }) => {
    try {
      show()
      const options = await fetchExpositoresUsuariosList() // 👈 precarga
      openModal(
        <ExpositorUsuarioFormModal
          initialData={initialData}
          expositoresOptions={options}      // 👈 pasa opciones al modal
          onSave={onSave}
          onCancel={closeModal}
        />,
        'max-w-3xl w-[96vw]'
      )
    } catch (err) {
      console.error('[ExpositoresUsuarios] Error cargando EXPO LIST:', err)
      alert('No se pudo cargar la lista de expositores. ' + (err?.message || ''))
    } finally {
      hide()
    }
  }

  // --- Handlers CRUD
  const openEditModal = (rowOrView) => {
    const raw = rowOrView?._raw ?? rowOrView
    void openFormWithOptions({
      initialData: raw,
      onSave: async (values) => {
        if (!values?.email || !values?.id_expositor) {
          alert('Expositor y Email son obligatorios.')
          return
        }
        try {
          show()
          const actualizado = await updateExpositorUsuario(values)
          setRows(list =>
            list.map(r => Number(r._id) === Number(actualizado._id) ? actualizado : r)
          )
          closeModal()
        } catch (err) {
          console.error('[ExpositoresUsuarios] update error:', err)
          alert('No se pudo actualizar el usuario. ' + (err?.message || ''))
        } finally {
          hide()
        }
      }
    })
  }

  const handleEdit = (row) => openEditModal(row)
  const handleRowDoubleClick = (row) => openEditModal(row)

  const handleDelete = (row) => {
    openModal(
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">Eliminar usuario</h3>
        <p className="text-sm">
          ¿Seguro que deseas eliminar a <b>{row.nombre || row._raw?.nombre || row.email}</b>?
        </p>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={closeModal} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={() => {
              const id = Number(row._id ?? row?._raw?._id)
              setRows(list => list.filter(x => Number(x._id) !== id))
              closeModal()
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

  const handleNuevoClick = () => {
    void openFormWithOptions({
      initialData: null,
      onSave: async (values) => {
        if (!values?.email || !values?.id_expositor) {
          alert('Expositor y Email son obligatorios.')
          return
        }
        try {
          show()
          const nuevo = await createExpositorUsuario(values)
          setRows(list => [nuevo, ...list])
          closeModal()
        } catch (err) {
          console.error('[ExpositoresUsuarios] create error:', err)
          alert('No se pudo crear el usuario. ' + (err?.message || ''))
        } finally {
          hide()
        }
      }
    })
  }

  // --- Solicitudes Expositores (modal)
  const handleSolicitudesClick = () => {
    openModal(
      <SolicitudesExpositoresModal
        onClose={closeModal}
        onAnyChange={reloadRows} // refresca la tabla principal al aprobar
      />,
      'max-w-5xl w-[96vw]'
    )
  }

  // Columnas
  const columns = useMemo(() => ([
    { header: 'ID', accessor: '_id' },
    { header: 'Expositor', accessor: 'nombre_expositor' },
    { header: 'Email', accessor: 'email' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Admin', accessor: 'admin' },
    { header: 'Código', accessor: 'codigo' },
    { header: 'Fecha Código', accessor: 'fecha_codigo' },
  ]), [])

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header */}
      <div className="p-4">
        <PageHeader title={t('header_expositores_usuarios') || 'Usuarios de Expositores'} icon={<FiUsers />} />
        <p className="text-text_secondary mt-2">
          {t('content_expositores_usuarios') || 'Administrá los usuarios asociados a cada expositor.'}
        </p>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
        {error && (
          <div className="mb-3 p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando usuarios. {error.message}
          </div>
        )}

        <SectionView
          type="table"
          config={{
            columns,
            rows,
            onRowDoubleClick: handleRowDoubleClick,
            onEdit: handleEdit,
            onDelete: handleDelete,
          }}
        />
      </div>

      {/* Footer */}
      <div ref={footerRef}>
        <PageFooter
          showBtn1
          btn1Text={t('btn_nuevo') || 'Nuevo'}
          onBtn1Click={handleNuevoClick}
          showBtn2
          btn2Text="Solicitudes Expositores"
          onBtn2Click={handleSolicitudesClick}
          showBtn3={false}
          btn3Text={t('btn_cancelar') || 'Cancelar'}
          onBtn3Click={() => {}}
        />
      </div>
    </div>
  )
}

export default ExpositoresUsuarios
