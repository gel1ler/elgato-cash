'use client'

import { Card, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Input, Button } from '../ui'
import { Select } from '../ui'
import { useServicesTable, useCellInput, useMethodSelect } from '@/hooks'
import type { Service, Worker, Shift } from '@/hooks'
import { PaymentMethod } from '@/lib/paymentMethods'
import { formatCurrency, cleanCurrencyValue } from '@/lib/currency'
import { PAYMENT_METHODS } from '@/lib/paymentMethods'
import { useState } from 'react'

interface ServicesTableProps {
  shift: Shift
  services: Service[]
  workers: Worker[]
  tips?: Array<{ workerId: number; amount: number }>
}

export default function ServicesTable({ shift, services, workers, tips = [] }: ServicesTableProps) {
  const [tipOverlayWorkerId, setTipOverlayWorkerId] = useState<number | null>(null)
  const [tipOverlayValue, setTipOverlayValue] = useState<string>('')

  // Основная логика таблицы услуг
  const {
    selectedWorkers,
    servicesByWorker,
    maxRows,
    totalsByWorker,
    tipsByWorker,
    salaryByWorker,
    isShiftClosed,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    handleWorkerSelect,
    handleRemoveWorker,
    handleSetTip,
    handleDeleteTip,
  } = useServicesTable({ services, workers, shift, tips })

  // Логика ввода в ячейки
  const {
    activeCell,
    inputRefs,
    handleCellMouseDown,
    handleCellFocus,
    handleCellBlur,
    handleExistingServiceBlur,
    moveCaretToNumberEnd,
    clearCellValue,
  } = useCellInput()

  // Логика выбора способа оплаты
  const {
    methodSelect,
    showMethodSelect,
    hideMethodSelect,
    getMethodLabel,
    getMethodClassName,
    getMethodBadgeClassName,
  } = useMethodSelect()

  // Обработка подтверждения добавления услуги
  const handleConfirmAddService = async (method: PaymentMethod) => {
    console.log('handleConfirmAddService', method)
    if (!methodSelect) return
    const { workerId, rowIndex, amount, serviceId } = methodSelect

    if (serviceId) {
      // Обновление существующей услуги
      await handleUpdateService(serviceId, amount, method)
    } else {
      // Добавление новой услуги
      await handleAddService(workerId, amount, method)
    }

    console.log('clearCellValue', workerId, rowIndex)

    hideMethodSelect()
    clearCellValue(workerId, rowIndex)
  }

  // Обработка blur для новых ячеек
  const handleNewCellBlur = (workerId: number, rowIndex: number) => {
    const result = handleCellBlur(workerId, rowIndex)
    if (result) {
      showMethodSelect(result.workerId, result.rowIndex, result.amount)
    }
  }

  // Обработка blur для существующих услуг
  const handleExistingCellBlur = (workerId: number, rowIndex: number) => {
    const worker = selectedWorkers.find(w => w.id === workerId)
    const currentService = worker && servicesByWorker[worker.id] ? servicesByWorker[worker.id][rowIndex] : undefined

    if (currentService) {
      handleExistingServiceBlur(
        workerId,
        rowIndex,
        currentService,
        handleUpdateService,
        handleDeleteService
      )
    }
  }

  // Компонент ячейки услуги
  const ServiceCell = ({ service, workerId, rowIndex }: { service: Service; workerId: number; rowIndex: number }) => {
    const cellKey = `${workerId}-${rowIndex}`

    return (
      <div className="group">
        <Input
          ref={(el) => { inputRefs.current[cellKey] = el }}
          type="text"
          noBorder
          defaultValue={formatCurrency(service.amount)}
          onMouseDown={(e) => handleCellMouseDown(workerId, rowIndex, e)}
          onFocus={() => handleCellFocus(workerId, rowIndex)}
          onMouseUp={() => moveCaretToNumberEnd(cellKey)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
                ; (e.currentTarget as HTMLInputElement).blur()
            }
          }}
          onBlur={() => handleExistingCellBlur(workerId, rowIndex)}
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
          className={`absolute left-2 top-2 text-[10px] p-1 rounded cursor-pointer ${getMethodBadgeClassName(service.method as PaymentMethod)}`}
          onClick={(e) => {
            e.stopPropagation()
            showMethodSelect(workerId, rowIndex, String(service.amount), service.id)
          }}
          title="Изменить способ оплаты"
          role="button"
          tabIndex={0}
        >
          {getMethodLabel(service.method as PaymentMethod)}
        </span>
      </div>
    )
  }

  // Компонент пустой ячейки
  const EmptyCell = ({ workerId, rowIndex }: { workerId: number; rowIndex: number }) => {
    const cellKey = `${workerId}-${rowIndex}`

    if (isShiftClosed) return null

    return (
      <Input
        ref={(el) => { inputRefs.current[cellKey] = el }}
        type="text"
        placeholder="0 ₽"
        noBorder
        defaultValue={''}
        onMouseDown={(e) => handleCellMouseDown(workerId, rowIndex, e)}
        onFocus={() => handleCellFocus(workerId, rowIndex)}
        onMouseUp={() => moveCaretToNumberEnd(cellKey)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
              ; (e.currentTarget as HTMLInputElement).blur()
          }
        }}
        onBlur={() => handleNewCellBlur(workerId, rowIndex)}
        className="w-full h-full border-0 focus:ring-0 focus:border-0 text-center outline-none"
      />
    )
  }

  // Компонент выбора метода оплаты
  const MethodSelector = () => {
    if (!methodSelect) return null

    return (
      <div
        className={`
          p-3 rounded-lg bg-white shadow-sm flex flex-col items-center gap-2
          fixed top-1/2 right-10 -translate-y-1/2
      `}
      >
        <span className="text-sm text-gray-700 mr-2">Способ оплаты:</span>
        {PAYMENT_METHODS.map(method => (
          <Button
            key={method}
            onClick={() => handleConfirmAddService(method)}
            size="sm"
            className={getMethodClassName(method)}
          >
            {getMethodLabel(method)}
          </Button>
        ))}
        <Button onClick={hideMethodSelect} variant="secondary" size="sm">Отмена</Button>
      </div>
    )
  }

  return (
    <Card title="Услуги">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader className="min-w-[60px] whitespace-nowrap"></TableHeader>
            {selectedWorkers.map(worker => (
              <TableHeader key={worker.id} className="text-center min-w-[60px] whitespace-nowrap relative">
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
              <TableHeader className="text-center min-w-[60px] whitespace-nowrap">
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
              <TableCell colSpan={selectedWorkers.length + (isShiftClosed ? 0 : 1) + 1} className="text-center text-gray-500 py-8">
                Здесь пока нет мастеров
              </TableCell>
            </TableRow>
          ) : (
            Array.from({ length: maxRows }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {rowIndex === 0 && (
                  <TableCell rowSpan={maxRows} className="font-semibold text-gray-900 text-left align-middle min-w-[60px]">
                    Услуги
                  </TableCell>
                )}
                {selectedWorkers.map(worker => {
                  const workerServices = servicesByWorker[worker.id] || []
                  const service = workerServices[rowIndex]
                  const cellKey = `${worker.id}-${rowIndex}`

                  return (
                    <TableCell
                      key={worker.id}
                      className={`p-0 transition-all relative duration-200 min-w-[60px] whitespace-nowrap ${activeCell === cellKey ? 'ring-2 ring-blue-500 border-blue-500' : ''
                        }`}
                    >
                      {service ? (
                        <ServiceCell service={service} workerId={worker.id} rowIndex={rowIndex} />
                      ) : (
                        <EmptyCell workerId={worker.id} rowIndex={rowIndex} />
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
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 text-left min-w-[60px]">
              Итого услуг
            </td>
            {selectedWorkers.map(worker => (
              <td key={worker.id} className="border border-gray-300 p-3 font-semibold text-gray-900 text-center min-w-[60px]">
                {formatCurrency(totalsByWorker[worker.id] || 0)}
              </td>
            ))}
          </tr>
          {!isShiftClosed && (
            <tr className="bg-yellow-50">
              <td className="border border-gray-300 p-3 font-semibold text-gray-900 text-left min-w-[60px]">
                Чай
              </td>
              {selectedWorkers.map(worker => {
                const currentTip = tipsByWorker[worker.id] || 0
                const isOpen = tipOverlayWorkerId === worker.id
                return (
                  <td key={worker.id} className="border border-gray-300 p-2 text-center min-w-[60px]">
                    <div className="relative flex items-center justify-center gap-2">
                      <Input
                        type="text"
                        noBorder
                        placeholder="Чай ₽"
                        key={`tip-${worker.id}-${currentTip}`}
                        defaultValue={currentTip ? formatCurrency(currentTip) : ''}
                        onBlur={(e) => handleSetTip(worker.id, e.currentTarget.value)}
                        className="w-full h-full border-0 focus:ring-0 focus:border-0 text-center outline-none"
                        disabled={isShiftClosed}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setTipOverlayWorkerId(worker.id)
                          setTipOverlayValue('')
                        }}
                        title="Добавить к чаю"
                      >
                        +
                      </Button>

                      {isOpen && (
                        <div
                          className="absolute z-10 right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-md p-2 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            type="text"
                            placeholder="+ ₽"
                            value={tipOverlayValue}
                            onChange={(e) => setTipOverlayValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const deltaStr = cleanCurrencyValue(tipOverlayValue)
                                const delta = deltaStr ? Number(deltaStr) : 0
                                if (delta > 0) {
                                  const next = (currentTip || 0) + delta
                                  handleSetTip(worker.id, String(next))
                                }
                                setTipOverlayWorkerId(null)
                                setTipOverlayValue('')
                              } else if (e.key === 'Escape') {
                                setTipOverlayWorkerId(null)
                                setTipOverlayValue('')
                              }
                            }}
                            className="w-24"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              const deltaStr = cleanCurrencyValue(tipOverlayValue)
                              const delta = deltaStr ? Number(deltaStr) : 0
                              if (delta > 0) {
                                const next = (currentTip || 0) + delta
                                handleSetTip(worker.id, String(next))
                              }
                              setTipOverlayWorkerId(null)
                              setTipOverlayValue('')
                            }}
                          >
                            OK
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setTipOverlayWorkerId(null)
                              setTipOverlayValue('')
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          )}
          <tr className="bg-green-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 text-left min-w-[60px]">
              ЗП
            </td>
            {selectedWorkers.map(worker => (
              <td key={worker.id} className="border border-gray-300 p-3 font-semibold text-gray-900 text-center min-w-[60px]">
                {formatCurrency(salaryByWorker[worker.id] || 0)}
              </td>
            ))}
          </tr>
        </tfoot>
      </Table>
      <MethodSelector />
    </Card>
  )
}
