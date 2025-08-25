'use client'

import { createWorker } from '@/app/api/workers'
import { Card, FormField, Input, Select, Button } from '../ui'

export default function CreateWorkerForm() {
  return (
    <Card title="Сотрудники" className="mb-6">
      <form className="grid sm:grid-cols-4 gap-4" action={createWorker}>
        <FormField label="Имя" required>
          <Input 
            name="name" 
            required 
            placeholder="Имя сотрудника" 
          />
        </FormField>
        
        <FormField label="Роль">
          <Select name="role">
            <option value="master">Мастер</option>
            <option value="admin">Админ</option>
          </Select>
        </FormField>
        
        <FormField label="Категория">
          <Input 
            name="category" 
            placeholder="Категория (для мастера)" 
          />
        </FormField>
        
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Добавить
          </Button>
        </div>
      </form>
    </Card>
  )
}
