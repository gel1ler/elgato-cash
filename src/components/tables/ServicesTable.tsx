'use client'

import { addService, deleteService, removeWorkerFromTable, updateService } from '@/app/api/shifts'
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Button, Input, Select } from '../ui'
import { useLoading } from '../ui/LoadingProvider'
import { useState, useEffect, useRef } from 'react'

interface Service {
  id: number
  worker: { id: number; name: string }
  service: string
  amount: number
  method: string
}

interface ServicesTableProps {
  shift: {
    id: number
    closingCash: number | null
  }
  services: Service[]
  workers: Array<{ id: number; name: string }>
}

export default function ServicesTable({ shift, services, workers }: ServicesTableProps) {
  const isShiftClosed = shift.closingCash !== null
  const { start, stop } = useLoading()

  // Состояние для каждой ячейки отдельно (workerId + rowIndex)
  const [cellValues, setCellValues] = useState<Record<string, string>>({})

  // Состояние для отслеживания активной ячейки
  const [activeCell, setActiveCell] = useState<string | null>(null)

  // Ref для хранения ссылок на Input элементы
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Хелпер: ставит каретку после последней цифры (перед символом валюты)
  const moveCaretToNumberEnd = (cellKey: string) => {
    const input = inputRefs.current[cellKey]
    if (!input) return
    const value = input.value || ''
    const lastDigitIndex = value.search(/[0-9](?!.*[0-9])/)
    const caretPos = lastDigitIndex >= 0 ? lastDigitIndex + 1 : value.length
    requestAnimationFrame(() => {
      try {
        input.setSelectionRange(caretPos, caretPos)
      } catch { }
    })
  }

  const handleCellMouseDown = (workerId: number, rowIndex: number, e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault()
    const cellKey = `${workerId}-${rowIndex}`
    const input = inputRefs.current[cellKey]
    if (input) {
      input.focus()
      moveCaretToNumberEnd(cellKey)
    }
  }

  // Функция для форматирования суммы в денежный формат рублей
  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue)
  }

  // Функция для очистки введенного значения от форматирования
  const cleanCurrencyValue = (value: string): string => {
    return value.replace(/[^\d]/g, '')
  }

  // Состояние для выбранных мастеров в смене
  const [selectedWorkers, setSelectedWorkers] = useState<Array<{ id: number; name: string }>>([])

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

  // Выбор метода оплаты для новой услуги
  const [methodSelect, setMethodSelect] = useState<{
    workerId: number
    rowIndex: number
    amount: string
    serviceId?: number // Добавляем serviceId для обновления существующей услуги
  } | null>(null)

  const handleConfirmAddService = async (method: 'cash' | 'noncash' | 'transfer' | 'sbp') => {
    if (!methodSelect) return
    const { workerId, rowIndex, amount, serviceId } = methodSelect
    const cellKey = `${workerId}-${rowIndex}`
    const cleanAmount = cleanCurrencyValue(amount)
    const formData = new FormData()
    formData.append('shiftId', String(shift.id))
    formData.append('workerId', String(workerId))
    formData.append('service', 'Услуга')
    formData.append('amount', cleanAmount)
    formData.append('method', method)
    start()
    try {
      if (serviceId) {
        formData.append('id', String(serviceId))
        await updateService(formData)
      } else {
        await addService(formData)
      }
    } finally {
      stop()
    }
    setMethodSelect(null)
    setCellValues(prev => ({ ...prev, [cellKey]: '' }))
  }

  const handleCancelAddService = () => setMethodSelect(null)

  // Удаление конкретной услуги
  const handleDeleteService = async (serviceId: number) => {
    const formData = new FormData()
    formData.append('id', String(serviceId))
    formData.append('shiftId', String(shift.id))
    start()
    try {
      await deleteService(formData)
    } finally {
      stop()
    }
  }

  const handleWorkerSelect = (workerId: string) => {
    if (!workerId) return

    const worker = workers.find(w => w.id === Number(workerId))
    if (worker && !selectedWorkers.some(w => w.id === worker.id)) {
      setSelectedWorkers(prev => [...prev, worker])
    }
  }

  const handleRemoveWorker = async (workerId: number) => {
    const formData = new FormData()
    formData.append('shiftId', String(shift.id))
    formData.append('workerId', String(workerId))
    start()
    try {
      await removeWorkerFromTable(formData)
    } finally {
      stop()
    }
    setSelectedWorkers(prev => prev.filter(w => w.id !== workerId))
  }

  const handleCellChange = (workerId: number, rowIndex: number, value: string) => {
    const cellKey = `${workerId}-${rowIndex}`
    setCellValues(prev => ({ ...prev, [cellKey]: value }))
  }

  // Функция для обновления существующей услуги
  const handleUpdateService = async (serviceId: number, newAmount: string) => {
    const cleanAmount = cleanCurrencyValue(newAmount)
    const numericAmount = cleanAmount === '' ? NaN : Number(cleanAmount)
    if (cleanAmount === '' || Number.isNaN(numericAmount) || numericAmount < 0) return

    const formData = new FormData()
    formData.append('id', String(serviceId))
    formData.append('shiftId', String(shift.id))
    formData.append('amount', cleanAmount)
    start()
    try {
      await updateService(formData)
    } finally {
      stop()
    }
  }

  // Функции для обработки фокуса ячеек
  const handleCellFocus = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(cellKey)
    setTimeout(() => moveCaretToNumberEnd(cellKey), 0)
  }

  const handleCellBlur = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(null)

    const value = cellValues[cellKey]
    if (value) {
      const cleanValue = cleanCurrencyValue(value)
      const numeric = parseFloat(cleanValue)

      if (cleanValue && numeric > 0) {
        // Показываем выбор метода оплаты
        setMethodSelect({ workerId, rowIndex, amount: value })
        return
      }

      if (cleanValue === '' || numeric === 0) {
        setCellValues(prev => ({ ...prev, [cellKey]: cleanValue === '' ? '' : '0' }))
        return
      }
    }
  }

  const handleExistingServiceBlur = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(null)

    const value = cellValues[cellKey]
    const worker = selectedWorkers.find(w => w.id === workerId)
    const currentService = worker && servicesByWorker[worker.id] ? servicesByWorker[worker.id][rowIndex] : undefined

    if (!currentService) return

    if (value !== undefined) {
      const cleanValue = cleanCurrencyValue(value)

      // Пустое значение — удаляем услугу
      if (cleanValue === '') {
        const formData = new FormData()
        formData.append('id', String(currentService.id))
        formData.append('shiftId', String(shift.id))
        start()
        try {
          await deleteService(formData)
        } finally {
          stop()
        }
        // Очищаем локальное значение ячейки
        setCellValues(prev => ({ ...prev, [cellKey]: '' }))
        return
      }

      const numeric = Number(cleanValue)
      if (!Number.isNaN(numeric) && numeric >= 0) {
        // Разрешаем 0 и больше
        handleUpdateService(currentService.id, cleanValue)
        setCellValues(prev => ({ ...prev, [cellKey]: formatCurrency(numeric) }))
        return
      }

      // Если введено некорректное значение, возвращаем исходное
      setCellValues(prev => ({ ...prev, [cellKey]: formatCurrency(currentService.amount) }))
    }
  }


  return (
    <Card title="Услуги">
      <Table>
        <TableHead>
          <TableRow>
            {selectedWorkers.map(worker => (
              <TableHeader key={worker.id} className="text-center min-w-[120px] whitespace-nowrap relative">
                <div className="flex items-center justify-center">
                  <span>{worker.name}</span>
                  {!isShiftClosed && (
                    <span
                      onClick={() => handleRemoveWorker(worker.id)}
                      className="text-xl text-gray-400 absolute right-2 top-0 cursor-pointer hover:text-red-500"
                    >
                      ×
                    </span>
                  )}
                </div>
              </TableHeader>
            ))}
            {!isShiftClosed && (
              <TableHeader className="text-center min-w-[120px] whitespace-nowrap">
                <Select
                  value=""
                  onChange={(e) => handleWorkerSelect(e.target.value)}
                >
                  <option value="">Добавить мастера</option>
                  {workers
                    .filter(w => !selectedWorkers.some(sw => sw.id === w.id))
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))
                  }
                </Select>
              </TableHeader>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedWorkers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={1} className="text-center text-gray-500 py-8">
                Здесь пока нет мастеров
              </TableCell>
            </TableRow>
          ) : (
            Array.from({ length: maxRows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {selectedWorkers.map(worker => {
                  const workerServices = servicesByWorker[worker.id] || []
                  const service = workerServices[rowIndex]
                  const cellKey = `${worker.id}-${rowIndex}`

                  return (
                    <TableCell
                      key={worker.id}
                      className={`p-0 transition-all relative duration-200 min-w-[120px] whitespace-nowrap ${activeCell === `${worker.id}-${rowIndex}`
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : ''
                        }`}
                    >
                      {service ? (
                        <div className="group">
                          <Input
                            ref={(el) => {
                              inputRefs.current[`${worker.id}-${rowIndex}`] = el
                            }}
                            type="text"
                            noBorder
                            value={cellValues[`${worker.id}-${rowIndex}`] || formatCurrency(service.amount)}
                            onChange={(e) => {
                              if (!isShiftClosed) {
                                const cellKey = `${worker.id}-${rowIndex}`
                                setCellValues(prev => ({ ...prev, [cellKey]: e.target.value }))
                              }
                            }}
                            onMouseDown={(e) => handleCellMouseDown(worker.id, rowIndex, e)}
                            onFocus={() => handleCellFocus(worker.id, rowIndex)}
                            onMouseUp={() => moveCaretToNumberEnd(`${worker.id}-${rowIndex}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                  ; (e.currentTarget as HTMLInputElement).blur()
                              }
                            }}
                            onBlur={() => handleExistingServiceBlur(worker.id, rowIndex)}
                            className="w-full h-full border-0 focus:ring-0 focus:border-0 text-center outline-none"
                            disabled={isShiftClosed}
                          />
                          <span
                            className="hidden group-hover:block absolute right-1 top-0 text-lg p-1 text-gray-400 hover:text-red-500 cursor-pointer select-none"
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteService(service.id) }}
                            title="Удалить запись"
                          >
                            ×
                          </span>
                          <span
                            className={`absolute left-2 top-2 text-[10px] p-1 rounded cursor-pointer ${service.method === 'cash' ? 'bg-green-100 text-green-700' :
                              service.method === 'noncash' ? 'bg-blue-100 text-blue-700' :
                                service.method === 'transfer' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-purple-100 text-purple-700'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setMethodSelect({ workerId: worker.id, rowIndex, amount: String(service.amount), serviceId: service.id })
                            }}
                            title="Изменить способ оплаты"
                            role="button"
                            tabIndex={0}
                          >
                            {service.method === 'cash' ? 'Нал' :
                              service.method === 'noncash' ? 'Б/н' :
                                service.method === 'transfer' ? 'Перевод' : 'СБП'}
                          </span>
                        </div>
                      ) : (
                        !isShiftClosed && (
                          <Input
                            ref={(el) => {
                              inputRefs.current[`${worker.id}-${rowIndex}`] = el
                            }}
                            type="text"
                            placeholder="0 ₽"
                            noBorder
                            value={cellValues[cellKey] || ''}
                            onChange={(e) => handleCellChange(worker.id, rowIndex, e.target.value)}
                            onMouseDown={(e) => handleCellMouseDown(worker.id, rowIndex, e)}
                            onFocus={() => handleCellFocus(worker.id, rowIndex)}
                            onMouseUp={() => moveCaretToNumberEnd(`${worker.id}-${rowIndex}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                  ; (e.currentTarget as HTMLInputElement).blur()
                              }
                            }}
                            onBlur={() => handleCellBlur(worker.id, rowIndex)}
                            className="w-full h-full border-0 focus:ring-0 focus:border-0 text-center outline-none"
                          />
                        )
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
        <tfoot>
          <tr className="bg-gray-50">
            {selectedWorkers.map(worker => (
              <td key={worker.id} className="border border-gray-300 p-3 font-semibold text-gray-900 text-center min-w-[120px]">
                {formatCurrency(totalsByWorker[worker.id] || 0)}
              </td>
            ))}
          </tr>
        </tfoot>
      </Table>
      {methodSelect && (
        <div className="mt-2 p-3 border rounded-lg bg-white shadow-sm flex items-center gap-2">
          <span className="text-sm text-gray-700 mr-2">Способ оплаты:</span>
          <Button onClick={() => handleConfirmAddService('cash')} size="sm" className="bg-green-600 hover:bg-green-700">Нал</Button>
          <Button onClick={() => handleConfirmAddService('noncash')} size="sm" className="bg-blue-600 hover:bg-blue-700">Б/н</Button>
          <Button onClick={() => handleConfirmAddService('transfer')} size="sm" className="bg-yellow-600 hover:bg-yellow-700">Перевод</Button>
          <Button onClick={() => handleConfirmAddService('sbp')} size="sm" className="bg-purple-600 hover:bg-purple-700">СБП</Button>
          <Button onClick={handleCancelAddService} variant="secondary" size="sm">Отмена</Button>
          <span className="ml-auto text-sm text-gray-500">Сумма: {formatCurrency(cleanCurrencyValue(methodSelect.amount))}</span>
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <div className="border border-gray-300 rounded-lg px-4 py-2 bg-white font-semibold text-gray-900">
          <span className="mr-3">Общий итог:</span>
          <span className="font-mono">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </Card>
  )
}
