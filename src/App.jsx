import React, { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { BookOpen, User } from 'lucide-react'
import { auth } from './lib/auth'
import Welcome from './pages/Welcome'
import MembershipGate from './pages/MembershipGate'
import Projects from './pages/Projects'
import ProjectPage from './pages/ProjectPage'
import Profile from './pages/Profile'
import HowToInstall from './pages/HowToInstall'

function ScrollReset({ scrollRef }) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [pathname])
  return null
}

const TABS = [
  { to: '/', label: 'Books', icon: BookOpen, end: true },
  { to: '/profile', label: 'Profile', icon: User },
]

function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-display font-semibold text-2xl leading-none">U</div>
      <span className="font-display text-3xl tracking-tight text-primary">Spk</span>
    </div>
  )
}

function Shell({ children }) {
  const scrollRef = useRef(null)
  return (
    <div className="h-full flex bg-paper text-[#1c2434]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-black/5 px-5 py-8 pt-[calc(env(safe-area-inset-top,0px)+2rem)]">
        <div className="mb-10 px-2">
          <Wordmark />
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-500 hover:text-primary hover:bg-black/5'
                }`
              }
            >
              <t.icon size={19} />
              <span className="font-medium">{t.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
          <ScrollReset scrollRef={scrollRef} />
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-black/5 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex justify-around items-stretch px-1 pt-1.5">
          {TABS.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-3 rounded-xl min-w-[64px] transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400'
                }`
              }
            >
              <t.icon size={20} />
              <span className="text-[11px] font-medium">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function Gate({ children }) {
  const [user, setUser] = useState(auth.getCurrentUser())
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthChange(u => {
      setUser(u)
      setChecked(true)
    })
    return unsub
  }, [])

  if (!checked) return <div className="h-full bg-paper" />

  if (!user) {
    return <Welcome onSignedIn={setUser} />
  }

  return children
}

export default function App() {
  return (
    <HashRouter>
      <Gate>
        <MembershipGate>
        <Shell>
          <Routes>
            <Route path="/" element={<Projects />} />
            <Route path="/project/:id/write" element={<ProjectPage />} />
            <Route path="/project/:id/book" element={<ProjectPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/install" element={<HowToInstall />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
        </MembershipGate>
      </Gate>
    </HashRouter>
  )
}
