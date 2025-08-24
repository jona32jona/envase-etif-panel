import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiPieChart } from 'react-icons/fi'

const Reportes = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Reportes" icon={<FiPieChart />} />
        <p>Contenido de reportes...</p>
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

export default Reportes