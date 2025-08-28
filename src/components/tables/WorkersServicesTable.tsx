import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Badge } from '../ui'

interface WorkersServicesTableProps {
  workersServices: Map<number, { name: string; cash: number; noncash: number }>
  payoutsByWorker?: Map<number, number>
}

export default function WorkersServicesTable({ workersServices, payoutsByWorker }: WorkersServicesTableProps) {
  return (
    <Card title="Услуги по сотрудникам">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Сотрудник</TableHeader>
            <TableHeader>Роль</TableHeader>
            <TableHeader>Услуги</TableHeader>
            <TableHeader>Выплаты</TableHeader>
            <TableHeader>Чистый доход</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {workersServices.size === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                Здесь пока нет данных об услугах
              </TableCell>
            </TableRow>
          ) : (
            Array.from(workersServices.entries()).map(([workerId, data]) => {
              const payouts = payoutsByWorker?.get(workerId) ?? 0
              const services = data.cash + data.noncash
              const net = services - payouts
              return (
                <TableRow key={workerId}>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell>
                    <Badge variant="primary">Мастер</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-green-600">{services.toFixed(2)} ₽</TableCell>
                  <TableCell className="font-mono text-red-600">{payouts.toFixed(2)} ₽</TableCell>
                  <TableCell className={`font-mono font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-700'}`}>
                    {net.toFixed(2)} ₽
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900" colSpan={2}>
              Итого
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-green-600">
              {Array.from(workersServices.values()).reduce((sum, data) => sum + data.cash + data.noncash, 0).toFixed(2)} ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-red-600">
              {Array.from(payoutsByWorker?.values() ?? []).reduce((sum, p) => sum + p, 0).toFixed(2)} ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono">
              {(() => {
                const totalServices = Array.from(workersServices.values()).reduce((sum, data) => sum + data.cash + data.noncash, 0)
                const totalPayouts = Array.from(payoutsByWorker?.values() ?? []).reduce((sum, p) => sum + p, 0)
                return (totalServices - totalPayouts).toFixed(2)
              })()} ₽
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}
