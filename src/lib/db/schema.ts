import { pgTable, serial, integer, varchar, boolean, timestamp, numeric, unique, index } from 'drizzle-orm/pg-core'

export const workers = pgTable('Worker', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  category: varchar('category', { length: 255 }),
  active: boolean('active').notNull().default(true),
  salaryRate: numeric('salaryRate', { precision: 6, scale: 3, mode: 'number' }).notNull().default(0.5),
})

export const shifts = pgTable('Shift', {
  id: serial('id').primaryKey(),
  shiftDate: timestamp('shiftDate', { withTimezone: false }).notNull(),
  openingCash: numeric('openingCash', { precision: 12, scale: 2, mode: 'number' }).notNull().default(0),
  closingCash: numeric('closingCash', { precision: 12, scale: 2, mode: 'number' }),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  adminId: integer('adminId').references(() => workers.id),
})

export const serviceEntries = pgTable('ServiceEntry', {
  id: serial('id').primaryKey(),
  service: varchar('service', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  method: varchar('method', { length: 32 }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  shiftId: integer('shiftId').notNull().references(() => shifts.id),
  workerId: integer('workerId').notNull().references(() => workers.id),
}, (t) => ({
  idxServiceEntriesShift: index('idx_service_entries_shift').on(t.shiftId),
  idxServiceEntriesWorker: index('idx_service_entries_worker').on(t.workerId),
}))

export const productSales = pgTable('ProductSale', {
  id: serial('id').primaryKey(),
  product: varchar('product', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  method: varchar('method', { length: 32 }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  shiftId: integer('shiftId').notNull().references(() => shifts.id),
}, (t) => ({
  idxProductSalesShift: index('idx_product_sales_shift').on(t.shiftId),
}))

export const payouts = pgTable('Payout', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  note: varchar('note', { length: 1024 }),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  shiftId: integer('shiftId').notNull().references(() => shifts.id),
  workerId: integer('workerId').references(() => workers.id),
}, (t) => ({
  idxPayoutsShift: index('idx_payouts_shift').on(t.shiftId),
}))

export const tips = pgTable('Tip', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: false }).notNull().defaultNow(),
  shiftId: integer('shiftId').notNull().references(() => shifts.id),
  workerId: integer('workerId').notNull().references(() => workers.id),
}, (t) => ({
  byShiftWorker: unique('Tip_shiftId_workerId_unique').on(t.shiftId, t.workerId),
  idxTipsShift: index('idx_tips_shift').on(t.shiftId),
}))

// Indexes are defined inside table callbacks above


