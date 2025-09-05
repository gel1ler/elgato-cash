import db from '@/lib/db/client'
import { shifts as shiftsTbl, workers as workersTbl } from '@/lib/db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import { CreateShiftForm, ShiftsTable } from '@/components'

async function getData() {
  const list = await db.query.shifts.findMany({
    orderBy: [desc(shiftsTbl.shiftDate)],
    with: { admin: true },
  })
  const adminsList = await db.query.workers.findMany({
    where: (t, { and, eq }) => and(eq(t.role, 'admin'), eq(t.active, true)),
    orderBy: [asc(workersTbl.name)]
  })

  // Сериализуем данные для передачи в компоненты
  const serializedShifts = list.map(shift => ({
    id: shift.id,
    shiftDate: shift.shiftDate,
    admin: shift.admin ? {
      id: shift.admin.id,
      name: shift.admin.name,
      role: shift.admin.role,
      category: shift.admin.category,
      active: shift.admin.active,
      salaryRate: Number(shift.admin.salaryRate)
    } : null,
    openingCash: Number(shift.openingCash),
    closingCash: shift.closingCash ? Number(shift.closingCash) : null,
    createdAt: shift.createdAt,
    adminId: shift.adminId
  }))

  const serializedAdmins = adminsList.map(admin => ({
    id: admin.id,
    name: admin.name,
    role: admin.role,
    category: admin.category,
    active: admin.active,
    salaryRate: Number(admin.salaryRate)
  }))

  return { shifts: serializedShifts, admins: serializedAdmins }
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