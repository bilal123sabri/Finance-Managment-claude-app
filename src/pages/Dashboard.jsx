import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, TrendUp, Percent, Plus, Wallet, ChartBar } from '@phosphor-icons/react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'
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
    incomeChangePct,
    expenseChangePct,
    netSavedChangePct,
    categorySpending,
    budgets,
  } = useFinance()

  const isEmpty = transactions.length === 0

  const prevSavingsRate = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const prevSR = prevSavingsRate
    ? (((prevSavingsRate.income - prevSavingsRate.expenses) / prevSavingsRate.income) * 100).toFixed(1)
    : null
  const srChange = prevSR !== null
    ? (parseFloat(savingsRate) - parseFloat(prevSR)).toFixed(1)
    : null

  const recentTx = transactions.slice(0, 6)

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

      {/* Welcome banner — only shown when user has no data yet */}
      {isEmpty && (
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-emerald-500/10 to-zinc-900 border border-emerald-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest mb-1">Welcome to FinFlow</p>
              <h2 className="text-zinc-100 text-xl font-semibold">Hey {getAuthName()}, let's get started 👋</h2>
              <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
                Your dashboard is ready. Add your first transaction to start tracking your finances.
              </p>
            </div>
          </div>

          {/* Quick-start steps */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-5">
            {[
              {
                step: '1',
                title: 'Add a transaction',
                desc: 'Record income or an expense to get started',
                icon: Plus,
                action: () => {},
                cta: 'Use the + button in the top bar',
              },
              {
                step: '2',
                title: 'Set up budgets',
                desc: 'Create spending limits by category',
                icon: Wallet,
                action: () => onNavigate('budgets'),
                cta: 'Go to Budgets →',
              },
              {
                step: '3',
                title: 'View analytics',
                desc: 'See charts and trends once you have data',
                icon: ChartBar,
                action: () => onNavigate('analytics'),
                cta: 'Go to Analytics →',
              },
            ].map(({ step, title, desc, icon: Icon, action, cta }) => (
              <div
                key={step}
                onClick={action}
                className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </span>
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
        <StatCard
          label="Monthly Income"
          value={`$${currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          changePct={incomeChangePct}
          positiveIsGood={true}
          Icon={ArrowUpRight}
        />
        <StatCard
          label="Monthly Expenses"
          value={`$${currentMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          changePct={expenseChangePct}
          positiveIsGood={false}
          Icon={ArrowDownRight}
        />
        <StatCard
          label="Net Saved"
          value={`$${netSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          changePct={netSavedChangePct}
          positiveIsGood={true}
          Icon={TrendUp}
        />
        <StatCard
          label="Savings Rate"
          value={`${savingsRate}%`}
          changePct={srChange}
          positiveIsGood={true}
          Icon={Percent}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cash Flow Area */}
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
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#gIncome)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#gExpense)" />
            </AreaChart>
          </ResponsiveContainer>
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
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">No data yet</div>
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
          <div>
            {recentTx.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No transactions yet</p>
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
          </div>
        </motion.div>

        {/* Budget Overview */}
        <motion.div variants={fadeUp} className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-100 font-semibold text-sm">Budgets</h3>
            <button onClick={() => onNavigate('budgets')} className="text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors cursor-pointer">Manage</button>
          </div>
          {budgets.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No budgets set</p>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 5).map(bud => {
                const pct = Math.min((bud.spent / bud.limit) * 100, 100)
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
