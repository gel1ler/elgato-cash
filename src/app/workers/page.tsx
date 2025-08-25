import prisma from '@/lib/prisma'
import { CreateWorkerForm, WorkersTable } from '@/components'

async function getWorkers() {
  return prisma.worker.findMany({ orderBy: [{ active: 'desc' }, { role: 'asc' }, { name: 'asc' }] })
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