// src/components/SectionView.jsx
import FormView from './views/FormView'
import TableView from './views/TableView'
import ChartView from './views/ChartView'

const SectionView = ({ type, config }) => {
  switch (type) {
    case 'form':
      return <FormView config={config} />
    case 'table':
      return <TableView config={config} />
    case 'chart':
      return <ChartView config={config} />
    default:
      return <div>Tipo de vista no soportado: {type}</div>
  }
}

export default SectionView