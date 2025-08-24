import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const DashboardLayout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 bg-gray-100 h-full overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout