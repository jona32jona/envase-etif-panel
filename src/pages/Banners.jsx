import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import { FiImage } from 'react-icons/fi'

const Banners = () => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <PageHeader title="BANNERS" icon={<FiImage />} />
        <p>Contenido del BANNERS...</p>
      </div>

      <PageFooter
        showBtn1={true}
        btn1Text="Agregar"
        showBtn2={true}
        btn2Text="Guardar"
        showBtn3={true}
        btn3Text="Cancelar"
      />
    </div>
  )
}

export default Banners