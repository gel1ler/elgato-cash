import db from '@/lib/db/client'
import { serviceEntries, workers as workersTbl, productSales, payouts } from '@/lib/db/schema'
import { and, asc, eq, gte, lte, sql, inArray } from 'drizzle-orm'
import { ReportsFilterForm, ReportsStats, WorkersServicesTable, PayrollTable } from '@/components'
import { Tabs } from '@/components/ui'

function firstDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
  const params = await searchParams
  const start = params.start ? new Date(params.start) : firstDay(new Date())
  const end = params.end ? new Date(params.end) : new Date()

  const svc = await db
    .select({ workerId: serviceEntries.workerId, method: serviceEntries.method, amount: sql`sum(${serviceEntries.amount})`.as('amount') })
    .from(serviceEntries)
    .where(and(gte(serviceEntries.createdAt, start), lte(serviceEntries.createdAt, end)))
    .groupBy(serviceEntries.workerId, serviceEntries.method)
  const workers = await db.query.workers.findMany({ where: (t) => inArray(t.id, [...new Set(svc.map(s => s.workerId))]) })
  const byWorker = new Map<number, { name: string, cash: number, noncash: number }>()
  for (const row of svc) {
    const w = workers.find((w: { id: number }) => w.id === row.workerId)
    if (!byWorker.has(row.workerId)) byWorker.set(row.workerId, { name: w?.name ?? '', cash: 0, noncash: 0 })
    const rec = byWorker.get(row.workerId)!
    if (row.method === 'cash') rec.cash = Number(row._sum.amount ?? 0)
    else rec.noncash = Number(row._sum.amount ?? 0)
  }

  const sales = await db
    .select({ method: productSales.method, amount: sql`sum(${productSales.amount})`.as('amount') })
    .from(productSales)
    .where(and(gte(productSales.createdAt, start), lte(productSales.createdAt, end)))
    .groupBy(productSales.method)

  const payoutsAgg = await db
    .select({ total: sql`coalesce(sum(${payouts.amount}), 0)` })
    .from(payouts)
    .where(and(gte(payouts.createdAt, start), lte(payouts.createdAt, end)))

  const totalServices = [...byWorker.values()].reduce((sum, r) => sum + r.cash + r.noncash, 0)
  const totalSales = sales.reduce((sum, s) => sum + Number((s as any).amount ?? 0), 0)
  const totalPayouts = Number(payoutsAgg[0]?.total ?? 0)

  // Payroll data
  const workersAll = await db.query.workers.findMany({ where: (t, { eq }) => eq(t.active, true), orderBy: (t, { asc }) => [asc(t.role), asc(t.name)] })
  const servicesByWorker = await db
    .select({ workerId: serviceEntries.workerId, amount: sql`sum(${serviceEntries.amount})`.as('amount') })
    .from(serviceEntries)
    .where(and(gte(serviceEntries.createdAt, start), lte(serviceEntries.createdAt, end)))
    .groupBy(serviceEntries.workerId)
  const payoutsByWorker = await db
    .select({ workerId: payouts.workerId, amount: sql`sum(${payouts.amount})`.as('amount') })
    .from(payouts)
    .where(and(gte(payouts.createdAt, start), lte(payouts.createdAt, end), sql`${payouts.workerId} is not null`))
    .groupBy(payouts.workerId)
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