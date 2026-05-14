import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeSlash, Lock, Envelope, ArrowRight, User, CheckCircle } from '@phosphor-icons/react'

const USERS_KEY = 'ff_users'
const DEMO_USER = { name: 'Bilal Rahman', email: 'bilal@finflow.app', password: 'demo1234' }

// Load users from localStorage, always ensure demo user exists
function getUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const hasDemo = stored.some(u => u.email === DEMO_USER.email)
    return hasDemo ? stored : [DEMO_USER, ...stored]
  } catch {
    return [DEMO_USER]
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Password strength: 0-3
function getStrength(pw) {
  let s = 0
  if (pw.length >= 6)                      s++
  if (pw.length >= 10)                     s++
  if (/[^a-zA-Z0-9]/.test(pw) || /\d/.test(pw)) s++
  return s
}

const strengthLabel = ['', 'Weak', 'Fair', 'Strong']
const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400']
const strengthText  = ['', 'text-red-400', 'text-amber-400', 'text-emerald-400']

const FEATURES = [
  { label: 'Real-time balance tracking', desc: 'See your net worth update instantly' },
  { label: 'Smart budget alerts',        desc: 'Get notified before you overspend'  },
  { label: 'Spending analytics',         desc: 'Beautiful charts, zero friction'    },
]

const formVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 32 }),
  center:        { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
  exit:  (dir) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.15 } }),
}

function InputField({ label, icon: Icon, type = 'text', value, onChange, placeholder, error, suffix }) {
  return (
    <div>
      <label className="text-zinc-400 text-xs font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full bg-zinc-900 border ${error ? 'border-red-500/50' : 'border-zinc-800'} rounded-xl pl-10 ${suffix ? 'pr-10' : 'pr-4'} py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all`}
        />
        {suffix}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [dir,  setDir]  = useState(1)

  // Login state
  const [loginEmail, setLoginEmail]   = useState('')
  const [loginPw,    setLoginPw]      = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [loginError,  setLoginError]  = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup state
  const [signupName,    setSignupName]    = useState('')
  const [signupEmail,   setSignupEmail]   = useState('')
  const [signupPw,      setSignupPw]      = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')
  const [showSignupPw,  setShowSignupPw]  = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [signupErrors,  setSignupErrors]  = useState({})
  const [signupLoading, setSignupLoading] = useState(false)

  const pwStrength = getStrength(signupPw)

  const switchTo = (next) => {
    setDir(next === 'signup' ? 1 : -1)
    setMode(next)
    setLoginError('')
    setSignupErrors({})
  }

  // ── Login ──────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    setTimeout(() => {
      const users = getUsers()
      const match = users.find(u => u.email === loginEmail && u.password === loginPw)
      if (match) {
        localStorage.setItem('ff_auth', JSON.stringify({ email: match.email, name: match.name }))
        onLogin()
      } else {
        setLoginError('Incorrect email or password.')
        setLoginLoading(false)
      }
    }, 500)
  }

  const fillDemo = () => {
    setLoginEmail(DEMO_USER.email)
    setLoginPw(DEMO_USER.password)
    setLoginError('')
  }

  // ── Signup ─────────────────────────────────────────────
  const validateSignup = () => {
    const errs = {}
    if (!signupName.trim())               errs.name    = 'Full name is required'
    if (!signupEmail.trim())              errs.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(signupEmail)) errs.email = 'Enter a valid email'
    if (signupPw.length < 6)             errs.pw      = 'Password must be at least 6 characters'
    if (signupPw !== signupConfirm)      errs.confirm = 'Passwords do not match'

    const users = getUsers()
    if (!errs.email && users.some(u => u.email === signupEmail)) {
      errs.email = 'An account with this email already exists'
    }
    return errs
  }

  const handleSignup = (e) => {
    e.preventDefault()
    const errs = validateSignup()
    if (Object.keys(errs).length > 0) { setSignupErrors(errs); return }
    setSignupLoading(true)
    setTimeout(() => {
      const users = getUsers()
      const newUser = { name: signupName.trim(), email: signupEmail.trim(), password: signupPw }
      saveUsers([...users, newUser])
      localStorage.setItem('ff_auth', JSON.stringify({ email: newUser.email, name: newUser.name }))
      onLogin()
    }, 500)
  }

  // ── Shared branding panel ──────────────────────────────
  const BrandPanel = (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      className="hidden lg:flex flex-col justify-between w-[480px] bg-zinc-900 border-r border-zinc-800 p-12 flex-shrink-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M3 10 L6 7 L9 9 L13 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="13" cy="5" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-zinc-100 font-semibold text-xl tracking-tight">FinFlow</span>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-zinc-100 text-3xl font-semibold leading-snug">
            Your finances,<br />beautifully clear.
          </h2>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
            Track income, expenses, budgets and investments — all in one premium dashboard.
          </p>
        </div>
        <div className="space-y-4">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <p className="text-zinc-200 text-sm font-medium">{f.label}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ val: '$0', label: 'Subscription' }, { val: '100%', label: 'Private' }, { val: '∞', label: 'Transactions' }].map(s => (
          <div key={s.label} className="bg-zinc-800/60 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-semibold font-mono text-lg">{s.val}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {BrandPanel}

      {/* Right — animated form area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 10 L6 7 L9 9 L13 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="5" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="text-zinc-100 font-semibold text-lg tracking-tight">FinFlow</span>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex p-1 gap-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-8">
            {[['login', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => switchTo(key)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Animated form swap */}
          <AnimatePresence mode="wait" custom={dir}>
            {mode === 'login' ? (
              <motion.div
                key="login"
                custom={dir}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h1 className="text-zinc-100 text-2xl font-semibold mb-1">Welcome back</h1>
                <p className="text-zinc-500 text-sm mb-6">Sign in to your dashboard</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField
                    label="Email address"
                    icon={Envelope}
                    type="email"
                    value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setLoginError('') }}
                    placeholder="you@example.com"
                  />
                  <InputField
                    label="Password"
                    icon={Lock}
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginPw}
                    onChange={e => { setLoginPw(e.target.value); setLoginError('') }}
                    placeholder="••••••••"
                    suffix={
                      <button type="button" onClick={() => setShowLoginPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                        {showLoginPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />

                  {loginError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
                      {loginError}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm rounded-xl py-2.5 transition-colors mt-1">
                    {loginLoading
                      ? <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      : <>Sign in <ArrowRight size={15} weight="bold" /></>}
                  </button>
                </form>

                {/* Demo hint */}
                <div className="mt-5 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <p className="text-zinc-500 text-xs font-medium mb-2 uppercase tracking-widest">Demo credentials</p>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Email</span>
                      <span className="text-zinc-300">{DEMO_USER.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Password</span>
                      <span className="text-zinc-300">{DEMO_USER.password}</span>
                    </div>
                  </div>
                  <button type="button" onClick={fillDemo}
                    className="mt-3 w-full text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-center">
                    Fill demo credentials →
                  </button>
                </div>

                <p className="text-center text-zinc-600 text-xs mt-5">
                  Don't have an account?{' '}
                  <button onClick={() => switchTo('signup')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Create one
                  </button>
                </p>
              </motion.div>

            ) : (
              <motion.div
                key="signup"
                custom={dir}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h1 className="text-zinc-100 text-2xl font-semibold mb-1">Create account</h1>
                <p className="text-zinc-500 text-sm mb-6">Start tracking your finances today</p>

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Full name */}
                  <InputField
                    label="Full name"
                    icon={User}
                    value={signupName}
                    onChange={e => { setSignupName(e.target.value); setSignupErrors(p => ({ ...p, name: undefined })) }}
                    placeholder="Jane Smith"
                    error={signupErrors.name}
                  />

                  {/* Email */}
                  <InputField
                    label="Email address"
                    icon={Envelope}
                    type="email"
                    value={signupEmail}
                    onChange={e => { setSignupEmail(e.target.value); setSignupErrors(p => ({ ...p, email: undefined })) }}
                    placeholder="you@example.com"
                    error={signupErrors.email}
                  />

                  {/* Password */}
                  <div>
                    <InputField
                      label="Password"
                      icon={Lock}
                      type={showSignupPw ? 'text' : 'password'}
                      value={signupPw}
                      onChange={e => { setSignupPw(e.target.value); setSignupErrors(p => ({ ...p, pw: undefined })) }}
                      placeholder="Min. 6 characters"
                      error={signupErrors.pw}
                      suffix={
                        <button type="button" onClick={() => setShowSignupPw(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                          {showSignupPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />
                    {/* Strength bar */}
                    {signupPw.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthColor[pwStrength] : 'bg-zinc-800'}`} />
                          ))}
                        </div>
                        <p className={`text-xs ${strengthText[pwStrength]}`}>{strengthLabel[pwStrength]}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <InputField
                    label="Confirm password"
                    icon={Lock}
                    type={showConfirmPw ? 'text' : 'password'}
                    value={signupConfirm}
                    onChange={e => { setSignupConfirm(e.target.value); setSignupErrors(p => ({ ...p, confirm: undefined })) }}
                    placeholder="Repeat your password"
                    error={signupErrors.confirm}
                    suffix={
                      <>
                        {signupConfirm && signupPw === signupConfirm && (
                          <CheckCircle size={15} weight="fill" className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400" />
                        )}
                        <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                          {showConfirmPw ? <EyeSlash size={15} /> : <Eye size={15} />}
                        </button>
                      </>
                    }
                  />

                  <button type="submit" disabled={signupLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm rounded-xl py-2.5 transition-colors mt-1">
                    {signupLoading
                      ? <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      : <>Create account <ArrowRight size={15} weight="bold" /></>}
                  </button>
                </form>

                <p className="text-center text-zinc-600 text-xs mt-5">
                  Already have an account?{' '}
                  <button onClick={() => switchTo('login')} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
