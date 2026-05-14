import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bell, Database, FloppyDisk, Trash,
  CheckCircle, Globe, Tag, Plus, X, PencilSimple,
} from '@phosphor-icons/react'
import { useFinance } from '../context/FinanceContext'

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e',
  '#ef4444','#f97316','#f59e0b','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#3b82f6','#71717a','#e879f9',
]

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
}

const STORAGE_KEY = 'ff_settings'

function getAuthUser() {
  try {
    const raw = localStorage.getItem('ff_auth')
    if (!raw) return { name: '', email: '' }
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' ? parsed : { name: '', email: '' }
  } catch { return { name: '', email: '' } }
}

const DEFAULT_SETTINGS = {
  name:              '',
  email:             '',
  currency:          'USD',
  dateFormat:        'MM/DD/YYYY',
  alertsEnabled:     true,
  budgetAlerts:      true,
  weeklyDigest:      false,
  lowBalanceAlert:   true,
  lowBalanceAmount:  500,
  theme:             'dark',
  compactMode:       false,
}

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div variants={fadeUp} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
          <Icon size={16} className="text-emerald-400" />
        </div>
        <h3 className="text-zinc-100 font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-zinc-200 text-sm font-medium">{label}</p>
        {description && <p className="text-zinc-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-zinc-400 text-xs font-medium block mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function CategoryManager() {
  const { categories, addCategory, deleteCategory, updateCategory } = useFinance()

  const [newLabel, setNewLabel]   = useState('')
  const [newColor, setNewColor]   = useState(PRESET_COLORS[0])
  const [editId,   setEditId]     = useState(null)
  const [editColor, setEditColor] = useState('')
  const [error, setError]         = useState('')

  const handleAdd = () => {
    const trimmed = newLabel.trim()
    if (!trimmed) { setError('Name is required'); return }
    const dupe = categories.some(c => c.label.toLowerCase() === trimmed.toLowerCase())
    if (dupe) { setError('A category with this name already exists'); return }
    addCategory({ label: trimmed, color: newColor })
    setNewLabel('')
    setNewColor(PRESET_COLORS[0])
    setError('')
  }

  const startEdit = (cat) => {
    setEditId(cat.id)
    setEditColor(cat.color)
  }

  const commitEdit = (id) => {
    updateCategory(id, { color: editColor })
    setEditId(null)
  }

  const defaultIds = new Set(['housing','food','transport','health','entertainment','shopping','utilities','income','other'])

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {categories.map(cat => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.18 } }}
              className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50"
            >
              {/* Color dot / edit swatch */}
              {editId === cat.id ? (
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                      style={{
                        background: c,
                        outline: editColor === c ? `2px solid ${c}` : '2px solid transparent',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-zinc-200 text-sm flex-1">{cat.label}</span>
                  {!cat.custom && defaultIds.has(cat.id) && (
                    <span className="text-zinc-600 text-[10px] font-medium bg-zinc-800 px-1.5 py-0.5 rounded-md">Default</span>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {editId === cat.id ? (
                  <>
                    <button
                      onClick={() => commitEdit(cat.id)}
                      className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center transition-colors"
                    >
                      <CheckCircle size={13} weight="bold" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="w-7 h-7 rounded-lg bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      title="Edit color"
                      className="w-7 h-7 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                      <PencilSimple size={12} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      title="Delete category"
                      className="w-7 h-7 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    >
                      <Trash size={12} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add new */}
      <div className="pt-1 border-t border-zinc-800">
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-medium mb-3">Add new category</p>

        {/* Color swatches */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                outline: newColor === c ? `2px solid ${c}` : '2px solid transparent',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        {/* Name input + button */}
        <div className="flex gap-2">
          <div className="flex items-center gap-2 flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/50 transition-colors">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: newColor }} />
            <input
              value={newLabel}
              onChange={e => { setNewLabel(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Category name"
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl px-4 transition-colors flex-shrink-0"
          >
            <Plus size={14} weight="bold" /> Add
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1.5">{error}</p>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const { resetData } = useFinance()

  const [settings, setSettings] = useState(() => {
    try {
      const authUser = getAuthUser()
      const stored   = localStorage.getItem(STORAGE_KEY)
      const base     = { ...DEFAULT_SETTINGS, name: authUser.name, email: authUser.email }
      return stored ? { ...base, ...JSON.parse(stored) } : base
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  const [saved, setSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    // Keep ff_auth user info in sync
    const auth = getAuthUser()
    localStorage.setItem('ff_auth', JSON.stringify({ ...auth, name: settings.name, email: settings.email }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (showResetConfirm) {
      resetData()
    } else {
      setShowResetConfirm(true)
      setTimeout(() => setShowResetConfirm(false), 4000)
    }
  }

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
  const selectClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 text-xl font-semibold">Settings</h2>
          <p className="text-zinc-500 text-sm mt-0.5">Manage your account and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl px-4 py-2 transition-colors"
        >
          {saved
            ? <><CheckCircle size={15} weight="bold" /> Saved!</>
            : <><FloppyDisk size={15} weight="bold" /> Save changes</>
          }
        </button>
      </motion.div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Field label="Display name">
            <input
              value={settings.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </Field>
          <Field label="Email address">
            <input
              type="email"
              value={settings.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences" icon={Globe}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Field label="Currency">
            <select value={settings.currency} onChange={e => set('currency', e.target.value)} className={selectClass}>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="PKR">PKR — Pakistani Rupee (₨)</option>
              <option value="CAD">CAD — Canadian Dollar (CA$)</option>
              <option value="AUD">AUD — Australian Dollar (A$)</option>
            </select>
          </Field>
          <Field label="Date format">
            <select value={settings.dateFormat} onChange={e => set('dateFormat', e.target.value)} className={selectClass}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </Field>
        </div>

        <div className="pt-2 space-y-4 border-t border-zinc-800">
          <Toggle
            label="Compact mode"
            description="Reduce padding and card sizes for more dense layout"
            checked={settings.compactMode}
            onChange={v => set('compactMode', v)}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-4">
          <Toggle
            label="Enable notifications"
            description="Master toggle for all notification types"
            checked={settings.alertsEnabled}
            onChange={v => set('alertsEnabled', v)}
          />
          <div className={`space-y-4 transition-opacity ${settings.alertsEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="h-px bg-zinc-800" />
            <Toggle
              label="Budget alerts"
              description="Alert when a category reaches 80% of its budget"
              checked={settings.budgetAlerts}
              onChange={v => set('budgetAlerts', v)}
            />
            <Toggle
              label="Weekly digest"
              description="Summary of income, expenses and savings every Monday"
              checked={settings.weeklyDigest}
              onChange={v => set('weeklyDigest', v)}
            />
            <Toggle
              label="Low balance alert"
              description={`Notify when checking account drops below $${settings.lowBalanceAmount}`}
              checked={settings.lowBalanceAlert}
              onChange={v => set('lowBalanceAlert', v)}
            />
            {settings.lowBalanceAlert && (
              <Field label="Low balance threshold">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={settings.lowBalanceAmount}
                    onChange={e => set('lowBalanceAmount', Number(e.target.value))}
                    className={inputClass + ' pl-7'}
                  />
                </div>
              </Field>
            )}
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories" icon={Tag}>
        <CategoryManager />
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={Database}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Export data</p>
              <p className="text-zinc-500 text-xs mt-0.5">Download all your transactions as JSON</p>
            </div>
            <button
              onClick={() => {
                const data = {
                  exportedAt: new Date().toISOString(),
                  transactions: JSON.parse(localStorage.getItem('ff_transactions') || '[]'),
                  accounts:     JSON.parse(localStorage.getItem('ff_accounts')     || '[]'),
                  budgets:      JSON.parse(localStorage.getItem('ff_budgets')      || '[]'),
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url  = URL.createObjectURL(blob)
                const a    = document.createElement('a')
                a.href = url; a.download = 'finflow-export.json'; a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-4 py-2 transition-all flex-shrink-0"
            >
              Export JSON
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-zinc-200 text-sm font-medium">Reset all data</p>
              <p className="text-zinc-500 text-xs mt-0.5">Clear all transactions, budgets and accounts — this cannot be undone</p>
            </div>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-xl px-4 py-2 transition-all flex-shrink-0 border ${
                showResetConfirm
                  ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20'
              }`}
            >
              <Trash size={13} />
              {showResetConfirm ? 'Confirm reset?' : 'Reset data'}
            </button>
          </div>
        </div>
      </Section>

      {/* App info */}
      <motion.div variants={fadeUp} className="flex items-center justify-between px-1 pb-2">
        <p className="text-zinc-700 text-xs">FinFlow v1.0.0 · Built with React + Vite</p>
        <p className="text-zinc-700 text-xs">Data stored locally · Never shared</p>
      </motion.div>

    </motion.div>
  )
}
