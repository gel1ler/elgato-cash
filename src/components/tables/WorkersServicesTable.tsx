import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Badge } from '../ui'

interface WorkersServicesTableProps {
  workersServices: Map<number, { name: string; cash: number; noncash: number }>
}

export default function WorkersServicesTable({ workersServices }: WorkersServicesTableProps) {
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
          {Array.from(workersServices.entries()).map(([workerId, data]) => (
            <TableRow key={workerId}>
              <TableCell className="font-medium">{data.name}</TableCell>
              <TableCell>
                <Badge variant="primary">Мастер</Badge>
              </TableCell>
              <TableCell className="font-mono text-green-600">{(data.cash + data.noncash).toFixed(2)} ₽</TableCell>
              <TableCell className="font-mono text-red-600">0.00 ₽</TableCell>
              <TableCell className="font-mono font-semibold text-green-600">
                {(data.cash + data.noncash).toFixed(2)} ₽
              </TableCell>
            </TableRow>
          ))}
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
              0.00 ₽
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono">
              {Array.from(workersServices.values()).reduce((sum, data) => sum + data.cash + data.noncash, 0).toFixed(2)} ₽
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}
