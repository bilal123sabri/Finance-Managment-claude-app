import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bank, PiggyBank, ChartLineUp, TrendUp, TrendDown } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

const TYPE_ICONS  = { checking: Bank, savings: PiggyBank, investment: ChartLineUp }
const TYPE_LABELS = { checking: 'Checking', savings: 'Savings', investment: 'Investment' }

export default function Accounts() {
  const { accounts, transactions, totalBalance, netWorthChange, netWorthChangePct, formatCurrency } = useFinance()

  const now      = new Date()
  const thisMonth = now.getMonth()
  const thisYear  = now.getFullYear()

  // Per-account: recent transactions + this-month net change
  const accountStats = useMemo(() =>
    accounts.map(acc => {
      const allTx = transactions.filter(t => t.account === acc.id)
      const monthTx = allTx.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })
      const monthlyChange = monthTx.reduce((s, t) => s + t.amount, 0)
      const recentTx = [...allTx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)
      return { ...acc, monthlyChange, recentTx }
    }),
    [accounts, transactions, thisMonth, thisYear]
  )

  const isPositiveNW = netWorthChange >= 0

  return (
    <div className="space-y-5">
      {/* Net Worth Hero — all values from context */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-2">Total Net Worth</p>
            <p className="text-zinc-100 text-4xl font-semibold font-mono tracking-tight">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1.5 ${isPositiveNW ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositiveNW ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
              <span className="text-sm font-semibold font-mono">
                {isPositiveNW ? '+' : '-'}{formatCurrency(Math.abs(netWorthChange))}
              </span>
            </div>
            <p className="text-zinc-600 text-xs mt-0.5">
              {isPositiveNW ? '+' : '-'}{netWorthChangePct}% this month
            </p>
          </div>
        </div>

        {/* Account breakdown bar */}
        <div className="mt-5 pt-5 border-t border-zinc-800">
          {/* Proportional width segments */}
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-4">
            {accountStats.map(acc => (
              <div
                key={acc.id}
                className="h-full rounded-full"
                style={{
                  width: `${(acc.balance / totalBalance) * 100}%`,
                  background: acc.accent,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {accountStats.map(acc => (
              <div key={acc.id}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: acc.accent }} />
                  <p className="text-zinc-500 text-xs capitalize">{acc.type}</p>
                </div>
                <p className="text-zinc-100 text-base font-semibold font-mono tracking-tight">
                  {formatCurrency(acc.balance, 0, 0)}
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {((acc.balance / totalBalance) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Account Cards */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {accountStats.map(acc => {
          const Icon = TYPE_ICONS[acc.type] || Bank
          const isPositive = acc.monthlyChange >= 0

          return (
            <motion.div
              key={acc.id}
              variants={fadeUp}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {/* Card header */}
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${acc.accent}18` }}>
                    <Icon size={20} style={{ color: acc.accent }} />
                  </div>
                  <span className="text-zinc-600 text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded-md">
                    •••• {acc.lastFour}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-medium capitalize mb-0.5">{TYPE_LABELS[acc.type] || acc.type}</p>
                <p className="text-zinc-300 text-sm leading-tight">{acc.name}</p>
                <p className="text-zinc-100 text-2xl font-semibold font-mono tracking-tight mt-2">
                  {formatCurrency(acc.balance)}
                </p>
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                  {isPositive ? '+' : '-'}{formatCurrency(Math.abs(acc.monthlyChange))} this month
                </div>
              </div>

              {/* Recent transactions for this account */}
              <div className="p-4">
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-medium mb-2.5">Recent Activity</p>
                {acc.recentTx.length > 0 ? (
                  <div className="space-y-2">
                    {acc.recentTx.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs truncate flex-1 pr-2">{tx.description}</span>
                        <span className={`text-xs font-mono flex-shrink-0 ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {tx.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), 0, 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-700 text-xs">No transactions for this account</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
