import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ACCOUNTS, TRANSACTIONS, BUDGETS, CATEGORIES } from '../data/mockData'

const FinanceContext = createContext(null)

const DEMO_EMAIL    = 'bilal@finflow.app'
const EMPTY_ACCOUNTS = ACCOUNTS.map(a => ({ ...a, balance: 0 }))

export function FinanceProvider({ children, userEmail }) {
  const isDemo = userEmail === DEMO_EMAIL
  const k = (name) => `ff_${name}__${userEmail}`

  // ── State ────────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(k('accounts'))) || (isDemo ? ACCOUNTS : EMPTY_ACCOUNTS) }
    catch { return isDemo ? ACCOUNTS : EMPTY_ACCOUNTS }
  })

  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(k('transactions'))) || (isDemo ? TRANSACTIONS : []) }
    catch { return isDemo ? TRANSACTIONS : [] }
  })

  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem(k('budgets'))) || (isDemo ? BUDGETS : []) }
    catch { return isDemo ? BUDGETS : [] }
  })

  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(k('categories'))) || CATEGORIES }
    catch { return CATEGORIES }
  })

  // ── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(k('accounts'),     JSON.stringify(accounts))     }, [accounts])
  useEffect(() => { localStorage.setItem(k('transactions'), JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem(k('budgets'),      JSON.stringify(budgets))      }, [budgets])
  useEffect(() => { localStorage.setItem(k('categories'),   JSON.stringify(categories))   }, [categories])

  // ── Mutations ────────────────────────────────────────────────────────────
  const addTransaction    = (tx) => setTransactions(prev => [{ ...tx, id: `t_${Date.now()}` }, ...prev])
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))

  const addCategory    = (cat) => setCategories(prev => [...prev, { ...cat, id: `cat_${Date.now()}`, custom: true }])
  const deleteCategory = (id)  => setCategories(prev => prev.filter(c => c.id !== id))
  const updateCategory = (id, changes) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))

  const resetData = () => {
    localStorage.removeItem(k('accounts'))
    localStorage.removeItem(k('transactions'))
    localStorage.removeItem(k('budgets'))
    localStorage.removeItem(k('categories'))
    localStorage.removeItem('ff_auth')
    window.location.reload()
  }

  // ── Date helpers ─────────────────────────────────────────────────────────
  const now       = new Date()
  const thisMonth = now.getMonth()
  const thisYear  = now.getFullYear()

  // Previous month
  const prevMonthDate = new Date(thisYear, thisMonth - 1, 1)
  const prevMo        = prevMonthDate.getMonth()
  const prevYr        = prevMonthDate.getFullYear()

  // ── Current month transactions ───────────────────────────────────────────
  const currentMonthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }),
    [transactions, thisMonth, thisYear]
  )

  const currentMonthIncome = useMemo(() =>
    currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [currentMonthTx]
  )

  const currentMonthExpenses = useMemo(() =>
    currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    [currentMonthTx]
  )

  const netSaved = currentMonthIncome - currentMonthExpenses

  // ── Previous month — computed from REAL transactions ─────────────────────
  const prevMonthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === prevMo && d.getFullYear() === prevYr
    }),
    [transactions, prevMo, prevYr]
  )

  const prevIncome = useMemo(() =>
    prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [prevMonthTx]
  )

  const prevExpenses = useMemo(() =>
    prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    [prevMonthTx]
  )

  const prevNet = prevIncome - prevExpenses

  const prevSavingsRate = useMemo(() =>
    prevIncome > 0
      ? ((prevIncome - prevExpenses) / prevIncome * 100).toFixed(1)
      : null,
    [prevIncome, prevExpenses]
  )

  // ── Month-over-month change percentages ───────────────────────────────────
  const incomeChangePct = useMemo(() =>
    prevIncome > 0 ? ((currentMonthIncome - prevIncome) / prevIncome * 100).toFixed(1) : null,
    [currentMonthIncome, prevIncome]
  )

  const expenseChangePct = useMemo(() =>
    prevExpenses > 0 ? ((currentMonthExpenses - prevExpenses) / prevExpenses * 100).toFixed(1) : null,
    [currentMonthExpenses, prevExpenses]
  )

  const netSavedChangePct = useMemo(() =>
    prevNet !== 0 ? ((netSaved - prevNet) / Math.abs(prevNet) * 100).toFixed(1) : null,
    [netSaved, prevNet]
  )

  const savingsRate = useMemo(() =>
    currentMonthIncome > 0
      ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome * 100).toFixed(1)
      : '0.0',
    [currentMonthIncome, currentMonthExpenses]
  )

  const srChangePct = useMemo(() =>
    prevSavingsRate !== null
      ? (parseFloat(savingsRate) - parseFloat(prevSavingsRate)).toFixed(1)
      : null,
    [savingsRate, prevSavingsRate]
  )

  // ── Net worth ─────────────────────────────────────────────────────────────
  const totalBalance = useMemo(
    () => accounts.reduce((s, a) => s + a.balance, 0),
    [accounts]
  )

  const netWorthChange = useMemo(() =>
    currentMonthTx.reduce((s, t) => s + t.amount, 0),
    [currentMonthTx]
  )

  const netWorthChangePct = useMemo(() => {
    const prevBalance = totalBalance - netWorthChange
    if (prevBalance <= 0) return '0.0'
    return (netWorthChange / prevBalance * 100).toFixed(1)
  }, [totalBalance, netWorthChange])

  // ── Monthly chart data — last 7 months from REAL transactions ─────────────
  const monthlyChartData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d   = new Date(thisYear, thisMonth - (6 - i), 1)
      const mo  = d.getMonth()
      const yr  = d.getFullYear()
      const label = d.toLocaleString('default', { month: 'short' })

      const monthTx  = transactions.filter(t => {
        const td = new Date(t.date)
        return td.getMonth() === mo && td.getFullYear() === yr
      })
      const income   = Math.round(monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
      const expenses = Math.round(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0))
      const net = income - expenses
      const sr  = income > 0 ? Math.round((net / income) * 100) : 0

      return { month: label, income, expenses, net, savingsRate: sr }
    }),
    [transactions, thisMonth, thisYear]
  )

  // ── Category spending ─────────────────────────────────────────────────────
  const categorySpending = useMemo(() =>
    categories
      .filter(c => c.id !== 'income')
      .map(cat => ({
        ...cat,
        spent: currentMonthTx
          .filter(t => t.category === cat.id && t.type === 'expense')
          .reduce((s, t) => s + Math.abs(t.amount), 0),
      }))
      .filter(c => c.spent > 0)
      .sort((a, b) => b.spent - a.spent),
    [categories, currentMonthTx]
  )

  // ── Budgets with real spent amounts ──────────────────────────────────────
  const budgetsWithSpent = useMemo(() =>
    budgets.map(bud => {
      const catInfo = categories.find(c => c.id === bud.category)
      const spent   = currentMonthTx
        .filter(t => t.category === bud.category && t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      return {
        ...bud,
        spent,
        label: catInfo?.label || bud.category,
        color: catInfo?.color  || '#71717a',
      }
    }),
    [budgets, categories, currentMonthTx]
  )

  const budgetAlerts = useMemo(() =>
    budgetsWithSpent
      .filter(b => b.spent >= b.limit * 0.8)
      .map(b => ({ ...b, over: b.spent > b.limit, pct: Math.round((b.spent / b.limit) * 100) }))
      .sort((a, b) => b.pct - a.pct),
    [budgetsWithSpent]
  )

  return (
    <FinanceContext.Provider value={{
      accounts,
      transactions,
      budgets: budgetsWithSpent,
      categories,
      isDemo,
      totalBalance,
      currentMonthIncome,
      currentMonthExpenses,
      netSaved,
      savingsRate,
      srChangePct,
      incomeChangePct,
      expenseChangePct,
      netSavedChangePct,
      netWorthChange,
      netWorthChangePct,
      monthlyChartData,
      categorySpending,
      budgetAlerts,
      addTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      updateCategory,
      resetData,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
