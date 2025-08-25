'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { toNumber } from '@/lib/utils'

export async function createShift(formData: FormData) {
  const shiftDate = new Date(String(formData.get('shiftDate')))
  const adminIdRaw = String(formData.get('adminId') ?? '')
  const adminId = adminIdRaw ? Number(adminIdRaw) : null
  const openingCash = Number(String(formData.get('openingCash') ?? '0'))
  await prisma.shift.create({ data: { shiftDate, adminId, openingCash } })
  revalidatePath('/shifts')
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

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift || shift.closingCash !== null) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx) => {
    // Удаляем все услуги этого работника в данной смене
    await tx.serviceEntry.deleteMany({ where: { shiftId, workerId } })

    // Удаляем все выплаты этого работника в данной смене
    await tx.payout.deleteMany({ where: { shiftId, workerId } })

    // Если работник был админом смены — снимаем
    if (shift.adminId === workerId) {
      await tx.shift.update({ where: { id: shiftId }, data: { adminId: null } })
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
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift || shift.closingCash !== null) return

  await prisma.productSale.create({ data: { shiftId, product, method, amount } })
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

export async function addPayout(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  const workerIdRaw = String(formData.get('workerId') ?? '')
  const workerId = workerIdRaw ? Number(workerIdRaw) : null
  const amount = toNumber(formData.get('amount'))
  const reason = String(formData.get('reason') ?? '').trim()

  if (!shiftId || amount <= 0) return

  // Проверяем, что смена не закрыта
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift || shift.closingCash !== null) return

  await prisma.payout.create({ data: { shiftId, workerId, note: reason, amount } })
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

  const { computeTotals } = await import('@/lib/utils')
  const t = computeTotals(shift)

  // Проверяем, что смена еще не закрыта
  if (shift.closingCash !== null) return

  // Проверяем, что остаток не отрицательный
  if (t.cashEnd < 0) return

  await prisma.shift.update({ where: { id: shiftId }, data: { closingCash: t.cashEnd } })
  revalidatePath(`/shifts/${shiftId}`)
}

export async function deleteShift(formData: FormData) {
  const shiftId = Number(formData.get('shiftId'))
  if (!shiftId) return

  // Проверяем, что смена не закрыта
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
  if (!shift || shift.closingCash !== null) return

  // Удаляем все связанные записи
  await prisma.serviceEntry.deleteMany({ where: { shiftId } })
  await prisma.productSale.deleteMany({ where: { shiftId } })
  await prisma.payout.deleteMany({ where: { shiftId } })

  // Теперь удаляем саму смену
  await prisma.shift.delete({ where: { id: shiftId } })
  revalidatePath('/shifts')
}

export async function updateService(formData: FormData) {
  const id = Number(formData.get('id'))
  const shiftId = Number(formData.get('shiftId'))
  const hasAmount = formData.has('amount')
  const hasMethod = formData.has('method')

  if (!id || !shiftId) return

  // Проверяем, что смена не закрыта
  const shift = await prisma.shift.findUnique({ where: { id: shiftId } })
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

  await prisma.serviceEntry.update({ where: { id }, data })
  revalidatePath(`/shifts/${shiftId}`)
}