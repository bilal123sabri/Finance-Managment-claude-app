import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FinanceProvider } from './context/FinanceContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import AddTransactionModal from './components/AddTransactionModal'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import Login from './pages/Login'

const PAGES = {
  dashboard:    Dashboard,
  transactions: Transactions,
  budgets:      Budgets,
  analytics:    Analytics,
  accounts:     Accounts,
  settings:     Settings,
}

const pageTransition = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0,  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.14 } },
}

function readAuthUser() {
  try {
    const raw = localStorage.getItem('ff_auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed?.email ? parsed : null
  } catch { return null }
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => readAuthUser())
  const [activePage, setActivePage]     = useState('dashboard')
  const [showModal,  setShowModal]      = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  const handleLogin = () => {
    setAuthUser(readAuthUser())
    setActivePage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('ff_auth')
    setAuthUser(null)
    setActivePage('dashboard')
    setGlobalSearch('')
  }

  const handleSearch = (query) => {
    setGlobalSearch(query)
    if (query.trim()) setActivePage('transactions')
  }

  const handleNavigate = (page) => {
    setActivePage(page)
    if (page !== 'transactions') setGlobalSearch('')
  }

  if (!authUser) {
    return <Login onLogin={handleLogin} />
  }

  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <FinanceProvider userEmail={authUser.email}>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            activePage={activePage}
            globalSearch={globalSearch}
            onSearch={handleSearch}
            onAddTransaction={() => setShowModal(true)}
          />

          <main className="flex-1 overflow-auto p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <PageComponent
                  onNavigate={handleNavigate}
                  globalSearch={activePage === 'transactions' ? globalSearch : ''}
                />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <AnimatePresence>
          {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
        </AnimatePresence>
      </div>
    </FinanceProvider>
  )
}
