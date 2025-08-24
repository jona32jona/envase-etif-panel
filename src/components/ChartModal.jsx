import { useState } from 'react'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDisc } from 'react-icons/fi'

const chartMap = {
  bar: { label: "Barras", icon: <FiBarChart2 />, Component: Bar },
  line: { label: "Líneas", icon: <FiTrendingUp />, Component: Line },
  pie: { label: "Torta", icon: <FiPieChart />, Component: Pie },
  doughnut: { label: "Dona", icon: <FiDisc />, Component: Doughnut }
}

const ChartModal = ({ baseConfig, onClose }) => {
  const [selectedType, setSelectedType] = useState('doughnut')

  const ChartComp = chartMap[selectedType].Component
  // Opcional: podrías personalizar las opciones según el tipo

  return (
    <div className="p-4 w-full max-w-lg bg-white rounded shadow text-gray-800">
      <h2 className="text-lg font-bold mb-4">Selecciona el tipo de gráfico</h2>
      <div className="flex gap-4 mb-6">
        {Object.entries(chartMap).map(([type, { label, icon }]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`flex flex-col items-center p-2 rounded transition border
              ${selectedType === type ? 'bg-primary text-black border-primary' : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
      <div className="w-full max-w-md mx-auto mb-6">
        <ChartComp data={baseConfig.data} options={baseConfig.options} />
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded">Cerrar</button>
      </div>
    </div>
  )
}

export default ChartModal
