'use client'

import { Card, FormField, Input, Select, Button } from '../ui'

interface ReportsFilterFormProps {
  start: string
  end: string
}

export default function ReportsFilterForm({ start, end }: ReportsFilterFormProps) {
  return (
    <Card title="Фильтры отчета" className="mb-6">
      <form className="grid sm:grid-cols-4 gap-4">
        <FormField label="Дата с">
          <Input type="date" name="dateFrom" defaultValue={start} />
        </FormField>
        
        <FormField label="Дата по">
          <Input type="date" name="dateTo" defaultValue={end} />
        </FormField>
        
        <FormField label="Сотрудник">
          <Select name="workerId">
            <option value="">Все сотрудники</option>
            {/* Опции сотрудников будут добавлены динамически */}
          </Select>
        </FormField>
        
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Применить фильтры
          </Button>
        </div>
      </form>
    </Card>
  )
}
