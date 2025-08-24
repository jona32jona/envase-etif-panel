import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LoadingProvider } from './context/LoadingContext'
import FullPageLoader from './components/FullPageLoader'
import { ModalProvider } from './context/ModalContext' 
import GlobalModal from './components/GlobalModal'  
import './i18n'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          <ModalProvider>
            <App />
            <FullPageLoader />
            <GlobalModal />
          </ModalProvider>
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)