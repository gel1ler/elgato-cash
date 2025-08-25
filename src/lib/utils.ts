export function toNumber(value: unknown) {
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function computeTotals(shift: {
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
  return { 
    cashServices, 
    noncashServices, 
    cashSales, 
    noncashSales, 
    totalPayouts, 
    totalCashIn, 
    cashEnd, 
    cashSalesPlusNonCashSales: cashSales + noncashSales 
  }
}
