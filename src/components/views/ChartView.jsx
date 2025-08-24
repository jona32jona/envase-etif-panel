import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title
} from 'chart.js'

// Registro de componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title
)

const chartMap = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut
}

const ChartView = ({ config }) => {
  const { type, data, options } = config || {}

  if (!type || !data) {
    return (
      <div className="text-red-500 text-sm p-4 text-center">
        ⚠️ Falta información para mostrar el gráfico (tipo o datos).
      </div>
    )
  }

  const ChartComponent = chartMap[type] || Line

  return (
    <div className="w-full max-w-2xl mx-auto"> {/* este max-w lo puedes aumentar o quitar */}
        <ChartComponent data={data} options={options} />
    </div>
    )
}

export default ChartView
