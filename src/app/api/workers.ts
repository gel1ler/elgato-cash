'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createWorker(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const role = String(formData.get('role') ?? 'master')
  const category = String(formData.get('category') ?? '').trim() || null
  if (!name) return
  await prisma.worker.create({ data: { name, role, category } })
  revalidatePath('/workers')
}

export async function toggleWorker(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  const w = await prisma.worker.findUnique({ where: { id } })
  if (!w) return
  await prisma.worker.update({ where: { id }, data: { active: !w.active } })
  revalidatePath('/workers')
}

export async function deleteWorker(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!id) return
  await prisma.worker.delete({ where: { id } })
  revalidatePath('/workers')
}
