import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, Trash, FunnelSimple } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'

const stagger = { animate: { transition: { staggerChildren: 0.05 } } }
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 20 } },
}

export default function Transactions({ globalSearch = '' }) {
  const { transactions, deleteTransaction, categories, formatCurrency } = useFinance()

  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter,  setCatFilter]  = useState('all')
  const [search, setSearch] = useState(globalSearch)

  // Sync local search with the global search prop (from TopBar)
  useEffect(() => {
    setSearch(globalSearch)
  }, [globalSearch])

  const filtered = useMemo(() =>
    transactions
      .filter(tx => {
        if (typeFilter === 'income'  && tx.type !== 'income')  return false
        if (typeFilter === 'expense' && tx.type !== 'expense') return false
        if (catFilter !== 'all' && tx.category !== catFilter)  return false
        if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions, typeFilter, catFilter, search]
  )

  // Compute summary for filtered set
  const summary = useMemo(() => {
    const income   = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
    return { income, expenses, net: income - expenses }
  }, [filtered])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(tx => {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date].push(tx)
    })
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filtered])

  const getCat = (id) => categories.find(c => c.id === id)

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income',   val: summary.income,   color: 'text-emerald-400' },
          { label: 'Total Expenses', val: summary.expenses, color: 'text-red-400' },
          { label: 'Net',            val: summary.net,      color: summary.net >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-zinc-500 text-xs font-medium mb-1">{label}</p>
            <p className={`text-lg font-semibold font-mono tracking-tight ${color}`}>
              {val < 0 ? '-' : val > 0 && label === 'Net' ? '+' : ''}{formatCurrency(Math.abs(val))}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type tabs */}
        <div className="flex p-0.5 gap-0.5 bg-zinc-900 border border-zinc-800 rounded-xl">
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                typeFilter === f ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-400 text-xs focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
        >
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        {/* Local search */}
        <div className="relative">
          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter results..."
            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors w-48"
          />
        </div>

        {(typeFilter !== 'all' || catFilter !== 'all' || search) && (
          <button
            onClick={() => { setTypeFilter('all'); setCatFilter('all'); setSearch('') }}
            className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors cursor-pointer underline underline-offset-2"
          >
            Clear filters
          </button>
        )}

        <span className="text-zinc-600 text-xs ml-auto">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <FunnelSimple size={32} color="#3f3f46" className="mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No transactions found</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or add a new transaction</p>
        </div>
      )}

      {/* Grouped Transaction List */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
        {grouped.map(([date, txs]) => (
          <motion.div key={date} variants={fadeUp}>
            <div className="flex items-center gap-3 mb-2 px-1">
              <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-widest">
                {format(parseISO(date), 'EEEE, MMMM d')}
              </p>
              <div className="flex-1 h-px bg-zinc-800" />
              <p className="text-zinc-700 text-[10px] font-mono">
                {txs.reduce((s, t) => s + t.amount, 0) >= 0 ? '+' : ''}
                {formatCurrency(txs.reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <AnimatePresence>
                {txs.map((tx, i) => {
                  const isIncome = tx.amount > 0
                  const cat = getCat(tx.category)
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
                      className={`flex items-center gap-4 px-5 py-3.5 group hover:bg-zinc-800/30 transition-colors ${
                        i < txs.length - 1 ? 'border-b border-zinc-800' : ''
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: cat ? `${cat.color}18` : '#27272a', color: cat?.color || '#a1a1aa' }}
                      >
                        {tx.description.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-100 text-sm font-medium truncate">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {cat && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                              style={{ background: `${cat.color}15`, color: cat.color }}
                            >
                              {cat.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`font-mono text-sm font-semibold ${isIncome ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                        </span>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
