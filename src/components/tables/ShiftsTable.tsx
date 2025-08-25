import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'

interface Shift {
  id: number
  shiftDate: Date
  admin?: { name: string } | null
  openingCash: number
  closingCash: number | null
}

interface ShiftsTableProps {
  shifts: Shift[]
}

export default function ShiftsTable({ shifts }: ShiftsTableProps) {
  return (
    <Card title="Список смен">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Дата</TableHeader>
            <TableHeader>Админ</TableHeader>
            <TableHeader>На начало</TableHeader>
            <TableHeader>На конец</TableHeader>
            <TableHeader>Действия</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {shifts.map(s => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">
                {new Date(s.shiftDate).toLocaleDateString('ru-RU')}
              </TableCell>
              <TableCell>{s.admin?.name ?? '—'}</TableCell>
              <TableCell className="font-mono">{s.openingCash.toFixed(2)}</TableCell>
              <TableCell className="font-mono">
                {s.closingCash == null ? (
                  <span className="text-orange-600 font-medium">Открыта</span>
                ) : (
                  s.closingCash.toFixed(2)
                )}
              </TableCell>
              <TableCell>
                <a 
                  href={`/shifts/${s.id}`}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Открыть
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
