import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiPieChart } from 'react-icons/fi'

const ReportesOtros = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Reportes Otros" icon={<FiPieChart />} />
        <p>Contenido de reportes otros...</p>
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

export default ReportesOtros