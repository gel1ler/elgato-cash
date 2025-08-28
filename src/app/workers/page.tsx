import prisma from '@/lib/prisma'
import { CreateWorkerForm, WorkersTable } from '@/components'

async function getWorkers() {
  const list = await prisma.worker.findMany({ orderBy: [{ active: 'desc' }, { role: 'asc' }, { name: 'asc' }] })
  return list.map(w => ({
    id: w.id,
    name: w.name,
    role: w.role,
    category: w.category,
    active: w.active,
    salaryRate: Number((w as any).salaryRate ?? 0.5)
  }))
}

export default async function WorkersPage() {
  const workers = await getWorkers()
  
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <CreateWorkerForm />
        <WorkersTable workers={workers} />
      </div>
    </div>
  )
}