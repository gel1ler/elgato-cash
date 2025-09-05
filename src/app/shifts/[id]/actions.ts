'use server'

import db from '@/lib/db/client'
import { shifts, serviceEntries, productSales, payouts } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

function toNumber(value: unknown) {
    const n = Number(String(value).replace(',', '.'))
    return Number.isFinite(n) ? n : 0
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

    // Проверяем, что смена не закрыта
    const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
    if (!shift || shift.closingCash !== null) return

    // Просто обновляем страницу - мастер автоматически исчезнет из таблицы
    revalidatePath(`/shifts/${shiftId}`)
}

export async function quickAddService(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const workerId = Number(formData.get('workerId'))
    const service = String(formData.get('service') ?? '').trim()
    const method = String(formData.get('method'))

    if (!shiftId || !workerId || !service || !method) return

    // Проверяем, что смена не закрыта
    const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
    if (!shift || shift.closingCash !== null) return

    // Перенаправляем на страницу смены с предзаполненными полями
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
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await db.insert(serviceEntries).values({ shiftId, workerId, service, method, amount })
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

export async function addPayout(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const workerIdRaw = String(formData.get('workerId') ?? '')
    const workerId = workerIdRaw ? Number(workerIdRaw) : null
    const amount = toNumber(formData.get('amount'))

    if (!shiftId || amount <= 0) return

    // Проверяем, что смена не закрыта
    const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
    if (!shift || shift.closingCash !== null) return

    await db.insert(payouts).values({ shiftId, workerId, amount })
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

    const shift = (await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1))[0]
    if (!shift) return

    const services = await db.select().from(serviceEntries).where(eq(serviceEntries.shiftId, shiftId))
    const sales = await db.select().from(productSales).where(eq(productSales.shiftId, shiftId))
    const payoutList = await db.select().from(payouts).where(eq(payouts.shiftId, shiftId))

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

function computeTotals(shift: {
    openingCash: number | { toString(): string };
    serviceEntries: Array<{ method: string; amount: number | { toString(): string } }>;
    productSales: Array<{ method: string; amount: number | { toString(): string } }>;
    payouts: Array<{ amount: number | { toString(): string } }>;
}) {
    const cashServices = shift.serviceEntries.filter((e) => e.method === 'cash').reduce((s, e) => s + Number(e.amount), 0)
    const noncashServices = shift.serviceEntries.filter((e) => e.method === 'noncash').reduce((s, e) => s + Number(e.amount), 0)
    const transferServices = shift.serviceEntries.filter((e) => e.method === 'transfer').reduce((s, e) => s + Number(e.amount), 0)
    const sbpServices = shift.serviceEntries.filter((e) => e.method === 'sbp').reduce((s, e) => s + Number(e.amount), 0)
    
    const cashSales = shift.productSales.filter((e) => e.method === 'cash').reduce((s, e) => s + Number(e.amount), 0)
    const noncashSales = shift.productSales.filter((e) => e.method === 'noncash').reduce((s, e) => s + Number(e.amount), 0)
    const transferSales = shift.productSales.filter((e) => e.method === 'transfer').reduce((s, e) => s + Number(e.amount), 0)
    const sbpSales = shift.productSales.filter((e) => e.method === 'sbp').reduce((s, e) => s + Number(e.amount), 0)
    
    const totalPayouts = shift.payouts.reduce((s, e) => s + Number(e.amount), 0)
    const totalCashIn = Number(shift.openingCash) + cashServices + cashSales
    const cashEnd = totalCashIn - totalPayouts
    
    // Итоги по способам оплаты
    const paymentMethods = {
        cash: cashServices + cashSales,
        noncash: noncashServices + noncashSales,
        transfer: transferServices + transferSales,
        sbp: sbpServices + sbpSales
    }
    
    return { 
        cashServices, 
        noncashServices, 
        transferServices,
        sbpServices,
        cashSales, 
        noncashSales, 
        transferSales,
        sbpSales,
        totalPayouts, 
        totalCashIn, 
        cashEnd, 
        cashSalesPlusNonCashSales: cashSales + noncashSales,
        paymentMethods
    }
}
