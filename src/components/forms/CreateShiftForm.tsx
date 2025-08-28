'use client'

import { createShift } from '@/app/api/shifts'
import { Card, FormField, Input, Select, SubmitButton } from '../ui'

interface CreateShiftFormProps {
  admins: Array<{ id: number; name: string }>
  today: string
}

export default function CreateShiftForm({ admins, today }: CreateShiftFormProps) {
  return (
    <Card title="Смены" className="mb-6">
      <form className="grid sm:grid-cols-4 gap-4" action={createShift}>
        <FormField label="Дата" required>
          <Input 
            type="date" 
            name="shiftDate" 
            defaultValue={today} 
            required 
          />
        </FormField>
        
        <FormField label="Админ">
          <Select name="adminId">
            <option value="">— админ —</option>
            {admins.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </FormField>
        
        <FormField label="На начало">
          <Input 
            type="number" 
            step="0.01" 
            min="0" 
            name="openingCash" 
            defaultValue={0} 
          />
        </FormField>
        
        <div className="flex items-end">
          <SubmitButton className="w-full">
            Создать смену
          </SubmitButton>
        </div>
      </form>
    </Card>
  )
}
