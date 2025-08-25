import Link from 'next/link'

export default function Navigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Учет выручки</h1>
          <nav className="flex gap-6 text-sm">
            <Link
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              href="/"
            >
              Главная
            </Link>
            <Link
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              href="/shifts"
            >
              Смены
            </Link>
            <Link
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              href="/workers"
            >
              Сотрудники
            </Link>
            <Link
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              href="/reports"
            >
              Отчеты
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
