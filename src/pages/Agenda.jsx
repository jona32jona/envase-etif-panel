import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiCalendar } from 'react-icons/fi'

const Agenda = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Agenda" icon={<FiCalendar />} />
        <p>Contenido de Agenda...</p>
      </div>

      <PageFooter
        showBtn1={true}
        btn1Text="Generar"
        showBtn3={true}
        btn3Text="Descargar PDF"
      />
    </div>
  )
}

export default Agenda