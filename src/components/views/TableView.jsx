import { useState, useMemo, useEffect, useRef } from 'react'
import { FiChevronDown, FiChevronUp, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'

// Simple helper para detectar touch devices
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0)

  
const TableView = ({ config, rowsPerPage: defaultRowsPerPage = 20 }) => {
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState({ column: null, asc: true })
  const [search, setSearch] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)
  const containerRef = useRef(null)

  const touchMode = isTouchDevice()

   // --- 👇 Ajustar rowsPerPage dinámicamente ---
  useEffect(() => {
    const calcRowsPerPage = () => {
      const rowHeight = 40 // Estimado en px
      const headerHeight = 180 // Header, botones, paddings, etc.
      const availableHeight = window.innerHeight - headerHeight
      const visibleRows = Math.max(5, Math.floor(availableHeight / rowHeight))
      setRowsPerPage(visibleRows)
    }

    calcRowsPerPage()
    window.addEventListener('resize', calcRowsPerPage)
    return () => window.removeEventListener('resize', calcRowsPerPage)
  }, [])


  // Filtrado, orden, paginado igual que antes...
  const filteredRows = useMemo(() => {
    if (!search.trim()) return config?.rows || []
    return (config?.rows || []).filter(row =>
      config.columns.some(col =>
        String(row[col.accessor] ?? '').toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [search, config])

  const sortedRows = useMemo(() => {
    if (!sort.column) return filteredRows
    const col = sort.column
    return [...filteredRows].sort((a, b) => {
      if (a[col] < b[col]) return sort.asc ? -1 : 1
      if (a[col] > b[col]) return sort.asc ? 1 : -1
      return 0
    })
  }, [filteredRows, sort])

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage)
  const start = page * rowsPerPage
  const currentRows = sortedRows.slice(start, start + rowsPerPage)

  const handleSort = (accessor) => {
    setSort(prev =>
      prev.column === accessor ? { column: accessor, asc: !prev.asc } : { column: accessor, asc: true }
    )
    setPage(0)
  }

  const handlePrev = () => setPage(p => Math.max(p - 1, 0))
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages - 1))

  // Para mobile: selecciona con tap
  const handleRowClick = (idx) => {
    if (touchMode) setSelectedIdx(start + idx)
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex items-center mb-2">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          className="border border-border px-2 py-1 rounded focus:outline-none text-text_secondary bg-table_odd"
          placeholder="Buscar..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        <span className="ml-auto text-xs text-gray-400">{filteredRows.length} resultados</span>
      </div>

      {/* Tabla */}
      <table className="w-full border-collapse border border-border text-sm">
        <thead>
          <tr>
            {config?.columns?.map((col, idx) => (
              <th
                key={idx}
                className="border border-border p-2 bg-gray-100 text-text_titles font-semibold text-left select-none cursor-pointer"
                onClick={() => handleSort(col.accessor)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {sort.column === col.accessor && (
                    sort.asc
                      ? <FiChevronUp className="inline text-xs" />
                      : <FiChevronDown className="inline text-xs" />
                  )}
                </div>
              </th>
            ))}
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {currentRows?.map((row, idx) => {
            // Lógica combinada: hovered en desktop, seleccionado en touch
            const showActions = touchMode
              ? selectedIdx === start + idx
              : hoveredIdx === idx

            const isActive = showActions

            return (
              <tr
                key={idx}
                className={
                  `relative group cursor-pointer transition
                  ${isActive
                    ? 'bg-primary/30 text-black'
                    : idx % 2 === 1
                      ? 'bg-table_odd'
                      : ''}
                  `
                }
                onMouseEnter={() => !touchMode && setHoveredIdx(idx)}
                onMouseLeave={() => !touchMode && setHoveredIdx(null)}
                onClick={() => handleRowClick(idx)}
                onDoubleClick={config.onRowDoubleClick ? () => config.onRowDoubleClick(row) : undefined}
              >
                {config.columns.map((col, cidx) => (
                  <td key={cidx} className="border border-border p-2 text-text_secondary">
                    {row[col.accessor]}
                  </td>
                ))}
                <td
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 z-10
                    opacity-0 group-hover:opacity-100
                    ${isActive ? 'opacity-100' : ''}
                    transition-opacity
                  `}
                  style={{ pointerEvents: 'auto' }}
                >
                  <button
                    title="Editar"
                    onClick={e => { e.stopPropagation(); config.onEdit && config.onEdit(row) }}
                    className="bg-primary text-black rounded-full p-2 shadow hover:bg-yellow-400 transition"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    title="Eliminar"
                    onClick={e => { e.stopPropagation(); config.onDelete && config.onDelete(row) }}
                    className="bg-red-500 text-white rounded-full p-2 shadow hover:bg-red-700 transition"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-4 text-sm text-text">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-3 py-1 bg-secondary text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page + 1} de {totalPages}</span>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="px-3 py-1 bg-secondary text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default TableView
