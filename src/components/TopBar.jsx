import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, Bell, Plus, Warning, CheckCircle, X } from '@phosphor-icons/react'
import { useFinance } from '../context/FinanceContext'

const PAGE_META = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Your financial overview' },
  transactions: { title: 'Transactions', subtitle: 'Your complete money history' },
  budgets:      { title: 'Budgets',      subtitle: 'Monthly spending limits' },
  goals:        { title: 'Goals',        subtitle: 'Track your milestones' },
  analytics:    { title: 'Analytics',    subtitle: 'Patterns and insights' },
  accounts:     { title: 'Accounts',     subtitle: 'Your financial accounts' },
  settings:     { title: 'Settings',     subtitle: 'Manage your preferences' },
}

export default function TopBar({ activePage, globalSearch, onSearch, onAddTransaction }) {
  const { budgetAlerts, formatCurrency, appSettings } = useFinance()
  const userName = appSettings?.name || ''
  const initials = userName ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U'
  const { title, subtitle } = PAGE_META[activePage] || PAGE_META.dashboard
  const [showBell, setShowBell]     = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const bellRef = useRef(null)

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-[60px] px-8 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10 flex-shrink-0">
      <div>
        <h1 className="text-zinc-100 font-semibold text-base tracking-tight leading-none">{title}</h1>
        <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Search — navigates to Transactions and filters */}
        <motion.div
          animate={{ width: searchFocused ? 230 : 165 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative"
        >
          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={globalSearch}
            onChange={e => onSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search transactions..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-7 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {globalSearch && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </motion.div>

        {/* Notification Bell with real budget alerts */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowBell(v => !v)}
            className="relative w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <Bell size={15} />
            {budgetAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400" />
            )}
          </button>

          <AnimatePresence>
            {showBell && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
                exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.12 } }}
                className="absolute right-0 top-10 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-zinc-100 text-sm font-semibold">Alerts</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{budgetAlerts.length} budget notification{budgetAlerts.length !== 1 ? 's' : ''}</p>
                </div>

                {budgetAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <CheckCircle size={24} color="#34d399" className="mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm font-medium">All budgets on track</p>
                    <p className="text-zinc-600 text-xs mt-0.5">No alerts this month</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {budgetAlerts.map(alert => (
                      <div key={alert.id} className="px-4 py-3 flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${alert.over ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                          <Warning size={14} color={alert.over ? '#f87171' : '#fbbf24'} weight="bold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-xs font-medium">{alert.label}</p>
                          <p className={`text-xs mt-0.5 ${alert.over ? 'text-red-400' : 'text-amber-400'}`}>
                            {alert.over
                              ? `${formatCurrency(alert.spent - alert.limit)} over budget`
                              : `${alert.pct}% used — ${formatCurrency(alert.limit - alert.spent)} left`}
                          </p>
                          <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(alert.pct, 100)}%`,
                                background: alert.over ? '#f87171' : '#fbbf24',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Transaction */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          Add
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold text-xs cursor-pointer select-none">
          {initials}
        </div>
      </div>
    </header>
  )
}
