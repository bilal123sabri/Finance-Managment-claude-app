import { subDays, format } from 'date-fns'

const today = new Date()
const d = (n) => format(subDays(today, n), 'yyyy-MM-dd')

export const ACCOUNTS = [
  {
    id: 'acc_1',
    name: 'Chase Sapphire Checking',
    type: 'checking',
    balance: 24837.52,
    lastFour: '4821',
    accent: '#10b981',
  },
  {
    id: 'acc_2',
    name: 'Ally High-Yield Savings',
    type: 'savings',
    balance: 68250.0,
    lastFour: '3317',
    accent: '#3b82f6',
  },
  {
    id: 'acc_3',
    name: 'Fidelity Brokerage',
    type: 'investment',
    balance: 143920.85,
    lastFour: '7904',
    accent: '#f59e0b',
  },
]

export const CATEGORIES = [
  { id: 'housing',       label: 'Housing',        color: '#6366f1' },
  { id: 'food',          label: 'Food & Dining',  color: '#f59e0b' },
  { id: 'transport',     label: 'Transport',      color: '#3b82f6' },
  { id: 'health',        label: 'Health',         color: '#10b981' },
  { id: 'entertainment', label: 'Entertainment',  color: '#ec4899' },
  { id: 'shopping',      label: 'Shopping',       color: '#8b5cf6' },
  { id: 'utilities',     label: 'Utilities',      color: '#14b8a6' },
  { id: 'income',        label: 'Income',         color: '#22c55e' },
  { id: 'other',         label: 'Other',          color: '#71717a' },
]

export const TRANSACTIONS = [
  { id: 't1',  description: 'Monthly Salary',              amount:  7800.00, type: 'income',  category: 'income',        date: d(1),  account: 'acc_1' },
  { id: 't2',  description: 'Whole Foods Market',          amount:  -127.43, type: 'expense', category: 'food',          date: d(2),  account: 'acc_1' },
  { id: 't3',  description: 'Rent — Pacific Heights',      amount: -2400.00, type: 'expense', category: 'housing',       date: d(3),  account: 'acc_1' },
  { id: 't4',  description: 'Uber',                        amount:   -18.70, type: 'expense', category: 'transport',     date: d(3),  account: 'acc_1' },
  { id: 't5',  description: 'Netflix',                     amount:   -22.99, type: 'expense', category: 'entertainment', date: d(4),  account: 'acc_1' },
  { id: 't6',  description: 'Freelance — Meridian Studio',  amount:  2400.00, type: 'income',  category: 'income',        date: d(5),  account: 'acc_1' },
  { id: 't7',  description: "Trader Joe's",                amount:   -89.15, type: 'expense', category: 'food',          date: d(5),  account: 'acc_1' },
  { id: 't8',  description: 'Equinox Membership',          amount:   -54.00, type: 'expense', category: 'health',        date: d(6),  account: 'acc_1' },
  { id: 't9',  description: 'PG&E — Electric',             amount:  -142.50, type: 'expense', category: 'utilities',     date: d(7),  account: 'acc_1' },
  { id: 't10', description: 'Aritzia — Clothing',          amount:  -215.00, type: 'expense', category: 'shopping',      date: d(8),  account: 'acc_1' },
  { id: 't11', description: 'Spotify Premium',             amount:   -11.99, type: 'expense', category: 'entertainment', date: d(9),  account: 'acc_1' },
  { id: 't12', description: 'Doctor Visit — Copay',        amount:   -40.00, type: 'expense', category: 'health',        date: d(10), account: 'acc_1' },
  { id: 't13', description: 'Apple — MacBook Pro',         amount:  -349.99, type: 'expense', category: 'shopping',      date: d(11), account: 'acc_1' },
  { id: 't14', description: 'Xfinity — Internet',          amount:   -89.99, type: 'expense', category: 'utilities',     date: d(12), account: 'acc_1' },
  { id: 't15', description: 'Lyft',                        amount:   -24.30, type: 'expense', category: 'transport',     date: d(13), account: 'acc_1' },
  { id: 't16', description: 'Dividend Income — Fidelity',  amount:   847.22, type: 'income',  category: 'income',        date: d(14), account: 'acc_3' },
  { id: 't17', description: 'Bi-Rite Creamery',            amount:   -14.50, type: 'expense', category: 'food',          date: d(14), account: 'acc_1' },
  { id: 't18', description: 'Parking — SF Civic Center',   amount:   -35.00, type: 'expense', category: 'transport',     date: d(15), account: 'acc_1' },
  { id: 't19', description: 'SoulCycle Class',             amount:   -34.00, type: 'expense', category: 'health',        date: d(16), account: 'acc_1' },
  { id: 't20', description: 'Interest — Ally Savings',     amount:   284.17, type: 'income',  category: 'income',        date: d(17), account: 'acc_2' },
  { id: 't21', description: 'Muni Monthly Pass',           amount:  -110.00, type: 'expense', category: 'transport',     date: d(18), account: 'acc_1' },
  { id: 't22', description: 'Thrive Market',               amount:  -198.40, type: 'expense', category: 'food',          date: d(19), account: 'acc_1' },
  { id: 't23', description: 'Adobe Creative Cloud',        amount:   -59.99, type: 'expense', category: 'entertainment', date: d(20), account: 'acc_1' },
  { id: 't24', description: 'Gas — Shell Station',         amount:   -67.80, type: 'expense', category: 'transport',     date: d(21), account: 'acc_1' },
  { id: 't25', description: 'UCSF — Lab Work',             amount:   -46.00, type: 'expense', category: 'health',        date: d(22), account: 'acc_1' },
]

export const BUDGETS = [
  { id: 'bud_1', category: 'food',          limit: 800 },
  { id: 'bud_2', category: 'transport',     limit: 300 },
  { id: 'bud_3', category: 'entertainment', limit: 200 },
  { id: 'bud_4', category: 'shopping',      limit: 500 },
  { id: 'bud_5', category: 'health',        limit: 250 },
  { id: 'bud_6', category: 'utilities',     limit: 400 },
]

export const MONTHLY_DATA = [
  { month: 'Nov', income: 7200,  expenses: 4130 },
  { month: 'Dec', income: 8450,  expenses: 5240 },
  { month: 'Jan', income: 7100,  expenses: 3870 },
  { month: 'Feb', income: 7500,  expenses: 4310 },
  { month: 'Mar', income: 7200,  expenses: 4750 },
  { month: 'Apr', income: 8100,  expenses: 4190 },
  { month: 'May', income: 11331, expenses: 4705 },
]
