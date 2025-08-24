import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiBell } from 'react-icons/fi'

const Notificaciones = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Notificaciones" icon={<FiBell />} />
        <p>Contenido de notificaciones...</p>
      </div>

      <PageFooter
        showBtn1={true}
        btn1Text="Marcar todo como leído"
        showBtn3={true}
        btn3Text="Limpiar"
      />
    </div>
  )
}

export default Notificaciones