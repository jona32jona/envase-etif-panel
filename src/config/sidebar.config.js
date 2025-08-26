import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiImage,
  FiMapPin,
  FiBell,
  FiPieChart,
  FiLogOut,
} from 'react-icons/fi'

const sidebarConfig = [
  {
    title: 'Gestión',
    items: [
      {
        to: '/expositores',
        label: 'EXPOSITORES',
        icon: FiBriefcase,
        roles: ['admin'],
      },
      {
        to: '/expositores_usuarios',
        label: 'EXPOSITORES USUARIOS',
        icon: FiUsers,
        roles: ['admin'],
      },
      {
        to: '/agenda',
        label: 'AGENDA',
        icon: FiCalendar,
        roles: ['admin'],
      },
      {
        to: '/banners',
        label: 'BANNERS',
        icon: FiImage,
        roles: ['admin', 'usuario'],
      },
      {
        to: '/comollegar',
        label: 'COMO LLEGAR',
        icon: FiMapPin,
        roles: ['admin', 'usuario'],
      },
    ],
  },
  {
    title: 'Notificaciones',
    items: [
      {
        to: '/notificaciones',
        label: 'NOTIFICACIONES',
        icon: FiBell,
        roles: ['admin', 'usuario'],
      },
    ],
  },
  {
    title: 'Análisis',
    items: [
      {
        to: '/reportes',
        label: 'REPORTES',
        icon: FiPieChart,
        roles: ['admin'],
      },
      {
        to: '/reportesotros',
        label: 'REPORTES OTROS',
        icon: FiPieChart,
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Sesión',
    items: [
      {
        to: '/salir',
        label: 'SALIR',
        icon: FiLogOut,
        roles: ['admin', 'usuario'],
      },
    ],
  },
]

export default sidebarConfig