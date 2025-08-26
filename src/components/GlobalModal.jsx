// src/components/GlobalModal.jsx
import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { useModal } from '../context/ModalContext'
import { FiX } from 'react-icons/fi'

const GlobalModal = () => {
  const { modal, closeModal } = useModal()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeModal()
    if (modal.open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [modal.open, closeModal])

  if (!modal.open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`
          relative z-10 bg-white rounded-lg shadow-xl w-full
          max-h-[90vh] flex flex-col
          ${modal.className || 'max-w-3xl'}  /* <- al final para que pueda overridear */
        `}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Cerrar modal"
          className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <FiX size={18} />
        </button>

        {/* Contenido scrolleable cuando excede el viewport */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {modal.content}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default GlobalModal
