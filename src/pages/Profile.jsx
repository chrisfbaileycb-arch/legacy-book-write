import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, Save, BookMarked, CalendarClock, ShieldCheck, Sparkles, Smartphone, ChevronRight } from 'lucide-react'
import { auth } from '../lib/auth'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useMembership, daysBetween } from '../hooks/useMembership'
import PassOptions from '../components/PassOptions'

export default function Profile() {
  const currentUser = auth.getCurrentUser()
  const { data: rows, refetch } = useLive('profile', { limit: 1 })
  const profile = rows?.[0]
  const { loading: memLoading, active, until, isOwner } = useMembership()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
    } else if (currentUser?.displayName) {
      setName(currentUser.displayName)
    }
  }, [profile])

  const save = async () => {
    setSaving(true)
    await db.upsert('profile', { name, bio }, 'my-profile')
    setSaving(false)
    setSaved(true)
    refetch()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-6">
      <header className="mb-6 animate-fade-up flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-primary">{name || 'Your profile'}</h1>
          <p className="text-sm text-slate-500">{currentUser?.email}</p>
        </div>
      </header>

      {/* Membership status */}
      <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-6 mb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock size={16} className="text-secondary" />
          <h2 className="font-display text-lg text-primary">Your membership</h2>
        </div>

        {isOwner ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3">
            <ShieldCheck size={16} /> Owner access — you always have the full app.
          </div>
        ) : memLoading ? (
          <p className="text-sm text-slate-400">Checking your membership…</p>
        ) : active ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/5 rounded-xl px-4 py-3">
              <Sparkles size={16} className="text-secondary" />
              {(() => {
                const left = daysBetween(new Date(), until)
                return `Active — ${left} day${left === 1 ? '' : 's'} left (through ${until.toLocaleDateString()})`
              })()}
            </div>
            <p className="text-sm text-slate-500 mt-4">Add more time — it stacks onto what's left.</p>
            <div className="mt-3"><PassOptions /></div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-3">Your pass has ended. Pick a new one to keep writing.</p>
            <PassOptions />
          </>
        )}
      </div>

      {/* Author details */}
      <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-6 space-y-4 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <BookMarked size={16} className="text-secondary" />
          <h2 className="font-display text-lg text-primary">How your name appears</h2>
        </div>

        <Field label="Your name" value={name} onChange={setName} placeholder="How your name appears on the cover" />
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-400">A note before your book begins (optional)</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            placeholder="Anything you'd like readers to know before they start…"
            className="w-full mt-1.5 bg-[#f4f2ed] border border-black/5 rounded-xl p-3 font-read text-lg outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 rounded-2xl disabled:opacity-60 active:scale-[0.98] transition-transform"
        >
          <Save size={17} />
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save details'}
        </button>
      </div>

      <Link
        to="/install"
        className="w-full mt-6 flex items-center gap-3 bg-white border border-black/5 rounded-2xl px-5 py-4 shadow-sm hover:border-secondary/40 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <Smartphone size={17} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-primary text-sm">Put U Spk on your phone</p>
          <p className="text-xs text-slate-500">Add to your home screen, or share the link and QR code</p>
        </div>
        <ChevronRight size={17} className="text-slate-300 shrink-0" />
      </Link>

      <button
        onClick={() => auth.signOut()}
        className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 py-3 rounded-2xl border border-black/10 hover:bg-black/5 transition-colors"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-slate-400">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1.5 bg-[#f4f2ed] border border-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}
