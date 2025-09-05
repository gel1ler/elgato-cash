
'use server'

import db from '@/lib/db/client'
import { workers } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

export async function createWorker(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? 'master')
  const category = String(formData.get('category') ?? '').trim() || null
  const salaryRateRaw = String(formData.get('salaryRate') ?? '').trim()
  const salaryRate = salaryRateRaw ? Number(salaryRateRaw) : 0.5
  if (!name) return
  await db.insert(workers).values({ name, role, category, salaryRate })
  revalidatePath('/workers')
}

export async function toggleWorker(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  const existing = await db.query.workers.findFirst({ where: (tbl, { eq }) => eq(tbl.id, id) })
  if (!existing) return
  await db.update(workers).set({ active: !existing.active }).where(eq(workers.id, id))
  revalidatePath('/workers')
}

export async function deleteWorker(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  await db.delete(workers).where(eq(workers.id, id))
  revalidatePath('/workers')
}

export async function updateWorkerSalaryRate(formData: FormData) {
  const id = Number(formData.get('id'))
  const salaryRateRaw = String(formData.get('salaryRate') ?? '').trim()
  if (!id || !salaryRateRaw) return
  const salaryRate = Number(salaryRateRaw)
  if (Number.isNaN(salaryRate)) return
  await db.update(workers).set({ salaryRate }).where(eq(workers.id, id))
  revalidatePath('/workers')
}
