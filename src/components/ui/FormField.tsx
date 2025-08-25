interface FormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
}

export default function FormField({ label, children, required = false }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
