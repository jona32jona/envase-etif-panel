// src/components/AgendaFormModal.jsx
import { useMemo, useState } from 'react'

// Helpers fecha para <input type="datetime-local">
const toLocalDTValue = (v) => {
  if (!v) return ''
  const s = String(v).replace('T', ' ').slice(0, 16) // "YYYY-MM-DD HH:mm"
  return s.replace(' ', 'T')
}

const AgendaFormModal = ({ initialData, onSave, onCancel }) => {
  const isEdit = Boolean(initialData?._id)

  const [form, setForm] = useState(() => ({
    _id: initialData?._id ?? null,
    nombre: initialData?.nombre ?? '',
    orador: initialData?.orador ?? '',
    lugar: initialData?.lugar ?? '',
    descripcion: initialData?.descripcion ?? '',
    fecha_hora: toLocalDTValue(initialData?.fecha_hora) || '', // datetime-local
    activo: initialData?.activo === 1 || initialData?.activo === '1' || initialData?.activo === true ? 1 : 1,
  }))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
  }

  const canSubmit = useMemo(() => {
    const nombreOk = String(form.nombre || '').trim().length > 0
    const fechaOk = String(form.fecha_hora || '').trim().length >= 16 // "YYYY-MM-DDTHH:mm"
    return nombreOk && fechaOk
  }, [form.nombre, form.fecha_hora])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) {
      alert('Completá al menos Nombre y Fecha/Hora.')
      return
    }
    const payload = {
      _id: form._id ?? undefined,
      nombre: String(form.nombre || '').trim(),
      orador: String(form.orador || '').trim(),
      lugar: String(form.lugar || '').trim(),
      descripcion: String(form.descripcion || '').trim(),
      // Mandamos "YYYY-MM-DDTHH:mm" (lo normaliza el service a MySQL)
      fecha_hora: String(form.fecha_hora || '').trim(),
      activo: form.activo ? 1 : 0,
    }
    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col min-h-0">
      {/* header */}
      <div className="pb-3 px-4 pt-4 pr-10 border-b bg-white shrink-0">
        <h2 className="font-bold text-lg">
          {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            ID: <strong>{form._id}</strong>
          </p>
        )}
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 px-4 py-4 space-y-4">
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
            <label className="block text-sm text-gray-600 mb-1">Orador</label>
            <input
              className="border p-2 w-full rounded"
              name="orador"
              value={form.orador}
              onChange={handleChange}
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Lugar</label>
            <input
              className="border p-2 w-full rounded"
              name="lugar"
              value={form.lugar}
              onChange={handleChange}
            />
          </div>
          <div className="min-w-0 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea
              className="border p-2 w-full rounded min-h-[90px]"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              maxLength={300}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              name="fecha_hora"
              value={form.fecha_hora}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="activo"
              type="checkbox"
              className="h-4 w-4"
              name="activo"
              checked={Boolean(form.activo)}
              onChange={handleChange}
            />
            <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
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

export default AgendaFormModal
