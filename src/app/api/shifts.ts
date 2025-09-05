'use server'

import db from '@/lib/db/client'
import { shifts, serviceEntries, productSales, payouts, tips } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { toNumber } from '@/lib/utils'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function createShift(formData: FormData) {
  const shiftDate = new Date(String(formData.get('shiftDate')))
  const adminIdRaw = String(formData.get('adminId') ?? '')
  const adminId = adminIdRaw ? Number(adminIdRaw) : null
  const openingCash = Number(String(formData.get('openingCash') ?? '0'))
  await db.insert(shifts).values({ shiftDate, adminId, openingCash })
  revalidatePath('/shifts')
}

export async function addWorkerToTable(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))

  if (!shiftId || !workerId) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  // Просто обновляем страницу - мастер автоматически появится в таблице
  revalidatePath(`/shifts/${shiftId}`)
}

export async function removeWorkerFromTable(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))

  if (!shiftId || !workerId) return

  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.transaction(async (tx) => {
    await tx.delete(serviceEntries).where(and(eq(serviceEntries.shiftId, shiftId), eq(serviceEntries.workerId, workerId)))
    await tx.delete(payouts).where(and(eq(payouts.shiftId, shiftId), eq(payouts.workerId, workerId)))
    if (shift.adminId === workerId) {
      await tx.update(shifts).set({ adminId: null }).where(eq(shifts.id, shiftId))
    }
  })

  revalidatePath(`/shifts/${shiftId}`)
}

export async function addSale(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const product = String(formData.get('product') ?? '').trim()
  const method = String(formData.get('method'))
  const amount = toNumber(formData.get('amount'))

  if (!shiftId || !product || !method || amount <= 0) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.insert(productSales).values({ shiftId, product, method, amount })
  revalidatePath(`/shifts/${shiftId}`)
}

export async function addService(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))
  const service = String(formData.get('service') ?? '').trim()
  const method = String(formData.get('method'))
  const amount = toNumber(formData.get('amount'))

  if (!shiftId || !workerId || !service || !method || amount <= 0) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.insert(serviceEntries).values({ shiftId, workerId, service, method, amount })
  revalidatePath(`/shifts/${shiftId}`)
}

export async function addPayout(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerIdRaw = String(formData.get('workerId') ?? '')
  const workerId = workerIdRaw ? Number(workerIdRaw) : null
  const amount = toNumber(formData.get('amount'))
  const reason = String(formData.get('reason') ?? '').trim()

  if (!shiftId || amount <= 0) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.insert(payouts).values({ shiftId, workerId, note: reason || null, amount })
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteService(formData: FormData) {
  const id = Number(formData.get('id'))
  const shiftId = Number(formData.get('shiftId'))

  if (!id || !shiftId) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.delete(serviceEntries).where(eq(serviceEntries.id, id))
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteSale(formData: FormData) {
  const id = Number(formData.get('id'))
  const shiftId = Number(formData.get('shiftId'))

  if (!id || !shiftId) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.delete(productSales).where(eq(productSales.id, id))
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deletePayout(formData: FormData) {
  const id = Number(formData.get('id'))
  const shiftId = Number(formData.get('shiftId'))

  if (!id || !shiftId) return

  // Проверяем, что смена не закрыта
  const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
  if (!shift || shift.closingCash !== null) return

  await db.delete(payouts).where(eq(payouts.id, id))
  revalidatePath(`/shifts/${shiftId}`)
}

export async function closeShift(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  if (!shiftId) return

  const shift = await db.query.shifts.findFirst({ where: (t, { eq }) => eq(t.id, shiftId) })
  if (!shift) return

  const services = await db.select().from(serviceEntries).where(eq(serviceEntries.shiftId, shiftId))
  const sales = await db.select().from(productSales).where(eq(productSales.shiftId, shiftId))
  const payoutList = await db.select().from(payouts).where(eq(payouts.shiftId, shiftId))

  const { computeTotals } = await import('@/lib/utils')
  const t = computeTotals({
    openingCash: shift.openingCash,
    serviceEntries: services,
    productSales: sales,
    payouts: payoutList,
  })

  // Проверяем, что смена еще не закрыта
  if (shift.closingCash !== null) return

  // Проверяем, что остаток не отрицательный
  if (t.cashEnd < 0) return

  await db.update(shifts).set({ closingCash: t.cashEnd }).where(eq(shifts.id, shiftId))
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteShift(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  if (!shiftId) return

  // Проверяем, что смена не закрыта
  const shift = await db.query.shifts.findFirst({ where: (t, { eq }) => eq(t.id, shiftId) })
  if (!shift || shift.closingCash !== null) return

  // Удаляем все связанные записи
  await db.delete(serviceEntries).where(eq(serviceEntries.shiftId, shiftId))
  await db.delete(productSales).where(eq(productSales.shiftId, shiftId))
  await db.delete(payouts).where(eq(payouts.shiftId, shiftId))

  // Теперь удаляем саму смену
  await db.delete(shifts).where(eq(shifts.id, shiftId))
  revalidatePath('/shifts')
}

export async function updateService(formData: FormData) {
  const id = Number(formData.get('id'))
  const shiftId = Number(formData.get('shiftId'))
  const hasAmount = formData.has('amount')
  const hasMethod = formData.has('method')

  if (!id || !shiftId) return

  // Проверяем, что смена не закрыта
  const shift = await db.query.shifts.findFirst({ where: (t, { eq }) => eq(t.id, shiftId) })
  if (!shift || shift.closingCash !== null) return

  const data: { amount?: number; method?: string } = {}

  if (hasAmount) {
    const amount = toNumber(formData.get('amount'))
    if (amount < 0) return
    data.amount = amount
  }

  if (hasMethod) {
    const method = String(formData.get('method'))
    if (!method) return
    data.method = method
  }

  if (Object.keys(data).length === 0) return

  await db.update(serviceEntries).set({ ...(data.amount !== undefined ? { amount: data.amount } : {}), ...(data.method !== undefined ? { method: data.method } : {}), }).where(eq(serviceEntries.id, id))
  revalidatePath(`/shifts/${shiftId}`)
}

export async function setTip(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))
  const amount = toNumber(formData.get('amount'))

  if (!shiftId || !workerId || amount <= 0) return

  const shift = await db.query.shifts.findFirst({ where: (t, { eq }) => eq(t.id, shiftId) })
  if (!shift || shift.closingCash !== null) return

  await db.insert(tips)
    .values({ shiftId, workerId, amount })
    .onConflictDoUpdate({ target: [tips.shiftId, tips.workerId], set: { amount } })
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteTip(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerId = Number(formData.get('workerId'))
  if (!shiftId || !workerId) return

  const shift = await db.query.shifts.findFirst({ where: (t, { eq }) => eq(t.id, shiftId) })
  if (!shift || shift.closingCash !== null) return

  await db.delete(tips).where(and(eq(tips.shiftId, shiftId), eq(tips.workerId, workerId)))
  revalidatePath(`/shifts/${shiftId}`)
}