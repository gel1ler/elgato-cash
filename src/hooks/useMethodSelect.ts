import { useState } from 'react'
import { getMethodLabel, getMethodClassName, getMethodBadgeClassName, type PaymentMethod } from '@/lib/paymentMethods'

export interface MethodSelectState {
  workerId: number
  rowIndex: number
  amount: string
  serviceId?: number // Для обновления существующей услуги
}

export const useMethodSelect = () => {
  const [methodSelect, setMethodSelect] = useState<MethodSelectState | null>(null)

  const showMethodSelect = (workerId: number, rowIndex: number, amount: string, serviceId?: number) => {
    setMethodSelect({ workerId, rowIndex, amount, serviceId })
  }

  const hideMethodSelect = () => {
    setMethodSelect(null)
  }

  return {
    // Состояние
    methodSelect,

    // Методы
    showMethodSelect,
    hideMethodSelect,
    getMethodLabel,
    getMethodClassName,
    getMethodBadgeClassName,
  }
}
