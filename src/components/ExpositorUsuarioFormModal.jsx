// src/components/ExpositorUsuarioFormModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

// Helpers de fecha (YYYY-MM-DD) y normalización
function todayYYYYMMDD() {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
function normalizeDateInput(v) {
  if (!v) return ''
  const s = String(v)
  // soporta "2025-08-10", "2025-08-10T12:34:56", "2025-08-10 12:34:56"
  return s.length >= 10 ? s.slice(0, 10) : s
}

const random6 = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')

const ExpositorUsuarioFormModal = ({ initialData, expositoresOptions = [], onSave, onCancel }) => {
  const isEdit = Boolean(initialData?._id)
  const defaultDate = useMemo(
    () => normalizeDateInput(initialData?.fecha_codigo) || todayYYYYMMDD(),
    [initialData?.fecha_codigo]
  )

  const [form, setForm] = useState(() => ({
    _id: initialData?._id ?? null,
    // 👇 guardamos como string para el <select>
    id_expositor:
      initialData?.id_expositor != null
        ? String(initialData.id_expositor)
        : initialData?.expositor_id != null
          ? String(initialData.expositor_id)
          : '',
    email: initialData?.email ?? '',
    nombre: initialData?.nombre ?? initialData?.name ?? '',
    admin:
      initialData?.admin === 1 ||
      initialData?.admin === '1' ||
      initialData?.admin === true,
    codigo: initialData?.codigo ? String(initialData.codigo) : random6(),
    // por defecto: HOY
    fecha_codigo: defaultDate,
  }))

  const [expositores, setExpositores] = useState(() => expositoresOptions)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setExpositores(expositoresOptions)
  }, [expositoresOptions])

  useEffect(() => {
    const id = Number(form.id_expositor)
    if (!id || !Array.isArray(expositores)) return
    const exists = expositores.some(opt => Number(opt.value) === id)
    if (!exists) {
      const label = initialData?.nombre_expositor ?? `Expositor #${id}`
      setExpositores(prev => [{ value: String(id), label }, ...prev])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id_expositor, initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Restringimos el código a solo dígitos y máx 6
    if (name === 'codigo') {
      const digits = String(value).replace(/\D/g, '').slice(0, 6)
      setForm(f => ({ ...f, codigo: digits }))
      return
    }

    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
  }

  // Opciones filtradas (incluye el seleccionado aunque no matchee el filtro)
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    let opts = Array.isArray(expositores) ? expositores : []

    if (q) {
      opts = opts.filter(o =>
        String(o.label ?? '').toLowerCase().includes(q) ||
        String(o.value ?? '').includes(q)
      )
    }

    const selId = String(form.id_expositor || '')
    if (selId) {
      const hasSel = opts.some(o => String(o.value) === selId)
      if (!hasSel) {
        const idNum = Number(selId)
        const selFromList = (Array.isArray(expositores) ? expositores : []).find(o => String(o.value) === selId)
        const injected = selFromList ?? { value: selId, label: initialData?.nombre_expositor ?? `Expositor #${idNum}` }
        opts = [injected, ...opts]
      }
    }

    const seen = new Set()
    const deduped = []
    for (const o of opts) {
      const key = String(o?.value ?? '')
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(o)
      }
    }
    return deduped
  }, [search, expositores, form.id_expositor, initialData?.nombre_expositor])

  // Validaciones obligatorias:
  // - expositor seleccionado
  // - email válido básico
  // - código: exactamente 6 dígitos
  // - fecha: no vacía
  const canSubmit = useMemo(() => {
    const email = String(form.email || '').trim()
    const expositorOk = Number(form.id_expositor) > 0
    const codigoOk = /^\d{6}$/.test(String(form.codigo || ''))
    const fechaOk = Boolean(String(form.fecha_codigo || '').trim())
    return expositorOk && email.length > 3 && email.includes('@') && codigoOk && fechaOk
  }, [form.email, form.id_expositor, form.codigo, form.fecha_codigo])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) {
      alert('Completá Expositor, Email, Código (6 dígitos) y Fecha.')
      return
    }
    const payload = {
      _id: form._id ?? undefined,
      id_expositor: Number(form.id_expositor),
      email: String(form.email || '').trim(),
      nombre: String(form.nombre || '').trim(),
      admin: form.admin ? 1 : 0,
      codigo: String(form.codigo || '').trim(),          // requerido (6 dígitos)
      fecha_codigo: String(form.fecha_codigo || '').trim(), // requerido (por defecto hoy)
    }
    onSave(payload)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions.length === 1) {
        setForm(f => ({ ...f, id_expositor: String(filteredOptions[0].value) }))
      }
    }
  }

  const clearSearch = () => setSearch('')

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col min-h-0">
      {/* header */}
      <div className="pb-3 px-4 pt-4 pr-10 border-b bg-white shrink-0">
        <h2 className="font-bold text-lg">
          {isEdit ? 'Editar Usuario de Expositor' : 'Nuevo Usuario de Expositor'}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            ID: <strong>{form._id}</strong>
          </p>
        )}
      </div>

      {/* body scrolleable */}
      <div className="flex-1 min-h-0 px-4 py-4 space-y-4">
        {/* Relación con Expositor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Expositor <span className="text-red-600">*</span></label>

            {/* Buscador del combo */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center flex-1 border rounded px-2 bg-white">
                <FiSearch className="text-gray-400 mr-2" />
                <input
                  className="flex-1 py-1 outline-none"
                  placeholder="Buscar expositor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600"
                    title="Limpiar búsqueda"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredOptions.length} resultados
              </span>
            </div>

            {/* Select filtrado */}
            <select
              name="id_expositor"
              value={form.id_expositor ?? ''}
              onChange={handleChange}
              className="border p-2 w-full rounded bg-white"
              required
            >
              <option value="">Seleccioná expositor…</option>
              {filteredOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="admin"
              type="checkbox"
              name="admin"
              checked={Boolean(form.admin)}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="admin" className="text-sm text-gray-700">Admin</label>
          </div>
        </div>

        {/* Datos del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Email <span className="text-red-600">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre || ''}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              placeholder="Nombre y apellido"
            />
          </div>
        </div>

        {/* Código + Fecha (requeridos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Código (6 dígitos) <span className="text-red-600">*</span></label>
            <input
              name="codigo"
              value={form.codigo || ''}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              placeholder="000000"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm text-gray-600 mb-1">Fecha Código <span className="text-red-600">*</span></label>
            <input
              type="date"
              name="fecha_codigo"
              value={form.fecha_codigo || ''}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
        </div>
      </div>

      {/* footer fijo */}
      <div className="px-4 pt-3 pb-4 border-t bg-white flex gap-2 justify-end shrink-0">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-4 py-2 bg-primary text-black rounded hover:bg-yellow-400 disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

export default ExpositorUsuarioFormModal
