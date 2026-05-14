import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { MONTHLY_DATA } from '../data/mockData'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-zinc-500 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-medium" style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { categorySpending, currentMonthIncome, currentMonthExpenses, savingsRate } = useFinance()

  // Enrich MONTHLY_DATA with net & savings rate (always computed, never hardcoded)
  const enriched = MONTHLY_DATA.map(d => ({
    ...d,
    net: d.income - d.expenses,
    savingsRate: Math.round(((d.income - d.expenses) / d.income) * 100),
  }))

  // Replace last entry's income/expenses with actual current month data
  const chartData = enriched.map((d, i) =>
    i === enriched.length - 1
      ? { ...d, income: Math.round(currentMonthIncome), expenses: Math.round(currentMonthExpenses), net: Math.round(currentMonthIncome - currentMonthExpenses), savingsRate: Math.round(parseFloat(savingsRate)) }
      : d
  )

  const totalCatSpend = categorySpending.reduce((s, c) => s + c.spent, 0)
  const maxSR = Math.max(...chartData.map(d => d.savingsRate), 1)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
      {/* Top Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Comparison Bar */}
        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-zinc-100 font-semibold text-sm">Monthly Comparison</h3>
          <p className="text-zinc-500 text-xs mt-0.5 mb-5">Income vs expenses — last 7 months</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} barGap={4} margin={{ top: 0, right: 4, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income"   name="Income"   fill="#10b981" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Net Savings Trend */}
        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-zinc-100 font-semibold text-sm">Net Savings Trend</h3>
          <p className="text-zinc-500 text-xs mt-0.5 mb-5">Monthly net savings over 7 months</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData} margin={{ top: 0, right: 4, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="net" name="Net Saved" stroke="#10b981" strokeWidth={2.5}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#34d399' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-zinc-100 font-semibold text-sm">Spending by Category</h3>
        <p className="text-zinc-500 text-xs mt-0.5 mb-5">This month's full breakdown</p>
        {categorySpending.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={Math.max(categorySpending.length * 36, 160)}>
              <BarChart data={categorySpending} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={88} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]}>
                  {categorySpending.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {categorySpending.map((cat, i) => {
                const pct = totalCatSpend > 0 ? ((cat.spent / totalCatSpend) * 100).toFixed(1) : '0.0'
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-zinc-300 text-sm flex-1">{cat.label}</span>
                      <span className="text-zinc-500 text-xs font-mono">{pct}%</span>
                      <span className="text-zinc-200 text-sm font-mono font-medium w-20 text-right">${cat.spent.toFixed(2)}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full ml-5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: cat.color, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">No spending data this month</div>
        )}
      </motion.div>

      {/* Savings Rate by Month */}
      <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-zinc-100 font-semibold text-sm">Savings Rate</h3>
        <p className="text-zinc-500 text-xs mt-0.5 mb-5">% of income saved each month — computed from actual data</p>
        <div className="flex items-end gap-3 h-32">
          {chartData.map((d, i) => {
            const heightPct = maxSR > 0 ? (d.savingsRate / maxSR) * 100 : 0
            const isGood = d.savingsRate >= 20
            const isCurrent = i === chartData.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-zinc-500 text-[10px] font-mono">{d.savingsRate}%</span>
                <div className="w-full flex items-end" style={{ height: 72 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 4)}%` }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-t-lg"
                    style={{
                      background: isGood ? '#10b981' : '#f59e0b',
                      opacity: isCurrent ? 1 : 0.65,
                      minHeight: 4,
                    }}
                  />
                </div>
                <span className={`text-[10px] ${isCurrent ? 'text-zinc-300 font-medium' : 'text-zinc-600'}`}>{d.month}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-zinc-500">≥20% target</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-zinc-500">Below target</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-zinc-600" /><span className="text-zinc-500">Current month</span></div>
        </div>
      </motion.div>
    </motion.div>
  )
}
