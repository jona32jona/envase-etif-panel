import { useModal } from '../context/ModalContext'

const GlobalModal = () => {
  const { modal, closeModal } = useModal()

  if (!modal.open) return null

  // Por defecto ancho mediano, pero puede ser "max-w-2xl", "max-w-4xl", etc.
  const customClass =
    modal.className || "max-w-lg"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className={`bg-white dark:bg-background rounded-lg p-6 shadow-lg min-w-[320px] w-full ${customClass} relative`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-primary text-lg"
          onClick={closeModal}
        >
          &times;
        </button>
        {typeof modal.content === 'function'
          ? modal.content({ closeModal })
          : modal.content}
      </div>
    </div>
  )
}
export default GlobalModal