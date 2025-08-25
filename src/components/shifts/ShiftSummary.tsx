import { Card } from '../ui'

interface ShiftSummaryProps {
  shift: {
    id: number
    openingCash: number
    closingCash: number | null
  }
  totalSales: number
  totalServices: number
  totalPayouts: number
}

export default function ShiftSummary({ shift, totalSales, totalServices, totalPayouts }: ShiftSummaryProps) {
  const isShiftClosed = shift.closingCash !== null
  const totalIncome = totalSales + totalServices
  const netProfit = totalIncome - totalPayouts
  const expectedCash = shift.openingCash + netProfit

  return (
    <Card title="Итоги смены" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Начальная сумма</div>
          <div className="text-2xl font-bold text-blue-600">{shift.openingCash.toFixed(2)} ₽</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Общий доход</div>
          <div className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} ₽</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">Выплаты</div>
          <div className="text-2xl font-bold text-red-600">{totalPayouts.toFixed(2)} ₽</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {isShiftClosed ? 'Фактическая сумма' : 'Ожидаемая сумма'}
          </div>
          <div className={`text-2xl font-bold ${isShiftClosed ? 'text-purple-600' : 'text-orange-600'}`}>
            {isShiftClosed ? shift.closingCash!.toFixed(2) : expectedCash.toFixed(2)} ₽
          </div>
        </div>
      </div>
      
      {!isShiftClosed && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-orange-800 text-sm">
            <strong>Ожидаемая сумма в кассе:</strong> {expectedCash.toFixed(2)} ₽
          </div>
        </div>
      )}
    </Card>
  )
}
