import { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  // 👇 ahora incluimos className en el estado
  const [modal, setModal] = useState({ open: false, content: null, className: '' })

  // Nuevo: openModal acepta contenido Y className opcional
  const openModal = useCallback((content, className = '') =>
    setModal({ open: true, content, className }), []
  )
  const closeModal = useCallback(() => setModal({ open: false, content: null, className: '' }), [])

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)