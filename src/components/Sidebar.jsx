import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import sidebarConfig from '../config/sidebar.config'
import {
  FiUser, FiMenu, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { useMemo, useState } from 'react'

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const toggleCollapse = () => setCollapsed(!collapsed)

  const sidebarWidth = collapsed ? 'w-[70px]' : 'w-[220px]'

  const { user, isAuthenticated } = useAuth()
  // Rol seguro: si no hay user aún, usar un rol por defecto
  const role = user?.role ?? 'usuario'

  // Generar secciones de forma segura y memoizada
  const sections = useMemo(() => {
    return sidebarConfig
      .map((section) => {
        const items = (section.items ?? []).filter((item) => {
          // Si el item no define roles, lo consideramos visible para todos
          const roles = item.roles ?? ['admin', 'usuario']
          return roles.includes(role)
        })
        return { title: section.title, items }
      })
      .filter((section) => section.items.length > 0)
  }, [role])

  return (
    <>
      {/* Modo móvil */}
      <div className="md:hidden p-4 bg-background text-text flex items-center justify-between">
        <img src="/logo.png" alt="Logo" className="h-10" />
        <button onClick={toggleMobile}>
          <FiMenu size={18} />
        </button>
      </div>

      {/* Sidebar principal */}
      <div className={`fixed md:static top-0 left-0 z-40 ${sidebarWidth} bg-background text-text transition-all duration-300 transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:flex md:flex-col h-screen`}>

        {/* Botón colapsar */}
        <div className="hidden md:flex justify-end mb-2">
          <button
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
            className="text-text hover:text-primary transition-colors duration-200 focus:outline-none bg-transparent border-none p-1 rounded"
          >
            {collapsed ? <FiChevronRight size={24} /> : <FiChevronLeft size={24} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {/* Logo */}
          {!collapsed && (
            <div className="mb-8 hidden md:flex justify-center">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
            </div>
          )}

          {/* Menú dividido por secciones */}
          <nav className="flex flex-col gap-2">
            {sections.map((section, idx) => (
              <div key={idx}>
                {!collapsed && (
                  <span className="text-xs text-gray-400 px-3 mt-4 mb-1 block uppercase tracking-wider">
                    {section.title}
                  </span>
                )}
                {section.items.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : ''}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium
                      ${isActive ? 'bg-secondary text-primary' : 'hover:bg-secondary hover:text-primary'}
                      ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !collapsed && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r transition-all duration-200" />
                        )}
                        <span className="text-lg">{link.icon && <link.icon />}</span>
                        {!collapsed && <span>{link.label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

         {/* Usuario al fondo del sidebar */}
        {!collapsed && isAuthenticated && user && (
          <div className="absolute bottom-4 left-0 w-full px-4">
            <div className="border-t border-secondary pt-4 text-sm text-center">
              <div className="flex flex-col items-center gap-1 mb-1 text-text">
                <div className="flex items-center gap-2">
                  <FiUser size={16} />
                  <span className="font-medium">{user.name ?? 'Usuario'}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    role === 'admin' ? 'bg-primary text-black' : 'bg-accent text-white'
                  }`}
                >
                  {role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{user.email ?? ''}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
