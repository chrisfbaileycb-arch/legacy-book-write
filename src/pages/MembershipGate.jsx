import React from 'react'
import { Loader2, BookOpen, Feather, Infinity as InfinityIcon } from 'lucide-react'
import { auth } from '../lib/auth'
import { useMembership } from '../hooks/useMembership'
import PassOptions from '../components/PassOptions'

function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-display font-semibold text-xl leading-none">U</div>
      <span className="font-display text-2xl tracking-tight text-primary">Spk</span>
    </div>
  )
}

export default function MembershipGate({ children }) {
  const { loading, active } = useMembership()

  if (loading) {
    return (
      <div className="h-full bg-paper flex items-center justify-center">
        <Loader2 className="animate-spin text-primary/40" size={28} />
      </div>
    )
  }

  if (active) return children

  return (
    <div className="h-full overflow-y-auto bg-paper text-[#1c2434]">
      <div className="max-w-2xl mx-auto w-full px-6 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] pb-16">
        <div className="animate-fade-up"><Wordmark /></div>

        <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="font-display text-3xl text-primary leading-tight">Choose your writing pass</h1>
          <p className="font-read text-lg text-slate-600 mt-2">
            One membership unlocks everything — daily prompts, unlimited books, and
            downloadable PDFs to keep. Pick the length that fits your project; the
            longer the pass, the lower the monthly cost. Need more time later? Add
            another pass and it stacks onto what's left.
          </p>
        </div>

        <div className="mt-7 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <PassOptions />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <Perk icon={Feather} title="Guided prompts" text="One focused question at a time, in your chosen direction." />
          <Perk icon={BookOpen} title="Unlimited books" text="Write as many books as you like while your pass is active." />
          <Perk icon={InfinityIcon} title="Yours to keep" text="Download your finished book as a PDF anytime." />
        </div>

        <p className="text-xs text-slate-400 mt-8 text-center">
          Secure checkout. Card details are handled by the payment provider — never stored in this app.
        </p>

        <button
          onClick={() => auth.signOut()}
          className="w-full mt-5 text-slate-400 text-sm hover:text-primary"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function Perk({ icon: Icon, title, text }) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
      <Icon size={18} className="text-secondary mb-2" />
      <h3 className="font-display text-sm text-primary mb-0.5">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
    </div>
  )
}
