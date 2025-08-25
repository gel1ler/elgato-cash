import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Страница не найдена</h2>
          <p className="text-gray-600 mb-8">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Вернуться на главную
          </Link>
          
          <div className="text-sm text-gray-500 mt-4">
            Или перейти к:
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/shifts"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Смены
            </Link>
            <Link 
              href="/workers"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Сотрудники
            </Link>
            <Link 
              href="/reports"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Отчеты
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
