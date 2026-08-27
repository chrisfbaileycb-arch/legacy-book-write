import React, { useState } from 'react'
import { Feather, BookOpen, Download, Smartphone } from 'lucide-react'
import { auth } from '../lib/auth'
import HowToInstall from './HowToInstall'

export default function Welcome({ onSignedIn }) {
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    const user = await auth.signIn()
    setLoading(false)
    if (user) onSignedIn(user)
  }

  if (showGuide) return <HowToInstall onBack={() => setShowGuide(false)} />

  return (
    <div className="h-full overflow-y-auto bg-paper text-[#1c2434]">
      <div className="max-w-3xl mx-auto w-full px-6 pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] pb-12 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 animate-fade-up">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-display font-semibold text-4xl md:text-5xl leading-none shadow-lg shadow-primary/20">U</div>
          <span className="font-display text-5xl md:text-6xl tracking-tight text-primary">Spk</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl mt-10 leading-[1.05] animate-fade-up" style={{ animationDelay: '0.1s' }}>
          You speak.<br />
          <span className="text-secondary">It becomes a book.</span>
        </h1>
        <p className="font-read text-lg md:text-xl text-slate-600 mt-5 max-w-lg animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Writing a whole book is daunting. Answering one good question is not.
          Pick your direction — a how-to guide, a self-help book, better thinking,
          relationships, a memoir, or a novel — and answer one focused prompt at a time.
          Your answers grow into a real, downloadable book.
        </p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="mt-9 w-full max-w-xs bg-primary text-white font-semibold py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-60 animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          {loading ? 'Opening…' : 'Start writing'}
        </button>
        <p className="text-xs text-slate-400 mt-3 animate-fade-up" style={{ animationDelay: '0.35s' }}>
          Sign in, then choose a membership pass to unlock your writing space. Your work saves to your account across devices.
        </p>

        <button
          onClick={() => setShowGuide(true)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors py-2 px-3 rounded-xl animate-fade-up"
          style={{ animationDelay: '0.38s' }}
        >
          <Smartphone size={16} />
          New here? Put U Spk on your phone
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 w-full animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <Feature icon={Feather} title="Prompts that guide you" text="Focused questions that draw out what you know and move your book forward." />
          <Feature icon={BookOpen} title="Any kind of book" text="How-to, self-help, better thinking, relationships, memoir, or fiction — you set the direction." />
          <Feature icon={Download} title="A real book to keep" text="Every answer becomes a chapter — download your finished book as a polished PDF anytime." />
        </div>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl p-5 text-left shadow-sm">
      <Icon size={20} className="text-secondary mb-3" />
      <h3 className="font-display text-base mb-1 text-primary">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
    </div>
  )
}
