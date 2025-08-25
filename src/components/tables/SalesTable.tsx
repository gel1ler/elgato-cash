'use client'

import { addSale, deleteSale } from '@/app/api/shifts'
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Button, Badge, Input, Select } from '../ui'

interface ProductSale {
  id: number
  product: string
  method: string
  amount: number
}

interface SalesTableProps {
  shift: {
    id: number
    closingCash: number | null
  }
  productSales: ProductSale[]
}

export default function SalesTable({ shift, productSales }: SalesTableProps) {
  const isShiftClosed = shift.closingCash !== null

  return (
    <Card title="Продажи">
      {!isShiftClosed && (
        <form className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-3 mb-6" action={addSale}>
          <Input 
            name="product" 
            required 
            placeholder="Товар" 
          />
          <Select name="method" required>
            <option value="">Метод</option>
            <option value="cash">Нал</option>
            <option value="noncash">Б/Н</option>
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
            <TableHeader>Товар</TableHeader>
            <TableHeader>Метод</TableHeader>
            <TableHeader>Сумма</TableHeader>
            {!isShiftClosed && <TableHeader>Действия</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {productSales.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.product}</TableCell>
              <TableCell>
                <Badge variant={s.method === 'cash' ? 'success' : 'info'}>
                  {s.method === 'cash' ? 'Нал' : 'Б/Н'}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{s.amount.toFixed(2)}</TableCell>
              {!isShiftClosed && (
                <TableCell>
                  <form className="inline" action={deleteSale}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="shiftId" value={shift.id} />
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      className="text-xs px-2 py-1"
                      title="Удалить продажу"
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
          <tr className="bg-green-50">
            <td className="border border-gray-300 p-3 font-semibold text-gray-900" colSpan={!isShiftClosed ? 3 : 2}>
              Итого
            </td>
            <td className="border border-gray-300 p-3 font-semibold text-gray-900 font-mono">
              {productSales.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </Table>
    </Card>
  )
}
