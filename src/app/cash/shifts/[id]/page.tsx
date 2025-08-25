import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function toNumber(value: unknown) {
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default async function ShiftView({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const shift = await prisma.shift.findUnique({
    where: { id },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Смена {new Date(shift.shiftDate).toLocaleDateString('ru-RU')}</h2>
        <div className="text-sm">Админ: {shift.admin?.name ?? '—'}</div>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium">Услуги по мастерам</h3>
          <form className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2" action={addService}>
            <select name="workerId" className="border p-2 rounded">
              {masters.map(m => (<option key={m.id} value={m.id}>{m.name}{m.category ? ` (${m.category})` : ''}</option>))}
            </select>
            <select name="method" className="border p-2 rounded">
              <option value="cash">Нал</option>
              <option value="noncash">Б/Н</option>
            </select>
            <input name="amount" placeholder="Сумма" className="border p-2 rounded w-28" />
            <>
              <input type="hidden" name="shiftId" value={shift.id} />
              <button className="border rounded bg-black text-white px-3 py-2">Добавить</button>
            </>
          </form>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border p-2">Мастер</th>
                <th className="border p-2">Б/Н</th>
                <th className="border p-2">Нал</th>
              </tr>
            </thead>
            <tbody>
              {groupServices(shift.serviceEntries).map(row => (
                <tr key={row.workerId}>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">{row.noncash.toFixed(2)}</td>
                  <td className="border p-2">{row.cash.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 font-medium">Итого</td>
                <td className="border p-2">{totals.noncashServices.toFixed(2)}</td>
                <td className="border p-2">{totals.cashServices.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Продажи</h3>
          <form className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2" action={addSale}>
            <input name="product" placeholder="Товар" className="border p-2 rounded" />
            <select name="method" className="border p-2 rounded">
              <option value="cash">Нал</option>
              <option value="noncash">Б/Н</option>
            </select>
            <input name="amount" placeholder="Сумма" className="border p-2 rounded w-28" />
            <>
              <input type="hidden" name="shiftId" value={shift.id} />
              <button className="border rounded bg-black text-white px-3 py-2">Добавить</button>
            </>
          </form>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border p-2">Товар</th>
                <th className="border p-2">Метод</th>
                <th className="border p-2">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {shift.productSales.map(s => (
                <tr key={s.id}>
                  <td className="border p-2">{s.product}</td>
                  <td className="border p-2">{s.method === 'cash' ? 'Нал' : 'Б/Н'}</td>
                  <td className="border p-2">{Number(s.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 font-medium" colSpan={2}>Итого</td>
                <td className="border p-2">{totals.cashSalesPlusNonCashSales.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium">Выдано</h3>
          <form className="grid grid-cols-[1fr_auto_auto] items-end gap-2" action={addPayout}>
            <select name="workerId" className="border p-2 rounded">
              <option value="">— сотрудник —</option>
              {masters.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
            <input name="amount" placeholder="Сумма" className="border p-2 rounded w-28" />
            <>
              <input type="hidden" name="shiftId" value={shift.id} />
              <button className="border rounded bg-black text-white px-3 py-2">Выдать</button>
            </>
          </form>

          <ul className="text-sm list-disc pl-5">
            {shift.payouts.map(p => (
              <li key={p.id}>{p.worker?.name ?? '—'} — {Number(p.amount).toFixed(2)}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Итоги</h3>
          <div className="border rounded p-3 text-sm grid gap-1">
            <div>Нал на начало: {Number(shift.openingCash).toFixed(2)}</div>
            <div>Нал услуги: {totals.cashServices.toFixed(2)}</div>
            <div>Нал продажи: {totals.cashSales.toFixed(2)}</div>
            <div>Итого поступило нал: {totals.totalCashIn.toFixed(2)}</div>
            <div>Выдано: {totals.totalPayouts.toFixed(2)}</div>
            <div className="font-medium">Остаток в кассе: {totals.cashEnd.toFixed(2)}</div>
          </div>
          <form action={closeShift}>
            <input type="hidden" name="shiftId" value={shift.id} />
            <button className="border rounded px-3 py-2">Закрыть смену и сохранить остаток</button>
          </form>
        </div>
      </section>
    </div>
  )
}

function computeTotals(shift: any) {
  const cashServices = shift.serviceEntries.filter((e: any) => e.method === 'cash').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const noncashServices = shift.serviceEntries.filter((e: any) => e.method === 'noncash').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const cashSales = shift.productSales.filter((e: any) => e.method === 'cash').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const noncashSales = shift.productSales.filter((e: any) => e.method === 'noncash').reduce((s: number, e: any) => s + Number(e.amount), 0)
  const totalPayouts = shift.payouts.reduce((s: number, e: any) => s + Number(e.amount), 0)
  const totalCashIn = Number(shift.openingCash) + cashServices + cashSales
  const cashEnd = totalCashIn - totalPayouts
  return { cashServices, noncashServices, cashSales, noncashSales, totalPayouts, totalCashIn, cashEnd, cashSalesPlusNonCashSales: cashSales + noncashSales }
}

export async function addService(formData: FormData) {
  'use server'
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))
  const method = String(formData.get('method'))
  const amount = toNumber(formData.get('amount'))
  if (!shiftId || !workerId || amount <= 0) return
  await prisma.serviceEntry.create({ data: { shiftId, workerId, method, amount } })
  revalidatePath(`/cash/shifts/${shiftId}`)
}

export async function addSale(formData: FormData) {
  'use server'
  const shiftId = Number(formData.get('shiftId'))
  const product = String(formData.get('product') ?? '').trim()
  const method = String(formData.get('method'))
  const amount = toNumber(formData.get('amount'))
  if (!shiftId || !product || amount <= 0) return
  await prisma.productSale.create({ data: { shiftId, product, method, amount } })
  revalidatePath(`/cash/shifts/${shiftId}`)
}

export async function addPayout(formData: FormData) {
  'use server'
  const shiftId = Number(formData.get('shiftId'))
  const workerIdRaw = String(formData.get('workerId') ?? '')
  const workerId = workerIdRaw ? Number(workerIdRaw) : null
  const amount = toNumber(formData.get('amount'))
  if (!shiftId || amount <= 0) return
  await prisma.payout.create({ data: { shiftId, workerId, amount } })
  revalidatePath(`/cash/shifts/${shiftId}`)
}

export async function closeShift(formData: FormData) {
  'use server'
  const shiftId = Number(formData.get('shiftId'))
  if (!shiftId) return
  const shift = await prisma.shift.findUnique({ where: { id: shiftId }, include: { serviceEntries: true, productSales: true, payouts: true } })
  if (!shift) return
  const t = computeTotals(shift)
  await prisma.shift.update({ where: { id: shiftId }, data: { closingCash: t.cashEnd } })
  revalidatePath(`/cash/shifts/${shiftId}`)
}