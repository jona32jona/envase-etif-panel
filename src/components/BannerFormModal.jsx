// src/components/BannerFormModal.jsx
import { useMemo, useRef, useState } from 'react'

const IMG_BASE =
  import.meta.env.VITE_BANNERS_IMG_BASE ||
  'https://envaseetifapp.com.ar/Imagenes/banners/'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

const BannerFormModal = ({ initialData, onSave, onCancel }) => {
  const isEdit = Boolean(initialData?._id)

  const [form, setForm] = useState(() => ({
    _id: initialData?._id ?? null,
    nombre: initialData?.nombre ?? '',
    link: initialData?.link ?? '',
    activo: (initialData?._bools?.activo ?? (initialData?.activo === 1 || initialData?.activo === '1')) ? 1 : 1,
    imagen: initialData?.imagen ?? '', // nombre en DB
  }))

  const [file, setFile] = useState(null)         // File seleccionado (opcional)
  const [error, setError] = useState(null)       // error de validación local
  const fileInputRef = useRef(null)

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    if (form.imagen) return `${IMG_BASE}${form.imagen}`
    return ''
  }, [file, form.imagen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
  }

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) { setFile(null); return }
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('El archivo debe ser una imagen válida (png, jpg, webp, gif).')
      setFile(null)
      return
    }
    setError(null)
    setFile(f)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const nombre = String(form.nombre || '').trim()
    if (!nombre) {
      setError('El nombre es obligatorio.')
      return
    }
    // En alta, si no hay imagen previa, pedimos archivo
    if (!isEdit && !file) {
      setError('Subí una imagen para el banner.')
      return
    }

    const payload = {
      _id: form._id ?? undefined,
      nombre,
      link: String(form.link || '').trim(),
      activo: form.activo ? 1 : 0,
      // imagen va por multipart si corresponde
    }
    onSave(payload, file) // la page decide multipart/JSON
  }

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col min-h-0">
      {/* header */}
      <div className="pb-3 px-4 pt-4 pr-10 border-b bg-white shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">{isEdit ? 'Editar Banner' : 'Nuevo Banner'}</h2>
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">ID: <strong>{form._id}</strong></p>
          )}
        </div>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 px-4 py-4 space-y-4">
        {error && (
          <div className="p-2 text-sm border border-red-300 bg-red-50 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              className="border p-2 w-full rounded"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Link</label>
            <input
              className="border p-2 w-full rounded"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          {/* Imagen */}
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Imagen (archivo)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-secondary file:text-white hover:file:bg-secondary/90"
            />
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: png, jpg, webp, gif.</p>

            {previewUrl ? (
              <div className="mt-3">
                <img
                  alt="Preview banner"
                  src={previewUrl}
                  className="h-28 w-auto max-w-full rounded border border-gray-200 object-contain bg-white"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                {!file && form.imagen && (
                  <p className="text-xs text-gray-500 break-all mt-1">{IMG_BASE}{form.imagen}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">No hay imagen seleccionada.</p>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-col gap-4">
            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                name="activo"
                checked={Boolean(form.activo)}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="px-4 pt-3 pb-4 border-t bg-white flex gap-2 justify-end shrink-0">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-black rounded hover:bg-yellow-400">
          Guardar
        </button>
      </div>
    </form>
  )
}

export default BannerFormModal
