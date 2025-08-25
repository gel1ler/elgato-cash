import prisma from '@/lib/prisma'
import { CreateShiftForm, ShiftsTable } from '@/components'

async function getData() {
  const shifts = await prisma.shift.findMany({
    orderBy: { shiftDate: 'desc' },
    include: { admin: true }
  })
  const admins = await prisma.worker.findMany({ where: { role: 'admin', active: true }, orderBy: { name: 'asc' } })
  
  // Сериализуем данные для передачи в компоненты
  const serializedShifts = shifts.map(shift => ({
    id: shift.id,
    shiftDate: shift.shiftDate,
    admin: shift.admin,
    openingCash: Number(shift.openingCash),
    closingCash: shift.closingCash ? Number(shift.closingCash) : null,
    createdAt: shift.createdAt,
    adminId: shift.adminId
  }))
  
  return { shifts: serializedShifts, admins }
}

export default async function ShiftsPage() {
  const { shifts, admins } = await getData()
  const today = new Date().toISOString().slice(0, 10)
  
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <CreateShiftForm admins={admins} today={today} />
        <ShiftsTable shifts={shifts} />
      </div>
    </div>
  )
}