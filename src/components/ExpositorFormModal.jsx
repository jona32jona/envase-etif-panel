// src/components/ExpositorFormModal.jsx
import { useMemo, useState } from 'react'
import { processLogoToJpegSquare } from '../utils/image/logoTools'

const LOGO_BASE =
  import.meta.env.VITE_EXPOSITORES_LOGO_BASE ||
  'https://envaseetifapp.com.ar/Imagenes/expositores/'


const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

const ExpositorFormModal = ({ initialData, onSave, onCancel }) => {
  const isEdit = Boolean(initialData?._id)
  const [form, setForm] = useState(
    initialData || {
      nombre: '', email: '', domicilio: '', cp: '', localidad: '', provincia: '',
      pais: '', telefono: '', web: '', marcas: '', descripcion: '',
      descripcion_i: '', logo: '', activo: 1,
    }
  )

  // Nuevo: archivo seleccionado para el logo (opcional)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
  }

  const handleFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) { setFile(null); return }
    if (!/^image\//.test(f.type)) {
      setError('El archivo debe ser una imagen.')
      setFile(null)
      return
    }
    try {
      setError(null)
      const normalized = await processLogoToJpegSquare(f, {
        size: 1080,
        widthPercent: 0.9,
        background: '#ffffff',
        quality: 0.92,
        // filename: 'opcional' // se infiere del original
      })
      setFile(normalized) // ← este es el que subís por multipart
    } catch (err) {
      console.error('processLogoToJpegSquare error', err)
      setError('No se pudo procesar la imagen.')
      setFile(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    )
    payload.activo = form.activo ? 1 : 0

    // 👇 importante: si es edición, mandamos el _id
    if (initialData?._id) {
      payload._id = initialData._id
    }

    // Ahora devolvemos (payload, file) -> la page decide JSON o multipart
    onSave(payload, file)
  }

  // Preview: si hay archivo nuevo, mostrarlo; si no, mostrar el logo existente (si hay)
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return form.logo ? `${LOGO_BASE}${form.logo}` : ''
  }, [file, form.logo])

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col min-h-0">
      {/* header */}
      <div className="pb-3 px-4 pt-4 pr-10 border-b bg-white shrink-0">
        <h2 className="font-bold text-lg">
          {isEdit ? 'Editar Expositor' : 'Nuevo Expositor'}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            ID: <strong>{form._id}</strong>
          </p>
        )}
      </div>

      {/* body scrolleable */}
      <div className="flex-1 min-h-0 px-4 py-4 space-y-4">
        {error && (
          <div className="p-2 text-sm border border-red-300 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input className="border p-2 w-full rounded" name="nombre" value={form.nombre || ''} onChange={handleChange} required />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input type="email" className="border p-2 w-full rounded" name="email" value={form.email || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
            <input className="border p-2 w-full rounded" name="telefono" value={form.telefono || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Web</label>
            <input className="border p-2 w-full rounded" name="web" value={form.web || ''} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="md:col-span-2 min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Marcas</label>
            <input className="border p-2 w-full rounded" name="marcas" value={form.marcas || ''} onChange={handleChange} placeholder="Lista de marcas separadas por coma" />
          </div>
        </div>

        {/* Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="md:col-span-2 min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Domicilio</label>
            <input className="border p-2 w-full rounded" name="domicilio" value={form.domicilio || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">CP</label>
            <input className="border p-2 w-full rounded" name="cp" value={form.cp || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Localidad</label>
            <input className="border p-2 w-full rounded" name="localidad" value={form.localidad || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Provincia</label>
            <input className="border p-2 w-full rounded" name="provincia" value={form.provincia || ''} onChange={handleChange} />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">País</label>
            <input className="border p-2 w-full rounded" name="pais" value={form.pais || ''} onChange={handleChange} />
          </div>
        </div>

        {/* Descripciones */}
        <div className="min-w-0">
          <label className="block text-sm text-gray-600 mb-1">Descripción</label>
          <textarea className="border p-2 w-full rounded min-h-[90px]" name="descripcion" value={form.descripcion || ''} onChange={handleChange} />
        </div>
        <div className="min-w-0">
          <label className="block text-sm text-gray-600 mb-1">Descripción (Inglés)</label>
          <textarea className="border p-2 w-full rounded min-h-[90px]" name="descripcion_i" value={form.descripcion_i || ''} onChange={handleChange} />
        </div>

        {/* Logo + Activo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Logo (archivo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-secondary file:text-white hover:file:bg-secondary/90"
            />
            <p className="text-xs text-gray-500 mt-1">Si subís un archivo, se ignora el nombre de archivo manual.</p>

            {/* Campo de texto para compatibilidad (opcional) */}
            <label className="block text-sm text-gray-600 mt-3 mb-1">Logo (nombre de archivo)</label>
            <input
              className="border p-2 w-full rounded"
              name="logo"
              value={form.logo || ''}
              onChange={handleChange}
              placeholder="ej: empresa.png"
            />

            {/* Preview */}
            {previewUrl ? (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Logo expositor"
                  className="h-12 w-12 object-contain rounded bg-white border border-gray-200"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                {!file && form.logo && (
                  <p className="text-xs text-gray-500 break-all">{LOGO_BASE}{form.logo}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">No hay logo cargado.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input id="activo" type="checkbox" className="h-4 w-4" name="activo" checked={Boolean(form.activo)} onChange={handleChange} />
            <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
          </div>
        </div>
      </div>

      {/* footer fijo */}
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

export default ExpositorFormModal
