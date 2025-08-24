import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiBox } from 'react-icons/fi'

const Pedidos = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="Pedidos" icon={<FiBox />} />
        <p>Contenido de pedidos...</p>
      </div>

      <PageFooter
        showBtn1={true}
        btn1Text="Nuevo Pedido"
        showBtn2={true}
        btn2Text="Confirmar"
        showBtn3={true}
        btn3Text="Cancelar"
      />
    </div>
  )
}

export default Pedidos