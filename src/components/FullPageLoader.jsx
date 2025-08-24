import { useLoading } from '../context/LoadingContext'

const FullPageLoader = () => {
  const { loading } = useLoading()

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="border-4 border-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
    </div>
  )
}

export default FullPageLoader