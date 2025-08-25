import prisma from '@/lib/prisma'

function firstDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }

export default async function ReportsPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  const start = searchParams.start ? new Date(searchParams.start) : firstDay(new Date())
  const end = searchParams.end ? new Date(searchParams.end) : new Date()

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Отчеты</h2>
      <form className="grid sm:grid-cols-3 gap-3">
        <input type="date" name="start" defaultValue={start.toISOString().slice(0,10)} className="border p-2 rounded" />
        <input type="date" name="end" defaultValue={end.toISOString().slice(0,10)} className="border p-2 rounded" />
        <button className="border rounded px-3 py-2">Показать</button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left">
              <th className="border p-2">Мастер</th>
              <th className="border p-2">Б/Н</th>
              <th className="border p-2">Нал</th>
            </tr>
          </thead>
          <tbody>
            {[...byWorker.entries()].map(([id, r]) => (
              <tr key={id}>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.noncash.toFixed(2)}</td>
                <td className="border p-2">{r.cash.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border rounded p-3 text-sm grid gap-1">
          <div>Продажи б/н: {Number(sales.find(s=>s.method==='noncash')?._sum.amount ?? 0).toFixed(2)}</div>
          <div>Продажи нал: {Number(sales.find(s=>s.method==='cash')?._sum.amount ?? 0).toFixed(2)}</div>
          <div>Выдано: {Number(payouts._sum.amount ?? 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}