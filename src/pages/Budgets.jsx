import { motion } from 'framer-motion'
import { Warning, CheckCircle, SmileySad } from '@phosphor-icons/react'
import { useFinance } from '../context/FinanceContext'

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

export default function Budgets() {
  const { budgets } = useFinance()

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
  const overCount   = budgets.filter(b => b.spent > b.limit).length
  const remaining   = totalBudget - totalSpent
  const totalPct    = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  return (
    <div className="space-y-5">
      {/* Summary Row */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-medium mb-2">Total Budgeted</p>
          <p className="text-zinc-100 text-2xl font-semibold font-mono tracking-tight">
            ${totalBudget.toLocaleString()}
          </p>
          <p className="text-zinc-600 text-xs mt-1">this month</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-medium mb-2">Total Spent</p>
          <p className="text-zinc-100 text-2xl font-semibold font-mono tracking-tight">
            ${totalSpent.toFixed(0)}
          </p>
          <p className={`text-xs mt-1 font-medium ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {remaining < 0
              ? `$${Math.abs(remaining).toFixed(0)} over total`
              : `$${remaining.toFixed(0)} remaining`}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-medium mb-2">Over Budget</p>
          <p className={`text-2xl font-semibold font-mono tracking-tight ${overCount > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
            {overCount}
          </p>
          <p className="text-zinc-600 text-xs mt-1">of {budgets.length} categories</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-medium mb-2">Overall Usage</p>
          <p className="text-zinc-100 text-2xl font-semibold font-mono tracking-tight">{totalPct.toFixed(0)}%</p>
          <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalPct}%` }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: totalPct > 100 ? '#f87171' : totalPct > 80 ? '#fbbf24' : '#10b981' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Budget Cards — 2-col grid on wide screens */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      >
        {budgets.map(bud => {
          const pct       = Math.min((bud.spent / bud.limit) * 100, 100)
          const over      = bud.spent > bud.limit
          const nearLimit = !over && pct >= 80
          const onTrack   = !over && pct < 80
          const leftover  = bud.limit - bud.spent

          return (
            <motion.div
              key={bud.id}
              variants={fadeUp}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: bud.color }} />
                  <span className="text-zinc-100 font-medium text-sm">{bud.label}</span>
                  {over && (
                    <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      <Warning size={9} weight="bold" /> Over budget
                    </span>
                  )}
                  {nearLimit && (
                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      <SmileySad size={9} weight="bold" /> Near limit
                    </span>
                  )}
                  {onTrack && (
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle size={9} weight="bold" /> On track
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-zinc-100 text-sm font-mono font-semibold">${bud.spent.toFixed(2)}</p>
                  <p className="text-zinc-600 text-xs font-mono">of ${bud.limit.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: over ? '#f87171' : nearLimit ? '#fbbf24' : bud.color }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-zinc-600 text-xs">{pct.toFixed(0)}% used</p>
                <p className={`text-xs font-mono font-medium ${over ? 'text-red-400' : 'text-zinc-500'}`}>
                  {over ? `$${Math.abs(leftover).toFixed(2)} over` : `$${leftover.toFixed(2)} left`}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
