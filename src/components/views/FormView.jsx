const FormView = ({ config }) => {
  return (
    <form className="space-y-4">
      {config?.fields?.map((field, index) => (
        <div key={index} className="flex flex-col">
          <label className="text-sm font-medium">{field.label}</label>
          <input
            type={field.type || 'text'}
            placeholder={field.placeholder}
            className="p-2 border rounded"
          />
        </div>
      ))}
    </form>
  )
}

export default FormView