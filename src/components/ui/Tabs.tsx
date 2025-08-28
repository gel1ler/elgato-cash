'use client'
import { useEffect, useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

const Tabs = ({ tabs, defaultTab, className = '' }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  // Initialize from URL on mount and when tabs change
  useEffect(() => {
    const validTabIds = new Set(tabs.map(t => t.id))

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const tabFromUrl = params.get('tab') || undefined
      if (tabFromUrl && validTabIds.has(tabFromUrl)) {
        setActiveTab(prev => (prev === tabFromUrl ? prev : tabFromUrl))
        return
      }
      // Ensure active tab is valid if tabs list changed
      const fallback = (defaultTab && validTabIds.has(defaultTab)) ? defaultTab : tabs[0]?.id
      if (fallback) {
        setActiveTab(prev => (prev === fallback ? prev : fallback))
      }
    }

    syncFromUrl()

    const onPopState = () => syncFromUrl()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [tabs, defaultTab])

  const updateTabInUrl = (tabId: string) => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tabId)
      const newUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`
      window.history.replaceState(null, '', newUrl)
    } catch {
      // no-op if URL cannot be updated
    }
  }

  if (!tabs.length) return null

  return (
    <div className={className}>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                updateTabInUrl(tab.id)
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs
