import db from '@/lib/db/client'
import { workers } from '@/lib/db/schema'
import { asc, desc, sql } from 'drizzle-orm'
import { CreateWorkerForm, WorkersTable } from '@/components'

async function getWorkers() {
  const list = await db.query.workers.findMany({
    orderBy: [desc(workers.active), asc(workers.role), asc(workers.name)]
  })
  return list.map(w => ({
    id: w.id,
    name: w.name,
    role: w.role,
    category: w.category ?? null,
    active: w.active,
    salaryRate: Number(w.salaryRate ?? 0.5)
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