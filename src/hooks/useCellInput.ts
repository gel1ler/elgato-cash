import { useState, useRef } from 'react'
import { cleanCurrencyValue, formatCurrency, isValidAmount } from '@/lib/currency'
import { type PaymentMethod } from '@/lib/paymentMethods'

export interface CellInputState {
  activeCell: string | null
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
}

export const useCellInput = () => {
  // Состояние только для активной ячейки (для подсветки)
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
      input.setSelectionRange(caretPos, caretPos)
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

  // Ввод стал неконтролируемым — значение читаем напрямую из input через ref при blur/focus

  const handleCellFocus = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(cellKey)
    setTimeout(() => moveCaretToNumberEnd(cellKey), 0)
  }

  const handleCellBlur = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(null)

    const input = inputRefs.current[cellKey]
    const rawValue = input ? input.value : ''
    if (rawValue !== undefined) {
      const cleanValue = cleanCurrencyValue(rawValue)
      const numeric = parseFloat(cleanValue)

      if (cleanValue && numeric > 0) {
        return { workerId, rowIndex, amount: rawValue }
      }

      if (cleanValue === '' || numeric === 0) {
        if (input) input.value = cleanValue === '' ? '' : '0'
        return null
      }
    }
    return null
  }

  const handleExistingServiceBlur = async (
    workerId: number,
    rowIndex: number,
    currentService: { id: number; amount: number },
    onUpdateService: (serviceId: number, amount: string, method?: PaymentMethod) => Promise<void>,
    onDeleteService: (serviceId: number) => Promise<void>
  ) => {
    const cellKey = `${workerId}-${rowIndex}`
    setActiveCell(null)

    const input = inputRefs.current[cellKey]
    const value = input ? input.value : ''

    if (value !== undefined) {
      const cleanValue = cleanCurrencyValue(value)

      // Пустое значение — удаляем услугу
      if (cleanValue === '') {
        await onDeleteService(currentService.id)
        if (input) input.value = ''
        return
      }

      const numeric = Number(cleanValue)
      if (!Number.isNaN(numeric) && numeric >= 0) {
        await onUpdateService(currentService.id, cleanValue)
        if (input) input.value = formatCurrency(numeric)
        return
      }

      // Если введено некорректное значение, возвращаем исходное
      if (input) input.value = formatCurrency(currentService.amount)
    }
  }

  const clearCellValue = (workerId: number, rowIndex: number) => {
    const cellKey = `${workerId}-${rowIndex}`
    const input = inputRefs.current[cellKey]
    if (input) input.value = ''
  }

  // Значения теперь читаются напрямую из inputRefs.current[key].value

  return {
    // Состояние
    activeCell,
    inputRefs,

    // Методы
    handleCellMouseDown,
    handleCellFocus,
    handleCellBlur,
    handleExistingServiceBlur,
    moveCaretToNumberEnd,
    clearCellValue,
  }
}
