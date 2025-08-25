export default function CashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      <header className="flex gap-3 items-center justify-between">
        <h1 className="text-xl font-semibold">Учет выручки</h1>
        <nav className="flex gap-3 text-sm">
          <a className="underline" href="/cash/shifts">Смены</a>
          <a className="underline" href="/cash/workers">Сотрудники</a>
          <a className="underline" href="/cash/reports">Отчеты</a>
        </nav>
      </header>
      {children}
    </div>
  )
}