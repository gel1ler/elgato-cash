import prisma from '@/lib/prisma'

async function getWorkers() {
  return prisma.worker.findMany({ orderBy: [{ active: 'desc' }, { role: 'asc' }, { name: 'asc' }] })
}

export default async function WorkersPage() {
  const workers = await getWorkers()
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Сотрудники</h2>
      <form className="grid sm:grid-cols-4 gap-3" action={createWorker}>
        <input name="name" required placeholder="Имя" className="border p-2 rounded" />
        <select name="role" className="border p-2 rounded">
          <option value="master">Мастер</option>
          <option value="admin">Админ</option>
        </select>
        <input name="category" placeholder="Категория (для мастера)" className="border p-2 rounded" />
        <button className="border rounded bg-black text-white px-3 py-2">Добавить</button>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border p-2">Имя</th>
            <th className="border p-2">Роль</th>
            <th className="border p-2">Категория</th>
            <th className="border p-2">Статус</th>
            <th className="border p-2"></th>
          </tr>
        </thead>
        <tbody>
          {workers.map(w => (
            <tr key={w.id}>
              <td className="border p-2">{w.name}</td>
              <td className="border p-2">{w.role === 'master' ? 'Мастер' : 'Админ'}</td>
              <td className="border p-2">{w.category ?? ''}</td>
              <td className="border p-2">{w.active ? 'Активен' : 'Скрыт'}</td>
              <td className="border p-2 space-x-2">
                <form className="inline" action={toggleWorker}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="underline">{w.active ? 'Скрыть' : 'Включить'}</button>
                </form>
                <form className="inline" action={deleteWorker}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="underline text-red-600">Удалить</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export async function createWorker(formData: FormData) {
  'use server'
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? 'master')
  const category = String(formData.get('category') ?? '').trim() || null
  if (!name) return
  await prisma.worker.create({ data: { name, role, category } })
}

export async function toggleWorker(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return
  const w = await prisma.worker.findUnique({ where: { id } })
  if (!w) return
  await prisma.worker.update({ where: { id }, data: { active: !w.active } })
}

export async function deleteWorker(formData: FormData) {
  'use server'
  const id = Number(formData.get('id'))
  if (!id) return
  await prisma.worker.delete({ where: { id } })
}