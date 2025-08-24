import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)

  const show = useCallback(() => setLoading(true), [])
  const hide = useCallback(() => setLoading(false), [])

  return (
    <LoadingContext.Provider value={{ loading, show, hide }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)