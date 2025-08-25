import prisma from '@/lib/prisma'
import { ReportsFilterForm, ReportsStats, WorkersServicesTable } from '@/components'

function firstDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
  const params = await searchParams
  const start = params.start ? new Date(params.start) : firstDay(new Date())
  const end = params.end ? new Date(params.end) : new Date()

  const svc = await prisma.serviceEntry.groupBy({
    by: ['workerId', 'method'],
    where: { shift: { shiftDate: { gte: start, lte: end } } },
    _sum: { amount: true }
  })
  const workers = await prisma.worker.findMany({ where: { id: { in: [...new Set(svc.map(s => s.workerId))] } } })
  const byWorker = new Map<number, { name: string, cash: number, noncash: number }>()
  for (const row of svc) {
    const w = workers.find(w => w.id === row.workerId)
    if (!byWorker.has(row.workerId)) byWorker.set(row.workerId, { name: w?.name ?? '', cash: 0, noncash: 0 })
    const rec = byWorker.get(row.workerId)!
    if (row.method === 'cash') rec.cash = Number(row._sum.amount ?? 0)
    else rec.noncash = Number(row._sum.amount ?? 0)
  }

  const sales = await prisma.productSale.groupBy({
    by: ['method'],
    where: { shift: { shiftDate: { gte: start, lte: end } } },
    _sum: { amount: true }
  })

  const payouts = await prisma.payout.aggregate({
    where: { shift: { shiftDate: { gte: start, lte: end } } },
    _sum: { amount: true }
  })

  const totalServices = [...byWorker.values()].reduce((sum, r) => sum + r.cash + r.noncash, 0)
  const totalSales = sales.reduce((sum, s) => sum + Number(s._sum.amount ?? 0), 0)
  const totalPayouts = Number(payouts._sum.amount ?? 0)



  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <ReportsFilterForm 
          start={start.toISOString().slice(0, 10)} 
          end={end.toISOString().slice(0, 10)} 
        />
        
        <ReportsStats 
          totalServices={totalServices}
          totalSales={totalSales}
          totalPayouts={totalPayouts}
        />

        <WorkersServicesTable 
          workersServices={byWorker}
        />
      </div>
    </div>
  )
}