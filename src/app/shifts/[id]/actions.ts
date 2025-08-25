'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function toNumber(value: unknown) {
    const n = Number(String(value).replace(',', '.'))
    return Number.isFinite(n) ? n : 0
}

export async function addWorkerToTable(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const workerId = Number(formData.get('workerId'))

    if (!shiftId || !workerId) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    // Просто обновляем страницу - мастер автоматически появится в таблице
    revalidatePath(`/shifts/${shiftId}`)
}

export async function removeWorkerFromTable(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const workerId = Number(formData.get('workerId'))

    if (!shiftId || !workerId) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
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
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
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

    await prisma.serviceEntry.create({ data: { shiftId, workerId, service, method, amount } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function addSale(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const product = String(formData.get('product') ?? '').trim()
    const method = String(formData.get('method'))
    const amount = toNumber(formData.get('amount'))

    if (!shiftId || !product || !method || amount <= 0) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await prisma.productSale.create({ data: { shiftId, product, method, amount } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function addPayout(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    const workerIdRaw = String(formData.get('workerId') ?? '')
    const workerId = workerIdRaw ? Number(workerIdRaw) : null
    const amount = toNumber(formData.get('amount'))

    if (!shiftId || amount <= 0) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await prisma.payout.create({ data: { shiftId, workerId, amount } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteService(formData: FormData) {
    const id = Number(formData.get('id'))
    const shiftId = Number(formData.get('shiftId'))

    if (!id || !shiftId) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await prisma.serviceEntry.delete({ where: { id } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteSale(formData: FormData) {
    const id = Number(formData.get('id'))
    const shiftId = Number(formData.get('shiftId'))

    if (!id || !shiftId) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await prisma.productSale.delete({ where: { id } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function deletePayout(formData: FormData) {
    const id = Number(formData.get('id'))
    const shiftId = Number(formData.get('shiftId'))

    if (!id || !shiftId) return

    // Проверяем, что смена не закрыта
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
    if (!shift || shift.closingCash !== null) return

    await prisma.payout.delete({ where: { id } })
    revalidatePath(`/shifts/${shiftId}`)
}

export async function closeShift(formData: FormData) {
    const shiftId = Number(formData.get('shiftId'))
    if (!shiftId) return

    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        include: { serviceEntries: true, productSales: true, payouts: true }
    })
    if (!shift) return

    const t = computeTotals(shift)

    // Проверяем, что смена еще не закрыта
    if (shift.closingCash !== null) return

    // Проверяем, что остаток не отрицательный
    if (t.cashEnd < 0) return

    await prisma.shift.update({ where: { id: shiftId }, data: { closingCash: t.cashEnd } })
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
    const cashSales = shift.productSales.filter((e) => e.method === 'cash').reduce((s, e) => s + Number(e.amount), 0)
    const noncashSales = shift.productSales.filter((e) => e.method === 'noncash').reduce((s, e) => s + Number(e.amount), 0)
    const totalPayouts = shift.payouts.reduce((s, e) => s + Number(e.amount), 0)
    const totalCashIn = Number(shift.openingCash) + cashServices + cashSales
    const cashEnd = totalCashIn - totalPayouts
    return { cashServices, noncashServices, cashSales, noncashSales, totalPayouts, totalCashIn, cashEnd, cashSalesPlusNonCashSales: cashSales + noncashSales }
}
