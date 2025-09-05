/**
 * Утилиты для работы с валютой
 */

/**
 * Форматирует число в денежный формат рублей
 */
export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue)
}

/**
 * Очищает введенное значение от форматирования, оставляя только цифры
 */
export const cleanCurrencyValue = (value: string): string => {
  return value.replace(/[^\d]/g, '')
}

/**
 * Проверяет, является ли значение корректной суммой
 */
export const isValidAmount = (value: string): boolean => {
  const cleanValue = cleanCurrencyValue(value)
  const numeric = parseFloat(cleanValue)
  return cleanValue !== '' && !Number.isNaN(numeric) && numeric >= 0
}

/**
 * Получает числовое значение из строки валюты
 */
export const getNumericAmount = (value: string): number => {
  const cleanValue = cleanCurrencyValue(value)
  return cleanValue === '' ? 0 : parseFloat(cleanValue)
}
