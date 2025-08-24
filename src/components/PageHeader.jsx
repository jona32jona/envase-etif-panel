const PageHeader = ({ title, icon }) => {
  return (
    <div className="flex items-center gap-3 mb-6 border-b pb-3">
      <div className="text-2xl text-gray-700">{icon}</div>
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
    </div>
  )
}

export default PageHeader