import { useState } from 'react'

const EmpleadoFormModal = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState(initialData || {})

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="font-bold text-lg mb-2">Editar Empleado</h2>
      <div>
        <label className="block text-sm">Nombre</label>
        <input
          className="border p-2 w-full rounded"
          name="nombre"
          value={form.nombre || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm">DNI</label>
        <input
          className="border p-2 w-full rounded"
          name="dni"
          value={form.dni || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm">Email</label>
        <input
          className="border p-2 w-full rounded"
          name="email"
          value={form.email || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm">Empresa</label>
        <input
          className="border p-2 w-full rounded"
          name="empresa"
          value={form.empresa || ''}
          onChange={handleChange}
        />
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-black rounded hover:bg-yellow-400"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

export default EmpleadoFormModal
