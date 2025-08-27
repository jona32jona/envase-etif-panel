// src/pages/Banners.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FiImage } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { useLoading } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../services/banners.api'
import BannerFormModal from '../components/BannerFormModal'

const IMG_BASE =
  import.meta.env.VITE_BANNERS_IMG_BASE ||
  'https://envaseetifapp.com.ar/Imagenes/banners/'

const Banners = () => {
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
        const { rows } = await fetchBanners({ page: 1, limit: 200 })
        if (alive) setRows(rows)
      } catch (err) {
        console.error('[Banners] Error API:', err)
        if (alive) setError(err)
      } finally {
        hide()
      }
    }
    load()
    return () => { alive = false }
  }, [show, hide])

  const openEditModal = (rowOrView) => {
    const raw = rowOrView?._raw ?? rowOrView
    openModal(
      <BannerFormModal
        initialData={raw}
        onSave={async (values, file) => {
          if (!values?.nombre) { alert('El nombre es obligatorio.'); return }
          try {
            show()
            const updated = await updateBanner({ ...values, _id: raw?._id ?? values?._id }, file)
            setRows(list => list.map(r => Number(r._id) === Number(updated._id) ? updated : r))
            closeModal()
          } catch (err) {
            console.error('[Banners] update error:', err)
            alert('No se pudo actualizar el banner. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-4xl w-[96vw]'
    )
  }

  const handleRowDoubleClick = (row) => openEditModal(row)
  const handleEdit = (row) => openEditModal(row)

  const handleDelete = (row) => {
    openModal(
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">Eliminar banner</h3>
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
                await deleteBanner(row._id ?? row?._raw?._id)
                setRows(list => list.filter(x => Number(x._id) !== Number(row._id ?? row?._raw?._id)))
                closeModal()
              } catch (err) {
                console.error('[Banners] delete error:', err)
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
      <BannerFormModal
        initialData={null}
        onSave={async (values, file) => {
          if (!values?.nombre) { alert('El nombre es obligatorio.'); return }
          try {
            show()
            const created = await createBanner(values, file)
            setRows(list => [created, ...list])
            closeModal()
          } catch (err) {
            console.error('[Banners] create error:', err)
            alert('No se pudo crear el banner. ' + (err?.message || ''))
          } finally {
            hide()
          }
        }}
        onCancel={closeModal}
      />,
      'max-w-4xl w-[96vw]'
    )
  }

  const handleGuardarClick = () => alert('Guardar cambios')
  const handleCancelarClick = () => alert('Cancelar')

  // Columnas + mini preview imagen
  const viewRows = useMemo(() => rows.map(r => ({
    ...r,
    imagenNode: r.imagen
      ? (
        <img
          src={`${IMG_BASE}${r.imagen}`}
          alt={r.nombre || 'banner'}
          className="h-8 w-auto rounded bg-white border border-gray-200 object-contain"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : '—',
  })), [rows])

  const columns = useMemo(() => ([
    { header: 'ID', accessor: '_id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Imagen', accessor: 'imagenNode' },
    { header: 'Link', accessor: 'link' },
    { header: 'Activo', accessor: 'activo' },
  ]), [])

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header */}
      <div className="p-4">
        <PageHeader title="BANNERS" icon={<FiImage />} />
        <p className="text-text_secondary mt-2">
          Administración de banners: alta, edición, subida de imagen y visibilidad en App.
        </p>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
        {error && (
          <div className="mb-3 p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando banners. {error.message}
          </div>
        )}

        <SectionView
          type="table"
          config={{
            columns,
            rows: viewRows,
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
          btn1Text="Agregar"
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

export default Banners
