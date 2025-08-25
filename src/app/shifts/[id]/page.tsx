import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { computeTotals } from '@/lib/utils'
import { ShiftHeader, ServicesTable, SalesTable, PayoutsTable, ShiftSummary } from '@/components'
import { Tabs } from '@/components/ui'

export default async function ShiftView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shiftId = Number(id)

  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      admin: true,
      serviceEntries: { include: { worker: true }, orderBy: { createdAt: 'asc' } },
      productSales: { orderBy: { createdAt: 'asc' } },
      payouts: { include: { worker: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!shift) return notFound()

  const masters = await prisma.worker.findMany({ where: { role: 'master', active: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] })

  const totals = computeTotals(shift)

  // Сериализуем данные для передачи в компоненты
  const serializedShift = {
    id: shift.id,
    shiftDate: shift.shiftDate,
    admin: shift.admin,
    openingCash: Number(shift.openingCash),
    closingCash: shift.closingCash ? Number(shift.closingCash) : null,
    createdAt: shift.createdAt,
    adminId: shift.adminId
  }

  const serializedServiceEntries = shift.serviceEntries.map(entry => ({
    id: entry.id,
    workerId: entry.workerId,
    worker: entry.worker,
    service: entry.service,
    method: entry.method,
    amount: Number(entry.amount),
    createdAt: entry.createdAt
  }))

  const serializedProductSales = shift.productSales.map(sale => ({
    id: sale.id,
    product: sale.product,
    method: sale.method,
    amount: Number(sale.amount),
    createdAt: sale.createdAt
  }))

  const serializedPayouts = shift.payouts.map(payout => ({
    id: payout.id,
    worker: payout.worker,
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
          workers={masters}
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
          workers={masters}
        />
      )
    },
    {
      id: 'summary',
      label: 'Итоги',
      content: (
        <ShiftSummary
          shift={serializedShift}
          totalSales={totals.cashSalesPlusNonCashSales}
          totalServices={totals.cashServices + totals.noncashServices}
          totalPayouts={totals.totalPayouts}
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