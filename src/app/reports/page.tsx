import prisma from '@/lib/prisma'
import { ReportsFilterForm, ReportsStats, WorkersServicesTable, PayrollTable } from '@/components'
import { Tabs } from '@/components/ui'

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
  const workers = await prisma.worker.findMany({ where: { id: { in: [...new Set(svc.map((s: { workerId: number }) => s.workerId))] } } })
  const byWorker = new Map<number, { name: string, cash: number, noncash: number }>()
  for (const row of svc) {
    const w = workers.find((w: { id: number }) => w.id === row.workerId)
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

  // Payroll data
  const workersAll = await prisma.worker.findMany({ where: { active: true }, orderBy: [{ role: 'asc' }, { name: 'asc' }] })
  const servicesByWorker = await prisma.serviceEntry.groupBy({
    by: ['workerId'],
    where: { shift: { shiftDate: { gte: start, lte: end } } },
    _sum: { amount: true }
  })
  const payoutsByWorker = await prisma.payout.groupBy({
    by: ['workerId'],
    where: { shift: { shiftDate: { gte: start, lte: end } }, workerId: { not: null } },
    _sum: { amount: true }
  })
  const servicesMap = new Map<number, number>(servicesByWorker.map(r => [r.workerId, Number(r._sum.amount ?? 0)]))
  const payoutsMap = new Map<number, number>(payoutsByWorker.map(r => [r.workerId!, Number(r._sum.amount ?? 0)]))
  const payrollRows = workersAll.map(w => ({
    workerId: w.id,
    name: w.name,
    role: w.role,
    salaryRate: Number((w as any).salaryRate ?? 0.5),
    servicesTotal: servicesMap.get(w.id) ?? 0,
    payoutsTotal: payoutsMap.get(w.id) ?? 0,
  }))

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <ReportsFilterForm 
          start={start.toISOString().slice(0, 10)} 
          end={end.toISOString().slice(0, 10)} 
        />

        <Tabs
          defaultTab="overview"
          tabs={[
            {
              id: 'overview',
              label: 'Обзор',
              content: (
                <>
                  <ReportsStats 
                    totalServices={totalServices}
                    totalSales={totalSales}
                    totalPayouts={totalPayouts}
                  />
                  <WorkersServicesTable workersServices={byWorker} />
                </>
              )
            },
            {
              id: 'payroll',
              label: 'Зарплаты',
              content: (
                <PayrollTable rows={payrollRows} />
              )
            }
          ]}
        />
      </div>
    </div>
  )
}