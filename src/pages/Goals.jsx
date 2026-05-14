import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash, Pencil, X, Target, Trophy, SealCheck,
  Wallet, Shield, TrendUp, Gift, CreditCard, Airplane,
  GraduationCap, House, Flag, Rocket, PiggyBank, Flame,
  Calendar, Clock, Warning, CheckCircle, DotsThree, Confetti,
} from '@phosphor-icons/react'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'
import { useFinance } from '../context/FinanceContext'

// ─── Goal types ────────────────────────────────────────────────────────────
const GOAL_TYPES = [
  { id: 'savings',    label: 'Savings',       Icon: PiggyBank,      color: '#10b981' },
  { id: 'emergency',  label: 'Emergency Fund', Icon: Shield,         color: '#ef4444' },
  { id: 'investment', label: 'Investment',     Icon: TrendUp,        color: '#3b82f6' },
  { id: 'purchase',   label: 'Purchase',       Icon: Gift,           color: '#f59e0b' },
  { id: 'debt',       label: 'Debt Payoff',    Icon: CreditCard,     color: '#8b5cf6' },
  { id: 'travel',     label: 'Travel',         Icon: Airplane,       color: '#06b6d4' },
  { id: 'education',  label: 'Education',      Icon: GraduationCap,  color: '#a855f7' },
  { id: 'home',       label: 'Home',           Icon: House,          color: '#f97316' },
  { id: 'retirement', label: 'Retirement',     Icon: Wallet,         color: '#14b8a6' },
  { id: 'other',      label: 'Other',          Icon: Target,         color: '#71717a' },
]

const GOAL_TYPE_MAP = Object.fromEntries(GOAL_TYPES.map(t => [t.id, t]))

// ─── Animations ────────────────────────────────────────────────────────────
const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function getStatus(goal) {
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
  if (pct >= 100) return 'completed'
  const target = parseISO(goal.targetDate)
  if (isPast(target)) return 'overdue'
  const created = parseISO(goal.createdAt)
  const totalDays   = differenceInDays(target, created) || 1
  const elapsedDays = differenceInDays(new Date(), created)
  const expectedPct = Math.min((elapsedDays / totalDays) * 100, 100)
  return pct >= expectedPct - 15 ? 'on-track' : 'at-risk'
}

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', Icon: SealCheck    },
  'on-track': { label: 'On Track', color: 'text-emerald-400', bg: 'bg-emerald-500/10', Icon: CheckCircle  },
  'at-risk':  { label: 'At Risk',  color: 'text-amber-400',   bg: 'bg-amber-500/10',   Icon: Warning       },
  overdue:    { label: 'Overdue',  color: 'text-red-400',     bg: 'bg-red-500/10',     Icon: Clock         },
}

// ─── Empty field default ───────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', type: 'savings',
  targetAmount: '', currentAmount: '0',
  targetDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
}

// ─── Goal Modal ────────────────────────────────────────────────────────────
function GoalModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })) }

  const validate = () => {
    const e = {}
    if (!form.title.trim())                                e.title         = 'Required'
    if (!form.targetAmount || isNaN(+form.targetAmount) || +form.targetAmount <= 0) e.targetAmount  = 'Enter a valid amount'
    if (isNaN(+form.currentAmount) || +form.currentAmount < 0)                      e.currentAmount = 'Enter a valid amount'
    if (!form.targetDate)                                  e.targetDate    = 'Required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, targetAmount: +form.targetAmount, currentAmount: +form.currentAmount })
  }

  const inputClass = (err) =>
    `w-full bg-zinc-800 border ${err ? 'border-red-500/50' : 'border-zinc-700'} rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all`

  const selectedType = GOAL_TYPE_MAP[form.type]

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
        exit={{ opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.15 } }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <div className="flex items-center gap-3">
              {selectedType && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${selectedType.color}20` }}>
                  <selectedType.Icon size={16} style={{ color: selectedType.color }} />
                </div>
              )}
              <h2 className="text-zinc-100 font-semibold text-base">{initial ? 'Edit Goal' : 'New Goal'}</h2>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors">
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Goal type grid */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-2.5">Goal type</label>
              <div className="grid grid-cols-5 gap-2">
                {GOAL_TYPES.map(({ id, label, Icon, color }) => (
                  <button key={id} type="button" onClick={() => set('type', id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                      form.type === id
                        ? 'border-transparent'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                    style={form.type === id ? { background: `${color}18`, borderColor: `${color}50` } : {}}
                  >
                    <Icon size={18} style={{ color: form.type === id ? color : '#52525b' }} />
                    <span className="text-[9px] font-medium leading-tight text-center"
                      style={{ color: form.type === id ? color : '#71717a' }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Goal title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Emergency Fund, Dream Vacation…"
                className={inputClass(errors.title)} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-1.5">
                Description <span className="text-zinc-600 normal-case">(optional)</span>
              </label>
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="What are you saving for?"
                className={inputClass(false)} />
            </div>

            {/* Amounts row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Target amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">$</span>
                  <input type="number" min="0" step="0.01" value={form.targetAmount}
                    onChange={e => set('targetAmount', e.target.value)}
                    placeholder="10,000"
                    className={inputClass(errors.targetAmount) + ' pl-7'} />
                </div>
                {errors.targetAmount && <p className="text-red-400 text-xs mt-1">{errors.targetAmount}</p>}
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Already saved</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">$</span>
                  <input type="number" min="0" step="0.01" value={form.currentAmount}
                    onChange={e => set('currentAmount', e.target.value)}
                    placeholder="0"
                    className={inputClass(errors.currentAmount) + ' pl-7'} />
                </div>
                {errors.currentAmount && <p className="text-red-400 text-xs mt-1">{errors.currentAmount}</p>}
              </div>
            </div>

            {/* Target date */}
            <div>
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wide block mb-1.5">Target date</label>
              <input type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
                className={inputClass(errors.targetDate)} />
              {errors.targetDate && <p className="text-red-400 text-xs mt-1">{errors.targetDate}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 text-sm font-medium transition-colors">
                Cancel
              </button>
              <motion.button whileTap={{ scale: 0.98 }} type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors">
                {initial ? 'Save changes' : 'Create goal'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── Contribute Modal ──────────────────────────────────────────────────────
function ContributeModal({ goal, onContribute, onClose }) {
  const [amount, setAmount] = useState('')
  const [error, setError]   = useState('')
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
  const typeInfo  = GOAL_TYPE_MAP[goal.type]
  const { formatCurrency } = useFinance()

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val <= 0) { setError('Enter a valid amount'); return }
    onContribute(val)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
        exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              {typeInfo && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${typeInfo.color}20` }}>
                  <typeInfo.Icon size={14} style={{ color: typeInfo.color }} />
                </div>
              )}
              <h2 className="text-zinc-100 font-semibold text-sm">Add contribution</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors">
              <X size={13} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-zinc-500 text-xs mb-3">
                <span className="text-zinc-300 font-medium">{goal.title}</span>
                {' '}· {formatCurrency(remaining)} remaining
              </p>
              <label className="text-zinc-400 text-xs font-medium block mb-1.5">Amount to add</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">$</span>
                <input type="number" min="0.01" step="0.01" value={amount}
                  onChange={e => { setAmount(e.target.value); setError('') }}
                  placeholder="0.00" autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-7 pr-3 py-2.5 text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
              </div>
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              {/* Quick amounts */}
              <div className="flex gap-2 mt-3">
                {[50, 100, 250, 500].filter(v => v <= remaining + 1).map(v => (
                  <button key={v} type="button" onClick={() => { setAmount(String(v)); setError('') }}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors">
                    +${v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors">
                Cancel
              </button>
              <motion.button whileTap={{ scale: 0.98 }} type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors">
                Contribute
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ─── Goal Card ─────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { formatCurrency } = useFinance()
  const typeInfo  = GOAL_TYPE_MAP[goal.type] || GOAL_TYPE_MAP.other
  const status    = getStatus(goal)
  const statusCfg = STATUS_CONFIG[status]
  const pct       = Math.min(goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0, 100)
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
  const daysLeft  = differenceInDays(parseISO(goal.targetDate), new Date())
  const isCompleted = status === 'completed'

  return (
    <motion.div variants={fadeUp}
      className={`relative bg-zinc-900 border rounded-2xl overflow-hidden transition-colors hover:border-zinc-700 ${
        isCompleted ? 'border-emerald-500/30' : 'border-zinc-800'
      }`}>

      {/* Completion shimmer */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${typeInfo.color}18` }}>
              <typeInfo.Icon size={20} style={{ color: typeInfo.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${statusCfg.bg} ${statusCfg.color} flex items-center gap-1`}>
                  <statusCfg.Icon size={9} weight="bold" />
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-zinc-500 text-[10px] capitalize">{typeInfo.label}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-7 h-7 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 flex items-center justify-center transition-colors">
              <DotsThree size={16} weight="bold" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-8 z-20 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden w-36"
                  >
                    <button onClick={() => { onEdit(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors">
                      <Pencil size={12} /> Edit goal
                    </button>
                    <button onClick={() => { onDelete(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash size={12} /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title + desc */}
        <h3 className="text-zinc-100 font-semibold text-base leading-tight">{goal.title}</h3>
        {goal.description && (
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">{goal.description}</p>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: isCompleted ? '#10b981' : typeInfo.color, opacity: 0.9 }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-zinc-600 text-[10px]">{pct.toFixed(1)}% complete</span>
            <span className="text-zinc-600 text-[10px] font-mono">{formatCurrency(remaining)} to go</span>
          </div>
        </div>

        {/* Amount display */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">Saved</p>
            <p className="text-zinc-100 text-xl font-semibold font-mono tracking-tight">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">Target</p>
            <p className="text-zinc-400 text-xl font-semibold font-mono tracking-tight">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
            <Calendar size={11} />
            <span>{format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
            {!isCompleted && (
              <span className={`ml-1 ${daysLeft < 0 ? 'text-red-400' : daysLeft < 30 ? 'text-amber-400' : 'text-zinc-600'}`}>
                · {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            )}
            {isCompleted && <span className="ml-1 text-emerald-400">· Done!</span>}
          </div>

          {!isCompleted && (
            <button onClick={onContribute}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}
              onMouseEnter={e => e.currentTarget.style.background = `${typeInfo.color}25`}
              onMouseLeave={e => e.currentTarget.style.background = `${typeInfo.color}15`}
            >
              <Plus size={11} weight="bold" /> Contribute
            </button>
          )}

          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <SealCheck size={13} weight="fill" /> Achieved
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, formatCurrency } = useFinance()

  const [showAdd,        setShowAdd]        = useState(false)
  const [editingGoal,    setEditingGoal]    = useState(null)
  const [contributingTo, setContributingTo] = useState(null)
  const [filter,         setFilter]         = useState('all') // all | active | completed

  const allGoals  = goals || []
  const completed = allGoals.filter(g => getStatus(g) === 'completed')
  const active    = allGoals.filter(g => getStatus(g) !== 'completed')

  const filtered = filter === 'completed' ? completed
                 : filter === 'active'    ? active
                 : allGoals

  const totalTarget  = allGoals.reduce((s, g) => s + g.targetAmount,  0)
  const totalSaved   = allGoals.reduce((s, g) => s + g.currentAmount, 0)
  const overallPct   = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

  const handleSave = (form) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, form)
      setEditingGoal(null)
    } else {
      addGoal(form)
      setShowAdd(false)
    }
  }

  const handleContribute = (amount) => {
    const g = contributingTo
    updateGoal(g.id, { currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) })
    setContributingTo(null)
  }

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 text-xl font-semibold">Goals</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Track your financial milestones</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus size={16} weight="bold" /> New Goal
        </motion.button>
      </motion.div>

      {/* Summary row */}
      {allGoals.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total Goals',  value: allGoals.length,         suffix: '',   color: 'text-zinc-100', Icon: Target    },
            { label: 'Completed',    value: completed.length,        suffix: '',   color: 'text-emerald-400', Icon: Trophy },
            { label: 'Total Saved',  value: formatCurrency(totalSaved),   suffix: null, color: 'text-zinc-100', Icon: PiggyBank },
            { label: 'Total Target', value: formatCurrency(totalTarget),  suffix: null, color: 'text-zinc-100', Icon: Flag      },
          ].map(({ label, value, color, Icon: Ic }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-zinc-500 text-xs font-medium">{label}</p>
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Ic size={14} color="#71717a" />
                </div>
              </div>
              <p className={`text-2xl font-semibold font-mono tracking-tight ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Overall progress bar */}
      {allGoals.length > 0 && (
        <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-300 text-sm font-medium">Overall progress</p>
            <p className="text-zinc-100 text-sm font-semibold font-mono">{overallPct.toFixed(1)}%</p>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-zinc-600 text-xs font-mono">{formatCurrency(totalSaved)} saved</p>
            <p className="text-zinc-600 text-xs font-mono">{formatCurrency(totalTarget)} target</p>
          </div>
        </motion.div>
      )}

      {/* Filter tabs */}
      {allGoals.length > 0 && (
        <motion.div variants={fadeUp} className="flex p-0.5 gap-0.5 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          {[['all', 'All'], ['active', 'Active'], ['completed', 'Completed']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                filter === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {key === 'all' ? allGoals.length : key === 'active' ? active.length : completed.length}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Goal cards grid */}
      {filtered.length > 0 ? (
        <motion.div variants={stagger} initial="initial" animate="animate"
          className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => deleteGoal(goal.id)}
                onContribute={() => setContributingTo(goal)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : allGoals.length === 0 ? (
        /* Empty state — no goals at all */
        <motion.div variants={fadeUp}
          className="flex flex-col items-center justify-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <Rocket size={28} color="#52525b" />
          </div>
          <h3 className="text-zinc-300 font-semibold text-lg mb-1">No goals yet</h3>
          <p className="text-zinc-600 text-sm max-w-xs leading-relaxed mb-6">
            Set a financial goal — an emergency fund, dream vacation, home down payment — and track your progress here.
          </p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl px-5 py-2.5 transition-colors">
            <Plus size={15} weight="bold" /> Create your first goal
          </motion.button>
        </motion.div>
      ) : (
        /* Empty filtered state */
        <motion.div variants={fadeUp}
          className="flex flex-col items-center justify-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
          <p className="text-zinc-500 text-sm">No {filter} goals</p>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(showAdd || editingGoal) && (
          <GoalModal
            initial={editingGoal ? {
              ...editingGoal,
              targetAmount:  String(editingGoal.targetAmount),
              currentAmount: String(editingGoal.currentAmount),
            } : null}
            onSave={handleSave}
            onClose={() => { setShowAdd(false); setEditingGoal(null) }}
          />
        )}
        {contributingTo && (
          <ContributeModal
            goal={contributingTo}
            onContribute={handleContribute}
            onClose={() => setContributingTo(null)}
          />
        )}
      </AnimatePresence>

    </motion.div>
  )
}
