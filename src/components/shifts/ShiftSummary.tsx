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
  // Добавляем данные о способах оплаты
  paymentMethods: {
    cash: number
    noncash: number
    transfer: number
    sbp: number
    certificate: number
  }
}

// Компонент для отображения статистики
function StatCard({ title, value, color, subtitle }: {
  title: string
  value: string
  color: string
  subtitle?: string
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
      )}
    </div>
  )
}

// Компонент для отображения итогов по способам оплаты
function PaymentMethodsSummary({ paymentMethods }: { paymentMethods: ShiftSummaryProps['paymentMethods'] }) {
  const totalCash = paymentMethods.cash
  const totalNonCash = paymentMethods.noncash + paymentMethods.transfer + paymentMethods.sbp

  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Итоги по способам оплаты</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Наличные"
          value={`${totalCash.toFixed(2)} ₽`}
          color="text-green-600"
          subtitle={`${((totalCash / (totalCash + totalNonCash)) * 100).toFixed(1)}%`}
        />

        <StatCard
          title="Безналичные"
          value={`${paymentMethods.noncash.toFixed(2)} ₽`}
          color="text-blue-600"
          subtitle={`${((paymentMethods.noncash / (totalCash + totalNonCash)) * 100).toFixed(1)}%`}
        />

        <StatCard
          title="Переводы"
          value={`${paymentMethods.transfer.toFixed(2)} ₽`}
          color="text-yellow-600"
          subtitle={`${((paymentMethods.transfer / (totalCash + totalNonCash)) * 100).toFixed(1)}%`}
        />

        <StatCard
          title="СБП"
          value={`${paymentMethods.sbp.toFixed(2)} ₽`}
          color="text-purple-600"
          subtitle={`${((paymentMethods.sbp / (totalCash + totalNonCash)) * 100).toFixed(1)}%`}
        />

        <StatCard
          title="Сертификаты"
          value={`${paymentMethods.certificate.toFixed(2)} ₽`}
          color="text-gray-600"
        />
      </div>
    </div>
  )
}

export default function ShiftSummary({ shift, totalSales, totalServices, totalPayouts, paymentMethods }: ShiftSummaryProps) {
  const isShiftClosed = shift.closingCash !== null
  const totalIncome = totalSales + totalServices
  const netProfit = totalIncome - totalPayouts
  const expectedCash = shift.openingCash + netProfit

  return (
    <Card title="Итоги смены" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Начальная сумма"
          value={`${shift.openingCash.toFixed(2)} ₽`}
          color="text-blue-600"
        />

        <StatCard
          title="Общий доход"
          value={`${totalIncome.toFixed(2)} ₽`}
          color="text-green-600"
        />

        <StatCard
          title="Выплаты"
          value={`${totalPayouts.toFixed(2)} ₽`}
          color="text-red-600"
        />

        <StatCard
          title={isShiftClosed ? 'Фактическая сумма' : 'Ожидаемая сумма'}
          value={`${isShiftClosed ? shift.closingCash!.toFixed(2) : expectedCash.toFixed(2)} ₽`}
          color={isShiftClosed ? 'text-purple-600' : 'text-orange-600'}
        />
      </div>

      {/* Итоги по способам оплаты */}
      <PaymentMethodsSummary paymentMethods={paymentMethods} />

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
