'use client'

import { createWorker } from '@/app/api/workers'
import { Card, FormField, Input, Select, SubmitButton } from '../ui'

export default function CreateWorkerForm() {
  return (
    <Card title="Сотрудники" className="mb-6">
      <form className="grid sm:grid-cols-5 gap-4" action={createWorker}>
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

        <FormField label="Коэффициент ЗП">
          <Input
            name="salaryRate"
            type="number"
            step="0.01"
            min="0"
            max="1"
            placeholder="0.50"
          />
        </FormField>

        <div className="flex items-end">
          <SubmitButton className="w-full">
            Добавить
          </SubmitButton>
        </div>
      </form>
    </Card>
  )
}
