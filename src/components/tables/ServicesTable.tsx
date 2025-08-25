'use client'

import { addService, deleteService } from '@/app/api/shifts'
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Button, Input, Select } from '../ui'

interface Service {
  id: number
  worker: { name: string }
  service: string
  amount: number
  method: string
}

interface ServicesTableProps {
  shift: {
    id: number
    closingCash: number | null
  }
  services: Service[]
  workers: Array<{ id: number; name: string }>
}

export default function ServicesTable({ shift, services, workers }: ServicesTableProps) {
  const isShiftClosed = shift.closingCash !== null

  return (
    <Card title="Услуги">
      {!isShiftClosed && (
        <form className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-end gap-3 mb-6" action={addService}>
          <Select name="workerId" required>
            <option value="">Сотрудник</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
          <Input 
            name="service" 
            required 
            placeholder="Услуга" 
          />
          <Input 
            name="amount" 
            type="number" 
            step="0.01" 
            min="0.01" 
            required 
            placeholder="Сумма" 
            className="w-32" 
          />
          <Select name="method" required>
            <option value="">Метод</option>
            <option value="cash">Нал</option>
            <option value="noncash">Б/Н</option>
          </Select>
          <div>
            <input type="hidden" name="shiftId" value={shift.id} />
            <Button type="submit" variant="success">
              Добавить
            </Button>
          </div>
        </form>
      )}
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Сотрудник</TableHeader>
            <TableHeader>Услуга</TableHeader>
            <TableHeader>Сумма</TableHeader>
            <TableHeader>Метод</TableHeader>
            {!isShiftClosed && <TableHeader>Действия</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map(s => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.worker.name}</TableCell>
              <TableCell>{s.service}</TableCell>
              <TableCell className="font-mono">{s.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  s.method === 'cash' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {s.method === 'cash' ? 'Нал' : 'Б/Н'}
                </span>
              </TableCell>
              {!isShiftClosed && (
                <TableCell>
                  <form className="inline" action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="shiftId" value={shift.id} />
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      className="text-xs px-2 py-1"
                      title="Удалить услугу"
                    >
                      ×
                    </Button>
                  </form>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        <tfoot>
          <tr className="bg-blue-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900" colSpan={!isShiftClosed ? 4 : 3}>
              Итого
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono">
              {services.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}
