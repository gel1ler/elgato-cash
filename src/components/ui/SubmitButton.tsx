'use client'

import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import Button from './Button'
import Spinner from './Spinner'
import { useLoading } from './LoadingProvider'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export default function SubmitButton({ children, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const { start, stop } = useLoading()

  useEffect(() => {
    if (pending) start()
    else stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Spinner className="h-4 w-4 mr-2" />} {children}
    </Button>
  )
}


