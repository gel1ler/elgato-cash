export default function CashHome() {
  return (
    <div className="p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <a className="border rounded p-4 hover:bg-gray-50" href="/cash/shifts">Смены</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/cash/workers">Сотрудники</a>
        <a className="border rounded p-4 hover:bg-gray-50" href="/cash/reports">Отчеты</a>
      </div>
    </div>
  )
}