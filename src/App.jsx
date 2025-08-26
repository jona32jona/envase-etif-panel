import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Expositores from './pages/Expositores'
import ExpositoresUsuarios from './pages/ExpositoresUsuarios'
import Agenda from './pages/Agenda'
import Banners from './pages/Banners'
import ComoLlegar from './pages/ComoLlegar'
import Notificaciones from './pages/Notificaciones'
import Reportes from './pages/Reportes'
import ReportesOtros from './pages/ReportesOtros'
import Logout from './pages/Logout'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* 👇 index manda a expositores y NO deja historia */}
        <Route index element={<Navigate to="expositores" replace />} />

        <Route path="expositores" element={<Expositores />} />
        <Route path="expositores_usuarios" element={<ExpositoresUsuarios />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="banners" element={<Banners />} />
        <Route path="comollegar" element={<ComoLlegar />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="reportesotros" element={<ReportesOtros />} />
        <Route path="salir" element={<Logout />} />
      </Route>

      {/* 👇 si hay mismatch, mandá a una ruta VÁLIDA, no a "/" */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/expositores' : '/login'} replace />
        }
      />
    </Routes>
  )
}

export default App