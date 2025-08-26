import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiUsers } from 'react-icons/fi'

const ExpositoresUsuarios = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Expositores Usuarios" icon={<FiUsers />} />
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

export default ExpositoresUsuarios