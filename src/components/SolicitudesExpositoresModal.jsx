// src/components/SolicitudesExpositoresModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiX, FiSearch } from 'react-icons/fi'
import { useLoading } from '../context/LoadingContext'
import {
  fetchSolicitudesVisitantes,
  approveSolicitudVisitante,
  deleteSolicitudVisitante,
} from '../services/visitantes_expositores.api'

const SolicitudesExpositoresModal = ({ onClose, onAnyChange }) => {
  const { show, hide } = useLoading()
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [approveAsAdmin, setApproveAsAdmin] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        show()
        setError(null)
        const data = await fetchSolicitudesVisitantes()
        if (alive) setRows(data)
      } catch (err) {
        console.error('[SolicitudesExpositoresModal] fetch error', err)
        if (alive) setError(err)
      } finally {
        hide()
      }
    }
    load()
    return () => { alive = false }
  }, [show, hide])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      String(r._id).includes(q) ||
      String(r.nombreyapellido).toLowerCase().includes(q) ||
      String(r.email).toLowerCase().includes(q) ||
      String(r.expositor).toLowerCase().includes(q)
    )
  }, [rows, search])

  const approveRow = async (row) => {
    try {
      show()
      const res = await approveSolicitudVisitante({ _id: row._id, admin: approveAsAdmin ? 1 : 0 })
      // quitar fila aprobada
      setRows(list => list.filter(r => Number(r._id) !== Number(row._id)))
      // refrescar la lista principal si nos pasaron callback
      onAnyChange && onAnyChange()
      // feedback
      const st = String(res?.status || '')
      if (st === 'approved') {
        alert('Solicitud aprobada y usuario creado.')
      } else if (st === 'already_exists') {
        alert('El usuario ya existía. Se eliminó la solicitud.')
      } else {
        alert('Operación realizada.')
      }
    } catch (err) {
      console.error('[SolicitudesExpositoresModal] approve error', err)
      alert('No se pudo aprobar la solicitud. ' + (err?.message || ''))
    } finally {
      hide()
    }
  }

  const deleteRow = async (row) => {
    if (!confirm('¿Eliminar esta solicitud sin aprobar?')) return
    try {
      show()
      await deleteSolicitudVisitante(row._id)
      setRows(list => list.filter(r => Number(r._id) !== Number(row._id)))
    } catch (err) {
      console.error('[SolicitudesExpositoresModal] delete error', err)
      alert('No se pudo eliminar la solicitud. ' + (err?.message || ''))
    } finally {
      hide()
    }
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* header */}
      <div className="pb-3 px-4 pt-4 pr-10 border-b bg-white shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg">Solicitudes de Usuarios Expositores</h2>
            <p className="text-xs text-gray-500 mt-1">
              Aprobá o eliminá solicitudes pendientes. Al aprobar se crea el usuario y se borra la solicitud.
            </p>
          </div>

          {/* Aprobar como... */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={approveAsAdmin}
              onChange={e => setApproveAsAdmin(e.target.checked)}
            />
            Aprobar como <span className="font-semibold">{approveAsAdmin ? 'Admin' : 'Usuario'}</span>
          </label>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {error && (
          <div className="p-3 rounded border border-red-300 text-red-700 bg-red-50">
            Error cargando solicitudes. {error.message}
          </div>
        )}

        {/* buscador */}
        <div className="flex items-center gap-2">
          <div className="flex items-center flex-1 border rounded px-2 bg-white">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              className="flex-1 py-1 outline-none"
              placeholder="Buscar por nombre, email o expositor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-500">{filtered.length} resultados</span>
        </div>

        {/* tabla */}
        <div className="overflow-auto rounded border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-text_titles">
                <th className="p-2 border border-border text-left">ID</th>
                <th className="p-2 border border-border text-left">Nombre</th>
                <th className="p-2 border border-border text-left">Email</th>
                <th className="p-2 border border-border text-left">Expositor</th>
                <th className="p-2 border border-border text-left">Fecha solicitud</th>
                <th className="p-2 border border-border text-center">App</th>
                <th className="p-2 border border-border text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="odd:bg-table_odd">
                  <td className="p-2 border border-border">{r._id}</td>
                  <td className="p-2 border border-border">{r.nombreyapellido}</td>
                  <td className="p-2 border border-border">{r.email}</td>
                  <td className="p-2 border border-border">{r.expositor}</td>
                  <td className="p-2 border border-border">{r.fecha_solicitud}</td>
                  <td className="p-2 border border-border text-center">
                    {r.app === 'Sí' ? (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700 border border-green-200">App</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 border border-gray-200">—</span>
                    )}
                  </td>
                  <td className="p-2 border border-border">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title={`Aprobar como ${approveAsAdmin ? 'Admin' : 'Usuario'}`}
                        onClick={() => approveRow(r)}
                        className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow transition"
                      >
                        <FiCheck />
                      </button>
                      <button
                        title="Eliminar solicitud"
                        onClick={() => deleteRow(r)}
                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow transition"
                      >
                        <FiX />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* footer */}
      <div className="px-4 pt-3 pb-4 border-t bg-white flex gap-2 justify-end shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default SolicitudesExpositoresModal
