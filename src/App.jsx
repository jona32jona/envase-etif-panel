import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Empresas from './pages/Empresas'
import Empleados from './pages/Empleados'
import Menu from './pages/Menu'
import Pedidos from './pages/Pedidos'
import Notificaciones from './pages/Notificaciones'
import Reportes from './pages/Reportes'
import ReportesOtros from './pages/ReportesOtros'
import Logout from './pages/Logout'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="empresas" element={<Empresas />} />
        <Route path="empleados" element={<Empleados />} />
        <Route path="menu" element={<Menu />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="reportesotros" element={<ReportesOtros />} />
        <Route path="salir" element={<Logout />} />
        <Route index element={<Navigate to="empresas" />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  )
}

export default App