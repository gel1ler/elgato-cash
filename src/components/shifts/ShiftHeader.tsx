import { Card } from '../ui'

interface ShiftHeaderProps {
  shift: {
    id: number
    shiftDate: Date
    admin?: { name: string } | null
    openingCash: number
    closingCash: number | null
  }
}

export default function ShiftHeader({ shift }: ShiftHeaderProps) {
  const isShiftClosed = shift.closingCash !== null
  
  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Смена от {new Date(shift.shiftDate).toLocaleDateString('ru-RU')}
          </h1>
          <p className="text-gray-600 mt-1">
            Админ: {shift.admin?.name ?? 'Не назначен'} | 
            Начальная сумма: {shift.openingCash.toFixed(2)} ₽
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isShiftClosed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isShiftClosed ? 'Закрыта' : 'Открыта'}
          </span>
        </div>
      </div>
    </Card>
  )
}
