import { useTranslation } from 'react-i18next'
import { useLoading } from '../context/LoadingContext'
import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import PageHeader from '../components/PageHeader'
import PageFooter from '../components/PageFooter'
import SectionView from '../components/SectionView'
import { FiCalendar, FiBarChart2 } from 'react-icons/fi'
import { useModal } from '../context/ModalContext'
import ChartView from '../components/views/ChartView'
import EmpleadoFormModal from '../components/EmpleadoFormModal'
import ChartModal from '../components/ChartModal'

const EMPRESAS = ['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D', 'Empresa E']

const total = 200
const aCount = Math.floor(total * 0.6) // 120 empleados
const restantes = total - aCount        // 80 empleados
const otrasEmpresas = EMPRESAS.slice(1) // ['Empresa B', ... 'E']

// Distribuir aleatoriamente el resto
const empleadosRestantes = Array.from({ length: restantes }, (_, i) => {
  const empresaIdx = Math.floor(Math.random() * otrasEmpresas.length)
  return otrasEmpresas[empresaIdx]
})

// Mezclar todas las empresas
const empresasArray = [
  ...Array(aCount).fill('Empresa A'),
  ...empleadosRestantes
]

// Ahora generamos los empleados (en orden)
const empleadosRandom = empresasArray.map((empresa, i) => ({
  nombre: `Empleado ${i + 1}`,
  dni: `30.1${(100000 + i).toString().slice(-6)}-${i % 10}`,
  email: `empleado${i + 1}@${empresa.replace(' ', '').toLowerCase()}.com`,
  empresa
}))

const Agenda2 = () => {
  const { t } = useTranslation()
  const { show, hide } = useLoading()
  const [footerHeight, setFooterHeight] = useState(0)
  const footerRef = useRef(null)
  const { openModal, closeModal } = useModal() 
  const [empleados, setEmpleados] = useState(empleadosRandom) // para poder editar


  const handleEditEmpleado = (empleado) => {
  openModal(
    <EmpleadoFormModal
      initialData={empleado}
      onSave={(nuevo) => {
        setEmpleados(emps =>
          emps.map(emp => emp.dni === empleado.dni ? nuevo : emp)
        )
        closeModal()
      }}
      onCancel={closeModal}
    />
  )
}

const handleDeleteEmpleado = (empleado) => {
  openModal(
    <div>
      <p>¿Estás seguro que deseas eliminar a <b>{empleado.nombre}</b>?</p>
      <div className="flex gap-2 mt-4 justify-end">
        <button onClick={closeModal} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
        <button
          onClick={() => {
            setEmpleados(emps => emps.filter(e => e.dni !== empleado.dni))
            closeModal()
          }}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

  const handleRowDoubleClick = (empleado) => {
  openModal(
    <EmpleadoFormModal
      initialData={empleado}
      onSave={(nuevo) => {
        setEmpleados(emps =>
          emps.map(emp => emp.dni === empleado.dni ? nuevo : emp)
        )
        closeModal()
      }}
      onCancel={closeModal}
    />
  )
}

  useLayoutEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      show()
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
      } finally {
        if (isMounted) hide()
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])

  const handleNuevoClick = () => alert('Nuevo Empleado')
  const handleGuardarClick = () => alert('Guardar Empleado')

  

  // Datos para el gráfico (conteo de empleados por empresa)
  const dataPorEmpresa = EMPRESAS.map(nombre =>
    empleadosRandom.filter(emp => emp.empresa === nombre).length
  )

  const chartConfig = {
    type: 'doughnut',
    data: {
      labels: EMPRESAS,
      datasets: [{
        label: 'Empleados por empresa',
        data: dataPorEmpresa,
        backgroundColor: [
          '#FACC15', '#3B82F6', '#22D3EE', '#F472B6', '#34D399'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom' },
        title: { display: true, text: 'Cantidad de empleados por empresa' }
      }
    }
  }

   const handleShowModalChart = () => {
        openModal(
            <ChartModal
            baseConfig={chartConfig}
            onClose={closeModal}
            />
        )
    }

  return (
    <div className="flex flex-col h-full text-text">
      <div className="p-4">
        <PageHeader
          title={t('Agenda')}
          icon={<FiCalendar />}
        />
        <p className="text-text_secondary mt-2">
          {'Lista de empleados registrados'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: `${footerHeight}px` }}>
        <SectionView
          type="table"
          config={{
            columns: [
              { header: 'Nombre', accessor: 'nombre' },
              { header: 'DNI', accessor: 'dni' },
              { header: 'Email', accessor: 'email' },
              { header: 'Empresa', accessor: 'empresa' }
            ],
            rows: empleados,
            onRowDoubleClick: handleRowDoubleClick, // 👈 NUEVO
            onEdit: handleEditEmpleado,      // 👈 NUEVO
            onDelete: handleDeleteEmpleado   // 👈 NUEVO
          }}
        />
      </div>

      <div ref={footerRef}>
        <PageFooter
          showBtn1
          btn1Text={t('Nuevo')}
          onBtn1Click={handleNuevoClick}
          showBtn2
          btn2Text={t('Guardar')}
          onBtn2Click={handleGuardarClick}
          showBtn3
          btn3Text={'Ver gráfico'}
          onBtn3Click={handleShowModalChart}
          icon3={<FiBarChart2 />}
        />
      </div>
    </div>
  )
}

export default Agenda2
