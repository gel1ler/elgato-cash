'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const LoadingContext = createContext<{ start: () => void; stop: () => void; active: boolean } | null>(null)

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const counterRef = useRef(0)

  const start = useCallback(() => {
    counterRef.current += 1
    setActive(true)
  }, [])

  const stop = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1)
    if (counterRef.current === 0) setActive(false)
  }, [])

  const value = useMemo(() => ({ start, stop, active }), [start, stop, active])

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-3 text-gray-800">
              <div className="text-blue-600">
                {/* reuse our Spinner */}
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <span className="bg-white/80 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 shadow-sm">Загрузка…</span>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}


