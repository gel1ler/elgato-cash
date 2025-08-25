import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  noBorder?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, noBorder = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full ${noBorder ? '' : 'border focus:ring-2'} border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
