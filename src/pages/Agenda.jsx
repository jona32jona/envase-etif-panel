// src/pages/Agenda.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FiCalendar } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { useLoading } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'
import {
  fetchAgenda,
  createAgenda,
  updateAgenda,
  deleteAgenda,
} from '../services/agenda.api'
import AgendaFormModal from '../components/AgendaFormModal'

const Agenda = () => {
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

  useEffect(() => {
    let alive = true
    const load = async () => {
      show()
      setError(null)
      try {
        const { rows } = await fetchAgenda({ page: 1, limit: 300 })
        if (alive) setRows(rows)
      } catch (err) {
        console.error('[Agenda] Error API:', err)
        if (alive) setError(err)
      } finally {
        hide()
      }
    }
    load()
    return () => { alive = false }
  }, [show, hide])

  // Handlers
  const openEditModal = (rowOrView) => {
    const raw = rowOrView?._raw ?? rowOrView
    openModal(
      <AgendaFormModal
        initialData={raw}
        onSave={async (values) => {
          if (!values?.nombre || !values?.fecha_hora) {
            alert('Nombre y Fecha/Hora son obligatorios.')
            return
          }
          try {
            show()
            const actualizado = await updateAgenda(values)
            setRows(list =>
              list.map(r => Number(r._id) === Number(actualizado._id) ? actualizado : r)
            )
            closeModal()
          } catch (err) {
            console.error('[Agenda] update error:', err)
            alert('No se pudo actualizar el evento. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-3xl w-[96vw]'
    )
  }

  const handleRowDoubleClick = (row) => openEditModal(row)
  const handleEdit = (row) => openEditModal(row)

  const handleDelete = (row) => {
    openModal(
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">Eliminar evento</h3>
        <p className="text-sm">
          ¿Seguro que deseas eliminar <b>{row.nombre || row._raw?.nombre}</b>?
        </p>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={closeModal} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                show()
                await deleteAgenda(row._id ?? row?._raw?._id)
                setRows(list => list.filter(x => Number(x._id) !== Number(row._id ?? row?._raw?._id)))
                closeModal()
              } catch (err) {
                console.error('[Agenda] delete error:', err)
                alert('No se pudo eliminar. ' + (err?.message || ''))
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

  const handleNuevoClick = () => {
    openModal(
      <AgendaFormModal
        initialData={null}
        onSave={async (values) => {
          if (!values?.nombre || !values?.fecha_hora) {
            alert('Nombre y Fecha/Hora son obligatorios.')
            return
          }
          try {
            show()
            const nuevo = await createAgenda(values)
            setRows(list => [nuevo, ...list])
            closeModal()
          } catch (err) {
            console.error('[Agenda] create error:', err)
            alert('No se pudo crear el evento. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-3xl w-[96vw]'
    )
  }

  const handleGuardarClick = () => alert('Guardar cambios')
  const handleCancelarClick = () => alert('Cancelar')

  // Columnas
  const columns = useMemo(() => ([
    { header: 'ID', accessor: '_id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Orador', accessor: 'orador' },
    { header: 'Lugar', accessor: 'lugar' },
    { header: 'Descripción', accessor: 'descripcion' },
    { header: 'Fecha y Hora', accessor: 'fecha_hora' },
    { header: 'Activo', accessor: 'activo' },
  ]), [])

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header */}
      <div className="p-4">
        <PageHeader title="Agenda" icon={<FiCalendar />} />
        <p className="text-text_secondary mt-2">
          Gestión de eventos de la agenda: crear, editar, eliminar y activar/desactivar.
        </p>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
        {error && (
          <div className="mb-3 p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando agenda. {error.message}
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
          btn1Text="Nuevo"
          onBtn1Click={handleNuevoClick}
          showBtn2={false}
          btn2Text="Guardar"
          onBtn2Click={handleGuardarClick}
          showBtn3={false}
          btn3Text="Cancelar"
          onBtn3Click={handleCancelarClick}
        />
      </div>
    </div>
  )
}

export default Agenda
