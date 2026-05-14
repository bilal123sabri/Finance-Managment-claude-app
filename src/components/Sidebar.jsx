import { motion } from 'framer-motion'
import {
  ChartPie, ArrowsLeftRight, Wallet, ChartLineUp,
  CreditCard, Gear, SignOut, Flag,
} from '@phosphor-icons/react'
import { useFinance } from '../context/FinanceContext'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    Icon: ChartPie },
  { id: 'transactions', label: 'Transactions', Icon: ArrowsLeftRight },
  { id: 'budgets',      label: 'Budgets',      Icon: Wallet },
  { id: 'goals',        label: 'Goals',        Icon: Flag },
  { id: 'analytics',   label: 'Analytics',    Icon: ChartLineUp },
  { id: 'accounts',    label: 'Accounts',     Icon: CreditCard },
]

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  const { totalBalance, netWorthChange, netWorthChangePct } = useFinance()

  const isPositiveChange = netWorthChange >= 0
  const changePctSign = isPositiveChange ? '+' : '-'

  return (
    <aside className="w-[260px] h-screen sticky top-0 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 10 L6 7 L9 9 L13 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="13" cy="5" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="text-zinc-100 font-semibold text-lg tracking-tight">FinFlow</span>
        </div>
      </div>

      {/* Net Worth Card — all values from context */}
      <div className="mx-4 mt-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/40">
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium">Net Worth</p>
        <p className="text-zinc-100 text-xl font-semibold font-mono mt-1 tracking-tight">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isPositiveChange ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-medium ${isPositiveChange ? 'text-emerald-400' : 'text-red-400'}`}>
            {changePctSign}{netWorthChangePct}% this month
          </span>
        </div>
        <p className={`text-xs font-mono mt-0.5 ${isPositiveChange ? 'text-zinc-500' : 'text-red-400/60'}`}>
          {isPositiveChange ? '+' : '-'}${Math.abs(netWorthChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-5">
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-medium px-3 mb-2">Menu</p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activePage === id
            return (
              <li key={id}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={17} weight={isActive ? 'fill' : 'regular'} color={isActive ? '#34d399' : '#71717a'} />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarDot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-zinc-800 space-y-0.5">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Gear size={17} color="#71717a" />
          Settings
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <SignOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
