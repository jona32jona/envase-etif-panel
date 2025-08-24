import {
  FiHome, FiUsers, FiList, FiBox, FiBell,
  FiPieChart, FiLogOut
} from 'react-icons/fi'

const sidebarConfig = [
  {
    title: 'Gestión',
    items: [
      {
        to: '/empresas',
        label: 'EMPRESAS',
        icon: FiHome,
        roles: ['admin'],
      },
      {
        to: '/empleados',
        label: 'EMPLEADOS',
        icon: FiUsers,
        roles: ['admin'],
      },
      {
        to: '/menu',
        label: 'MENU',
        icon: FiList,
        roles: ['admin', 'usuario'],
      },
      {
        to: '/pedidos',
        label: 'PEDIDOS',
        icon: FiBox,
        roles: ['admin', 'usuario'],
      },
    ]
  },
  {
    title: 'Notificaciones',
    items: [
      {
        to: '/notificaciones',
        label: 'NOTIFICACIONES',
        icon: FiBell,
        roles: ['admin', 'usuario'],
      }
    ]
  },
  {
    title: 'Análisis',
    items: [
      {
        to: '/reportes',
        label: 'REPORTES',
        icon: FiPieChart,
        roles: ['admin']
      },
      {
        to: '/reportesotros',
        label: 'REPORTES OTROS',
        icon: FiPieChart,
        roles: ['admin']
      }
    ]
  },
  {
    title: 'Sesión',
    items: [
      {
        to: '/salir',
        label: 'SALIR',
        icon: FiLogOut,
        roles: ['admin', 'usuario'],
      }
    ]
  }
]

export default sidebarConfig