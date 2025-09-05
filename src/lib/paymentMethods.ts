export type PaymentMethod = 'cash' | 'noncash' | 'transfer' | 'sbp' | 'certificate'

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'noncash', 'transfer', 'sbp', 'certificate']

export const getMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash': return 'Нал'
    case 'noncash': return 'Б/Н'
    case 'transfer': return 'Перевод'
    case 'sbp': return 'СБП'
    case 'certificate': return 'Сертификат'
    default: return method
  }
}

export const getMethodBadgeVariant = (method: PaymentMethod): 'success' | 'info' | 'warning' | 'primary' => {
  switch (method) {
    case 'cash': return 'success'
    case 'noncash': return 'info'
    case 'transfer': return 'warning'
    case 'sbp': return 'primary'
    case 'certificate': return 'secondary'
    default: return 'primary'
  }
}

export const getMethodClassName = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash': return 'bg-green-600 hover:bg-green-700'
    case 'noncash': return 'bg-blue-600 hover:bg-blue-700'
    case 'transfer': return 'bg-yellow-600 hover:bg-yellow-700'
    case 'sbp': return 'bg-purple-600 hover:bg-purple-700'
    default: return 'bg-gray-600 hover:bg-gray-700'
  }
}

export const getMethodBadgeClassName = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash': return 'bg-green-100 text-green-700'
    case 'noncash': return 'bg-blue-100 text-blue-700'
    case 'transfer': return 'bg-yellow-100 text-yellow-700'
    case 'sbp': return 'bg-purple-100 text-purple-700'
    case 'certificate': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
