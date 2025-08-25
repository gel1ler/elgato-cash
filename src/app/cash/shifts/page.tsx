import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function getData() {
  const shifts = await prisma.shift.findMany({
    orderBy: { shiftDate: 'desc' },
    include: { admin: true }
  })
  const admins = await prisma.worker.findMany({ where: { role: 'admin', active: true }, orderBy: { name: 'asc' } })
  return { shifts, admins }
}

export default async function ShiftsPage() {
  const { shifts, admins } = await getData()
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Смены</h2>
      <form className="grid sm:grid-cols-4 gap-3" action={createShift}>
        <input type="date" name="shiftDate" defaultValue={today} className="border p-2 rounded" required />
        <select name="adminId" className="border p-2 rounded">
          <option value="">— админ —</option>
          {admins.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
        </select>
        <input type="number" step="0.01" min="0" name="openingCash" defaultValue={0} className="border p-2 rounded" />
        <button className="border rounded bg-black text-white px-3 py-2">Создать</button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border p-2">Дата</th>
            <th className="border p-2">Админ</th>
            <th className="border p-2">На начало</th>
            <th className="border p-2">На конец</th>
            <th className="border p-2"></th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(s => (
            <tr key={s.id}>
              <td className="border p-2">{new Date(s.shiftDate).toLocaleDateString('ru-RU')}</td>
              <td className="border p-2">{s.admin?.name ?? ''}</td>
              <td className="border p-2">{Number(s.openingCash).toFixed(2)}</td>
              <td className="border p-2">{s.closingCash == null ? '' : Number(s.closingCash).toFixed(2)}</td>
              <td className="border p-2"><a className="underline" href={`/cash/shifts/${s.id}`}>Открыть</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export async function createShift(formData: FormData) {
  'use server'
  const shiftDate = new Date(String(formData.get('shiftDate')))
  const adminIdRaw = String(formData.get('adminId') ?? '')
  const adminId = adminIdRaw ? Number(adminIdRaw) : null
  const openingCash = Number(String(formData.get('openingCash') ?? '0'))
  await prisma.shift.create({ data: { shiftDate, adminId, openingCash } })
  revalidatePath('/cash/shifts')
}