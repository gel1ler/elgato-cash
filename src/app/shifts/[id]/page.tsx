import db from '@/lib/db/client'
import { shifts as shiftsTbl, workers as workersTbl, serviceEntries as serviceEntriesTbl, productSales as productSalesTbl, payouts as payoutsTbl, tips as tipsTbl } from '@/lib/db/schema'
import { asc, and, eq, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { computeTotals } from '@/lib/utils'
import { ShiftHeader, ServicesTable, SalesTable, PayoutsTable, ShiftSummary } from '@/components'
import { Tabs } from '@/components/ui'

export default async function ShiftView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shiftId = Number(id)

  const shift = (await db.select().from(shiftsTbl).where(eq(shiftsTbl.id, shiftId)).limit(1))[0]
  const admin = shift?.adminId ? (await db.select().from(workersTbl).where(eq(workersTbl.id, shift.adminId)).limit(1))[0] : null
  const serviceEntriesList = await db
    .select()
    .from(serviceEntriesTbl)
    .where(eq(serviceEntriesTbl.shiftId, shiftId))
    .orderBy(asc(serviceEntriesTbl.createdAt))
  const serviceEntryWorkerIds = [...new Set(serviceEntriesList.map(s => s.workerId))]
  const serviceEntryWorkers = serviceEntryWorkerIds.length
    ? await db.select().from(workersTbl).where(and(eq(workersTbl.active, true), inArray(workersTbl.id, serviceEntryWorkerIds)))
    : []
  const productSalesList = await db
    .select()
    .from(productSalesTbl)
    .where(eq(productSalesTbl.shiftId, shiftId))
    .orderBy(asc(productSalesTbl.createdAt))
  const payoutsList = await db
    .select()
    .from(payoutsTbl)
    .where(eq(payoutsTbl.shiftId, shiftId))
    .orderBy(asc(payoutsTbl.createdAt))
  const payoutWorkerIds = [...new Set(payoutsList.map(p => p.workerId).filter(Boolean) as number[])]
  const payoutWorkers = payoutWorkerIds.length
    ? await db.select().from(workersTbl).where(inArray(workersTbl.id, payoutWorkerIds))
    : []
  if (!shift) return notFound()

  const masters = await db
    .select()
    .from(workersTbl)
    .where(and(eq(workersTbl.role, 'master'), eq(workersTbl.active, true)))
    .orderBy(asc(workersTbl.category), asc(workersTbl.name))

  const tips = await db.select().from(tipsTbl).where(eq(tipsTbl.shiftId, shiftId)).orderBy(asc(tipsTbl.createdAt))

  // Сериализуем masters для передачи в компоненты
  const serializedMasters = masters.map((master: any) => ({
    id: master.id,
    name: master.name,
    role: master.role,
    category: master.category,
    active: master.active,
    salaryRate: Number(master.salaryRate)
  }))

  const totals = computeTotals({
    openingCash: shift.openingCash,
    serviceEntries: serviceEntriesList,
    productSales: productSalesList,
    payouts: payoutsList,
  })

  // Сериализуем данные для передачи в компоненты
  const serializedShift = {
    id: shift.id,
    shiftDate: shift.shiftDate,
    admin: admin ? {
      id: admin.id,
      name: admin.name,
      role: admin.role,
      category: admin.category,
      active: admin.active,
      salaryRate: Number(admin.salaryRate)
    } : null,
    openingCash: Number(shift.openingCash),
    closingCash: shift.closingCash ? Number(shift.closingCash) : null,
    createdAt: shift.createdAt,
    adminId: shift.adminId
  }

  const serializedServiceEntries = serviceEntriesList.map((entry: any) => ({
    id: entry.id,
    workerId: entry.workerId,
    worker: (() => {
      const w = serviceEntryWorkers.find((w: any) => w.id === entry.workerId)
      return w ? {
        id: w.id,
        name: w.name,
        role: w.role,
        category: w.category,
        active: w.active,
        salaryRate: Number(w.salaryRate)
      } : { id: entry.workerId, name: '', role: 'master', category: null, active: true, salaryRate: 0.5 }
    })(),
    service: entry.service,
    method: entry.method,
    amount: Number(entry.amount),
    createdAt: entry.createdAt
  }))

  const serializedTips = (tips as Array<{ id: number; workerId: number; amount: unknown; createdAt: Date }>).map((tip) => ({
    id: tip.id,
    workerId: tip.workerId,
    amount: Number(tip.amount),
    createdAt: tip.createdAt
  }))

  const serializedProductSales = productSalesList.map((sale: any) => ({
    id: sale.id,
    product: sale.product,
    method: sale.method,
    amount: Number(sale.amount),
    createdAt: sale.createdAt
  }))

  const serializedPayouts = payoutsList.map((payout: any) => ({
    id: payout.id,
    worker: (() => {
      if (!payout.workerId) return null
      const w = payoutWorkers.find((w: any) => w.id === payout.workerId)
      return w ? {
        id: w.id,
        name: w.name,
        role: w.role,
        category: w.category,
        active: w.active,
        salaryRate: Number(w.salaryRate)
      } : null
    })(),
    reason: payout.note || '',
    amount: Number(payout.amount),
    createdAt: payout.createdAt
  }))

  const tabs = [
    {
      id: 'services',
      label: 'Услуги',
      content: (
        <ServicesTable
          shift={serializedShift}
          services={serializedServiceEntries}
          workers={serializedMasters}
          tips={serializedTips}
        />
      )
    },
    {
      id: 'sales',
      label: 'Продажи',
      content: (
        <SalesTable
          shift={serializedShift}
          productSales={serializedProductSales}
        />
      )
    },
    {
      id: 'payouts',
      label: 'Выплаты',
      content: (
        <PayoutsTable
          shift={serializedShift}
          payouts={serializedPayouts}
          workers={serializedMasters}
        />
      )
    },
    {
      id: 'summary',
      label: 'Итоги',
      content: (
        <ShiftSummary
          shift={serializedShift}
          totalSales={totals.overallSales}
          totalServices={totals.overallServices}
          totalPayouts={totals.totalPayouts}
          paymentMethods={totals.paymentMethods}
        />
      )
    }
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <ShiftHeader shift={serializedShift} />
        <Tabs tabs={tabs} defaultTab="services" />
      </div>
    </div>
  )
}