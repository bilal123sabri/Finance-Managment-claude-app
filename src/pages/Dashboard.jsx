import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, TrendUp, Percent, Plus, Wallet, ChartBar } from '@phosphor-icons/react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'

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

function ChangeLabel({ pct, positiveIsGood = true }) {
  if (pct === null || pct === undefined) return null
  const val = parseFloat(pct)
  const isPositive = val >= 0
  const isGood = positiveIsGood ? isPositive : !isPositive
  return (
    <p className={`text-xs font-medium mt-1.5 flex items-center gap-0.5 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight size={11} weight="bold" /> : <ArrowDownRight size={11} weight="bold" />}
      {isPositive ? '+' : ''}{pct}% vs last month
    </p>
  )
}

function StatCard({ label, value, changePct, positiveIsGood, Icon }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-zinc-500 text-xs font-medium">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
          <Icon size={14} color="#71717a" />
        </div>
      </div>
      <p className="text-zinc-100 text-2xl font-semibold font-mono tracking-tight">{value}</p>
      <ChangeLabel pct={changePct} positiveIsGood={positiveIsGood} />
    </motion.div>
  )
}

function getAuthName() {
  try {
    const raw = localStorage.getItem('ff_auth')
    const parsed = JSON.parse(raw)
    return parsed?.name?.split(' ')[0] || 'there'
  } catch { return 'there' }
}

export default function Dashboard({ onNavigate }) {
  const {
    transactions,
    currentMonthIncome,
    currentMonthExpenses,
    netSaved,
    savingsRate,
    srChangePct,
    incomeChangePct,
    expenseChangePct,
    netSavedChangePct,
    categorySpending,
    budgets,
    monthlyChartData,
  } = useFinance()

  const isEmpty   = transactions.length === 0
  const recentTx  = transactions.slice(0, 6)

  // Only show chart if at least one month has data
  const hasChartData = monthlyChartData.some(d => d.income > 0 || d.expenses > 0)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

      {/* Welcome banner — only when user has no transactions yet */}
      {isEmpty && (
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-emerald-500/10 to-zinc-900 border border-emerald-500/20 rounded-2xl p-6"
        >
          <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-1">Welcome to FinFlow</p>
          <h2 className="text-zinc-100 text-xl font-semibold">Hey {getAuthName()}, let's get started 👋</h2>
          <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
            Your dashboard is ready. Add your first transaction to start tracking your finances.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-5">
            {[
              { step: '1', title: 'Add a transaction', desc: 'Record income or an expense', icon: Plus,     cta: 'Use the + button in the top bar', action: null },
              { step: '2', title: 'Set up budgets',    desc: 'Create spending limits',      icon: Wallet,   cta: 'Go to Budgets →',               action: () => onNavigate('budgets') },
              { step: '3', title: 'View analytics',    desc: 'Charts update as you add data', icon: ChartBar, cta: 'Go to Analytics →',             action: () => onNavigate('analytics') },
            ].map(({ step, title, desc, icon: Icon, cta, action }) => (
              <div key={step} onClick={action || undefined}
                className={`bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors ${action ? 'cursor-pointer' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</span>
                  <Icon size={14} className="text-zinc-400" />
                  <p className="text-zinc-200 text-sm font-medium">{title}</p>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed mb-2">{desc}</p>
                <p className="text-emerald-400 text-xs font-medium">{cta}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Monthly Income"   value={`$${currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}   changePct={incomeChangePct}    positiveIsGood={true}  Icon={ArrowUpRight} />
        <StatCard label="Monthly Expenses" value={`$${currentMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} changePct={expenseChangePct}   positiveIsGood={false} Icon={ArrowDownRight} />
        <StatCard label="Net Saved"        value={`$${netSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}             changePct={netSavedChangePct}  positiveIsGood={true}  Icon={TrendUp} />
        <StatCard label="Savings Rate"     value={`${savingsRate}%`}                                                                changePct={srChangePct}        positiveIsGood={true}  Icon={Percent} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cash Flow — only real data, empty state if none */}
        <motion.div variants={fadeUp} className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-zinc-100 font-semibold text-sm">Cash Flow</h3>
              <p className="text-zinc-500 text-xs mt-0.5">7-month income vs spending</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-zinc-500">Income</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-zinc-500">Expenses</span></div>
            </div>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income"   name="Income"   stroke="#10b981" strokeWidth={2} fill="url(#gIncome)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
                <ChartBar size={18} color="#52525b" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">No data yet</p>
              <p className="text-zinc-600 text-xs mt-1">Add transactions to see your cash flow</p>
            </div>
          )}
        </motion.div>

        {/* Spending Donut */}
        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-zinc-100 font-semibold text-sm">Spending</h3>
          <p className="text-zinc-500 text-xs mt-0.5 mb-4">By category this month</p>
          {categorySpending.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={categorySpending} dataKey="spent" nameKey="label" cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} strokeWidth={0}>
                    {categorySpending.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, '']} contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categorySpending.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-zinc-400 text-xs flex-1 truncate">{cat.label}</span>
                    <span className="text-zinc-300 text-xs font-mono">${cat.spent.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[160px] text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
                <Percent size={18} color="#52525b" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">No spending yet</p>
              <p className="text-zinc-600 text-xs mt-1">Add expense transactions to see breakdown</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Recent Transactions */}
        <motion.div variants={fadeUp} className="xl:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-100 font-semibold text-sm">Recent Transactions</h3>
            <button onClick={() => onNavigate('transactions')} className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors cursor-pointer">View all</button>
          </div>
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
                <ArrowUpRight size={18} color="#52525b" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">No transactions yet</p>
              <p className="text-zinc-600 text-xs mt-1">Click + to add your first transaction</p>
            </div>
          ) : recentTx.map((tx, i) => {
            const isIncome = tx.amount > 0
            return (
              <div key={tx.id} className={`flex items-center gap-3 py-2.5 ${i < recentTx.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: isIncome ? 'rgba(16,185,129,0.1)' : '#27272a', color: isIncome ? '#34d399' : '#a1a1aa' }}>
                  {tx.description.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm truncate">{tx.description}</p>
                  <p className="text-zinc-600 text-xs">{format(parseISO(tx.date), 'MMM d, yyyy')}</p>
                </div>
                <span className={`font-mono text-sm font-semibold flex-shrink-0 ${isIncome ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* Budget Overview */}
        <motion.div variants={fadeUp} className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-100 font-semibold text-sm">Budgets</h3>
            <button onClick={() => onNavigate('budgets')} className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors cursor-pointer">Manage</button>
          </div>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
                <Wallet size={18} color="#52525b" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">No budgets set</p>
              <p className="text-zinc-600 text-xs mt-1">Go to Budgets to set spending limits</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 5).map(bud => {
                const pct  = Math.min((bud.spent / bud.limit) * 100, 100)
                const over = bud.spent > bud.limit
                return (
                  <div key={bud.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-zinc-400 text-xs">{bud.label}</span>
                      <span className={`text-xs font-mono ${over ? 'text-red-400' : 'text-zinc-500'}`}>
                        ${bud.spent.toFixed(0)} / ${bud.limit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: over ? '#f87171' : pct > 80 ? '#fbbf24' : bud.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
