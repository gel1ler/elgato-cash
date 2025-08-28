import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Badge } from '../ui'

interface PayrollRow {
  workerId: number
  name: string
  role: string
  salaryRate: number
  servicesTotal: number
  payoutsTotal: number
}

interface PayrollTableProps {
  rows: PayrollRow[]
}

export default function PayrollTable({ rows }: PayrollTableProps) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.services += r.servicesTotal
      acc.payouts += r.payoutsTotal
      acc.salary += r.servicesTotal * r.salaryRate
      acc.net += r.servicesTotal * r.salaryRate - r.payoutsTotal
      return acc
    },
    { services: 0, payouts: 0, salary: 0, net: 0 }
  )

  return (
    <Card title="Зарплаты по сотрудникам">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Сотрудник</TableHeader>
            <TableHeader>Роль</TableHeader>
            <TableHeader>Коэфф.</TableHeader>
            <TableHeader>Услуги</TableHeader>
            <TableHeader>Начислено</TableHeader>
            <TableHeader>Выплаты</TableHeader>
            <TableHeader>Итого к выплате</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                Здесь пока нет данных
              </TableCell>
            </TableRow>
          ) : (
            rows.map(r => {
              const accrued = r.servicesTotal * r.salaryRate
              const net = accrued - r.payoutsTotal
              return (
                <TableRow key={r.workerId}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    <Badge variant={r.role === 'master' ? 'primary' : 'info'}>
                      {r.role === "master" ? "Мастер" : "Админ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{r.salaryRate.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-blue-600">{r.servicesTotal.toFixed(2)} ₽</TableCell>
                  <TableCell className="font-mono text-purple-700">{accrued.toFixed(2)} ₽</TableCell>
                  <TableCell className="font-mono text-red-600">{r.payoutsTotal.toFixed(2)} ₽</TableCell>
                  <TableCell className={`font-mono font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-700'}`}>{net.toFixed(2)} ₽</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900" colSpan={3}>
              Итого
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-blue-600">
              {totals.services.toFixed(2)} ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-purple-700">
              {totals.salary.toFixed(2)} ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-red-600">
              {totals.payouts.toFixed(2)} ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono">
              {(totals.salary - totals.payouts).toFixed(2)} ₽
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}


