import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useFinance } from '../context/FinanceContext'
import { format } from 'date-fns'

export default function AddTransactionModal({ onClose }) {
  const { addTransaction, accounts, categories } = useFinance()

  const expenseCategories = categories.filter(c => c.id !== 'income')
  const incomeCategories  = categories.filter(c => c.id === 'income' || c.id === 'other' || c.custom)

  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: expenseCategories[0]?.id || '',
    account: accounts[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.description.trim()) e.description = 'Required'
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a positive amount'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const amount = parseFloat(form.amount)
    addTransaction({ ...form, amount: form.type === 'expense' ? -amount : amount })
    onClose()
  }

  const visibleCategories = form.type === 'income' ? incomeCategories : expenseCategories

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } }}
        exit={{ opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.15 } }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-[420px] shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-zinc-100 font-semibold text-base">New Transaction</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type toggle */}
            <div className="flex p-1 gap-1 bg-zinc-950 rounded-xl border border-zinc-800">
              {['expense', 'income'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const cats = type === 'income' ? incomeCategories : expenseCategories
                    set('type', type)
                    set('category', cats[0]?.id || '')
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                    form.type === type
                      ? type === 'expense'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-medium">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm pointer-events-none">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-zinc-800 border ${errors.amount ? 'border-red-500/60' : 'border-zinc-700'} rounded-xl pl-7 pr-3 py-2.5 text-zinc-100 font-mono text-sm focus:outline-none focus:border-zinc-500 transition-colors`}
                />
              </div>
              {errors.amount && <p className="text-red-400 text-xs">{errors.amount}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-medium">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="What was this for?"
                className={`w-full bg-zinc-800 border ${errors.description ? 'border-red-500/60' : 'border-zinc-700'} rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors placeholder-zinc-600`}
              />
              {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-medium">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {visibleCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Account + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium">Account</label>
                <select
                  value={form.account}
                  onChange={e => set('account', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name.split(' ').slice(0, 2).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-colors cursor-pointer"
              >
                Save Transaction
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}
