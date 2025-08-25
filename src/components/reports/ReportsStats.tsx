import { Card } from '../ui'

interface ReportsStatsProps {
  totalSales: number
  totalServices: number
  totalPayouts: number
}

export default function ReportsStats({ totalSales, totalServices, totalPayouts }: ReportsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalSales.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Общие продажи</div>
        </div>
      </Card>
      
      <Card>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalServices.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Общие услуги</div>
        </div>
      </Card>
      
      <Card>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{totalPayouts.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Общие выплаты</div>
        </div>
      </Card>
      
              <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(totalSales + totalServices - totalPayouts).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Чистая прибыль</div>
          </div>
        </Card>
    </div>
  )
}
