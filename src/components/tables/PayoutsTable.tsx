'use client'

import { addPayout, deletePayout } from '@/app/api/shifts'
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Button, Input, Select, SubmitButton } from '../ui'

interface Payout {
  id: number
  worker: { name: string } | null
  amount: number
  reason: string
}

interface PayoutsTableProps {
  shift: {
    id: number
    closingCash: number | null
  }
  payouts: Payout[]
  workers: Array<{ id: number; name: string }>
}

export default function PayoutsTable({ shift, payouts, workers }: PayoutsTableProps) {
  const isShiftClosed = shift.closingCash !== null

  return (
    <Card title="Выплаты">
      {!isShiftClosed && (
        <form className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-3 mb-6" action={addPayout}>
          <Select name="workerId" required>
            <option value="">Сотрудник</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="Сумма"
            className="w-32"
          />
          <Input
            name="reason"
            required
            placeholder="Причина"
          />
          <div>
            <input type="hidden" name="shiftId" value={shift.id} />
            <SubmitButton variant="success">Добавить</SubmitButton>
          </div>
        </form>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Сотрудник</TableHeader>
            <TableHeader>Сумма</TableHeader>
            <TableHeader>Причина</TableHeader>
            {!isShiftClosed && <TableHeader>Действия</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {payouts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={!isShiftClosed ? 4 : 3} className="text-center text-gray-500 py-8">
                Здесь пока нет выплат
              </TableCell>
            </TableRow>
          ) : (
            payouts.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.worker?.name ?? 'Неизвестно'}</TableCell>
                <TableCell className="font-mono text-red-600">{p.amount.toFixed(2)}</TableCell>
                <TableCell>{p.reason}</TableCell>
                {!isShiftClosed && (
                  <TableCell>
                    <form className="inline" action={deletePayout}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="shiftId" value={shift.id} />
                      <SubmitButton variant="danger" size="sm" className="text-xs px-2 py-1" title="Удалить выплату">×</SubmitButton>
                    </form>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        <tfoot>
          <tr className="bg-red-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900" colSpan={!isShiftClosed ? 3 : 2}>
              Итого
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono text-red-600">
              {payouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}
