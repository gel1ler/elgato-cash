'use client'

import { toggleWorker, deleteWorker, updateWorkerSalaryRate } from '@/app/api/workers'
import { Card, Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui'
import { Button, Badge } from '../ui'

interface Worker {
  id: number
  name: string
  role: string
  category?: string | null
  active: boolean
  salaryRate?: number
}

interface WorkersTableProps {
  workers: Worker[]
}

export default function WorkersTable({ workers }: WorkersTableProps) {
  return (
    <Card title="Список сотрудников">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Имя</TableHeader>
            <TableHeader>Роль</TableHeader>
            <TableHeader>Категория</TableHeader>
            <TableHeader>Статус</TableHeader>
            <TableHeader>Коэфф. ЗП</TableHeader>
            <TableHeader>Действия</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {workers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                Здесь пока нет сотрудников
              </TableCell>
            </TableRow>
          ) : (
            workers.map(w => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>
                  <Badge variant={w.role === 'master' ? 'primary' : 'info'}>
                    {w.role === 'master' ? 'Мастер' : 'Админ'}
                  </Badge>
                </TableCell>
                <TableCell>{w.category ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={w.active ? 'success' : 'secondary'}>
                    {w.active ? 'Активен' : 'Скрыт'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form className="inline-flex items-center space-x-2" action={updateWorkerSalaryRate}>
                    <input type="hidden" name="id" value={w.id} />
                    <input
                      name="salaryRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      defaultValue={w.salaryRate ?? 0.5}
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      aria-label="Коэффициент ЗП"
                    />
                    <Button type="submit" size="sm" variant="secondary">Сохранить</Button>
                  </form>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <form className="inline" action={toggleWorker}>
                      <input type="hidden" name="id" value={w.id} />
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="sm"
                        className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      >
                        {w.active ? 'Скрыть' : 'Включить'}
                      </Button>
                    </form>
                    <form className="inline" action={deleteWorker}>
                      <input type="hidden" name="id" value={w.id} />
                      <Button 
                        type="submit" 
                        variant="danger" 
                        size="sm"
                        className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      >
                        Удалить
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
