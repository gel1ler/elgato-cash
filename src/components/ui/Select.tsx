import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export default Select
