import { useState, useEffect } from 'react'
import { addService, deleteService, removeWorkerFromTable, updateService, setTip, deleteTip } from '@/app/api/shifts'
import { useLoading } from '@/components/ui/LoadingProvider'
import { cleanCurrencyValue, formatCurrency } from '@/lib/currency'
import { type PaymentMethod } from '@/lib/paymentMethods'

export interface Service {
  id: number
  worker: { id: number; name: string }
  service: string
  amount: number
  method: string
}

export interface Worker {
  id: number
  name: string
  salaryRate: number
}

export interface Shift {
  id: number
  closingCash: number | null
}

export interface ServicesTableData {
  services: Service[]
  workers: Worker[]
  shift: Shift
  tips?: Array<{ workerId: number; amount: number }>
}

export const useServicesTable = ({ services, workers, shift, tips = [] }: ServicesTableData) => {
  const { start, stop } = useLoading()
  const isShiftClosed = shift.closingCash !== null
  // Локальное состояние чаевых для мгновенного обновления UI
  const [tipsState, setTipsState] = useState<Array<{ workerId: number; amount: number }>>(tips)

  useEffect(() => {
    setTipsState(tips)
  }, [tips])


  // Состояние для выбранных мастеров в смене
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>([])

  // Инициализируем выбранных мастеров только теми, у кого уже есть услуги
  useEffect(() => {
    const workersWithServices = workers.filter(worker =>
      services.some(service => service.worker.id === worker.id)
    )
    setSelectedWorkers(workersWithServices)
  }, [workers, services])

  // Группируем услуги по мастерам
  const servicesByWorker = selectedWorkers.reduce((acc, worker) => {
    acc[worker.id] = services.filter(s => s.worker.id === worker.id)
    return acc
  }, {} as Record<number, Service[]>)

  // Находим максимальное количество строк для отображения
  const filledRowsCounts = selectedWorkers.map(w => (servicesByWorker[w.id] || []).length)
  const maxFilled = filledRowsCounts.length ? Math.max(...filledRowsCounts) : 0
  const maxRows = Math.max(maxFilled + 1, 1)

  // Итоги по каждому мастеру и общий итог
  const totalsByWorker: Record<number, number> = selectedWorkers.reduce((acc, worker) => {
    const total = (servicesByWorker[worker.id] || []).reduce((sum, s) => sum + s.amount, 0)
    acc[worker.id] = total
    return acc
  }, {} as Record<number, number>)

  const grandTotal = services.reduce((sum, s) => sum + s.amount, 0)

  // Чаевые по каждому работнику
  const tipsByWorker: Record<number, number> = tipsState.reduce((acc, t) => {
    acc[t.workerId] = (acc[t.workerId] || 0) + t.amount
    return acc
  }, {} as Record<number, number>)

  // Итоговая ЗП по каждому работнику: услуги * коэф + чай
  const salaryByWorker: Record<number, number> = selectedWorkers.reduce((acc, worker) => {
    const servicesTotal = totalsByWorker[worker.id] || 0
    const tipsAmount = tipsByWorker[worker.id] || 0
    acc[worker.id] = servicesTotal * worker.salaryRate + tipsAmount
    return acc
  }, {} as Record<number, number>)

  // Добавление новой услуги
  const handleAddService = async (workerId: number, amount: string, method: PaymentMethod) => {
    const cleanAmount = cleanCurrencyValue(amount)
    const formData = new FormData()
    formData.append('shiftId', String(shift.id))
    formData.append('workerId', String(workerId))
    formData.append('service', 'Услуга')
    formData.append('amount', cleanAmount)
    formData.append('method', method)

    start()
    await addService(formData)
    stop()
  }

  // Обновление существующей услуги
  const handleUpdateService = async (serviceId: number, newAmount: string, method?: PaymentMethod) => {
    const cleanAmount = cleanCurrencyValue(newAmount)
    const numericAmount = cleanAmount === '' ? NaN : Number(cleanAmount)
    if (cleanAmount === '' || Number.isNaN(numericAmount) || numericAmount < 0) return

    const formData = new FormData()
    formData.append('id', String(serviceId))
    formData.append('shiftId', String(shift.id))
    formData.append('amount', cleanAmount)
    if (method) {
      formData.append('method', method)
    }

    start()
    await updateService(formData)
    stop()
  }

  // Удаление услуги
  const handleDeleteService = async (serviceId: number) => {
    const formData = new FormData()
    formData.append('id', String(serviceId))
    formData.append('shiftId', String(shift.id))

    start()
    await deleteService(formData)
    stop()
  }

  // Добавление мастера в таблицу
  const handleWorkerSelect = (workerId: string) => {
    if (!workerId) return

    const worker = workers.find(w => w.id === Number(workerId))
    if (worker && !selectedWorkers.some(w => w.id === worker.id)) {
      setSelectedWorkers(prev => [...prev, worker])
    }
  }

  // Удаление мастера из таблицы
  const handleRemoveWorker = async (workerId: number) => {
    const formData = new FormData()
    formData.append('shiftId', String(shift.id))
    formData.append('workerId', String(workerId))

    start()
    await removeWorkerFromTable(formData)
    stop()
    setSelectedWorkers(prev => prev.filter(w => w.id !== workerId))
  }

  // Установка чаевых для работника
  const handleSetTip = async (workerId: number, amount: string) => {
    const cleanAmount = cleanCurrencyValue(amount)
    const numericAmount = cleanAmount === '' ? 0 : Number(cleanAmount)

    start()
    if (numericAmount <= 0) {
      const fd = new FormData()
      fd.append('shiftId', String(shift.id))
      fd.append('workerId', String(workerId))
      await deleteTip(fd)
      setTipsState(prev => prev.filter(t => t.workerId !== workerId))
    } else {
      const fd = new FormData()
      fd.append('shiftId', String(shift.id))
      fd.append('workerId', String(workerId))
      fd.append('amount', cleanAmount)
      await setTip(fd)
      setTipsState(prev => {
        const others = prev.filter(t => t.workerId !== workerId)
        return [...others, { workerId, amount: numericAmount }]
      })
    }
    stop()
  }

  const handleDeleteTip = async (workerId: number) => {
    const fd = new FormData()
    fd.append('shiftId', String(shift.id))
    fd.append('workerId', String(workerId))
    start()
    await deleteTip(fd)
    stop()
    setTipsState(prev => prev.filter(t => t.workerId !== workerId))
  }

  return {
    // Состояние
    selectedWorkers,
    servicesByWorker,
    maxRows,
    totalsByWorker,
    grandTotal,
    tipsByWorker,
    salaryByWorker,
    isShiftClosed,

    // Действия
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    handleWorkerSelect,
    handleRemoveWorker,
    handleSetTip,
    handleDeleteTip,
  }
}
