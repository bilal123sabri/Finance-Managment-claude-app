import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ACCOUNTS, TRANSACTIONS, BUDGETS, CATEGORIES, MONTHLY_DATA } from '../data/mockData'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [accounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_accounts')) || ACCOUNTS } catch { return ACCOUNTS }
  })

  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_transactions')) || TRANSACTIONS } catch { return TRANSACTIONS }
  })

  const [budgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_budgets')) || BUDGETS } catch { return BUDGETS }
  })

  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_categories')) || CATEGORIES } catch { return CATEGORIES }
  })

  useEffect(() => {
    localStorage.setItem('ff_transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('ff_categories', JSON.stringify(categories))
  }, [categories])

  const addCategory = (cat) => {
    const id = `cat_${Date.now()}`
    setCategories(prev => [...prev, { ...cat, id, custom: true }])
  }

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const updateCategory = (id, changes) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))
  }

  const addTransaction = (tx) =>
    setTransactions(prev => [{ ...tx, id: `t_${Date.now()}` }, ...prev])

  const deleteTransaction = (id) =>
    setTransactions(prev => prev.filter(t => t.id !== id))

  const resetData = () => {
    localStorage.clear()
    window.location.reload()
  }

  const totalBalance = useMemo(
    () => accounts.reduce((s, a) => s + a.balance, 0),
    [accounts]
  )

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  // Current month transactions
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

  // Use MONTHLY_DATA for previous-month comparison (realistic historical reference)
  const prevRef = MONTHLY_DATA[MONTHLY_DATA.length - 2] // April reference
  const prevIncome   = prevRef?.income   ?? 0
  const prevExpenses = prevRef?.expenses ?? 0
  const prevNet      = prevIncome - prevExpenses

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

  // Net worth change this month (all transaction amounts summed)
  const netWorthChange = useMemo(() =>
    currentMonthTx.reduce((s, t) => s + t.amount, 0),
    [currentMonthTx]
  )

  const netWorthChangePct = useMemo(() => {
    const prevBalance = totalBalance - netWorthChange
    if (prevBalance <= 0) return '0.0'
    return (netWorthChange / prevBalance * 100).toFixed(1)
  }, [totalBalance, netWorthChange])

  // Category spending this month
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

  // Budgets with real spent amounts
  const budgetsWithSpent = useMemo(() =>
    budgets.map(bud => {
      const catInfo = categories.find(c => c.id === bud.category)
      const spent = currentMonthTx
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

  // Budget alerts: categories at ≥80% of limit
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
      addCategory,
      deleteCategory,
      updateCategory,
      totalBalance,
      currentMonthIncome,
      currentMonthExpenses,
      netSaved,
      savingsRate,
      incomeChangePct,
      expenseChangePct,
      netSavedChangePct,
      netWorthChange,
      netWorthChangePct,
      categorySpending,
      budgetAlerts,
      addTransaction,
      deleteTransaction,
      resetData,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
