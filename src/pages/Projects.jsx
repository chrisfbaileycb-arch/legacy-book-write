import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, X, ArrowRight } from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { DIRECTIONS, directionInfo } from '../prompts'

export default function Projects() {
  const { data: projects, loading, refetch } = useLive('projects', { order: '-createdAt', limit: 100 })
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-6">
      <header className="mb-6 animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-1">Your Books</p>
        <h1 className="font-display text-3xl text-primary">Every book starts with a prompt</h1>
        <p className="font-read text-lg text-slate-600 mt-2 max-w-xl">
          Start a how-to guide, a self-help book, a memoir, letters to the people you love, or a novel —
          answer a prompt whenever you like and watch it grow into a real book.
        </p>
      </header>

      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto sm:px-8 mb-8 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 px-6 rounded-2xl active:scale-[0.98] transition-transform animate-fade-up shadow-lg shadow-primary/20"
      >
        <Plus size={18} /> Start a new book
      </button>

      {loading && <p className="text-sm text-slate-400">Loading…</p>}

      {!loading && projects.length === 0 && (
        <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-10 text-center animate-fade-up">
          <BookOpen size={32} className="text-secondary mx-auto mb-3" />
          <p className="font-read text-lg text-slate-600">
            You haven't started a book yet. Pick a direction above and answer your first prompt today.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => {
          const dir = directionInfo(p.direction)
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/project/${p.id}/write`)}
              className="text-left rounded-2xl bg-white border border-black/5 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all animate-fade-up group"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{dir.label}</span>
              <h3 className="font-display text-xl mt-1.5 mb-2 text-primary">{p.title}</h3>
              {p.details && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{p.details}</p>}
              <div className="flex items-center gap-1.5 text-sm text-slate-400 group-hover:text-primary transition-colors">
                Open book <ArrowRight size={14} />
              </div>
            </button>
          )
        })}
      </div>

      {open && (
        <NewProjectModal
          onClose={() => setOpen(false)}
          onCreated={(id) => { setOpen(false); refetch(); navigate(`/project/${id}/write`) }}
        />
      )}
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [direction, setDirection] = useState('guide')
  const [details, setDetails] = useState('')
  const [saving, setSaving] = useState(false)

  const create = async () => {
    if (!title.trim()) return
    setSaving(true)
    const row = await db.insert('projects', {
      title: title.trim(),
      direction,
      details: details.trim(),
    })
    setSaving(false)
    onCreated(row.id)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-end md:items-center justify-center"
      style={{ height: 'var(--visual-height, 100dvh)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl p-6 overflow-y-auto shadow-2xl"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-primary">Start a new book</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-primary"><X size={20} /></button>
        </div>

        <label className="text-xs uppercase tracking-wider text-slate-400">Book title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='e.g. "Clearer Thinking in 30 Days" or "47 Years of Pizza"'
          className="w-full mt-1.5 mb-4 bg-[#f4f2ed] border border-black/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
        />

        <label className="text-xs uppercase tracking-wider text-slate-400 mb-2 block">Direction</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {DIRECTIONS.map(d => (
            <button
              key={d.id}
              onClick={() => setDirection(d.id)}
              className={`text-left rounded-xl px-3.5 py-3 border transition-colors ${
                direction === d.id ? 'bg-primary/10 border-primary/50' : 'bg-[#f4f2ed] border-black/5 hover:border-primary/25'
              }`}
            >
              <p className={`text-sm font-semibold ${direction === d.id ? 'text-primary' : 'text-slate-700'}`}>{d.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{d.tagline}</p>
            </button>
          ))}
        </div>

        <label className="text-xs uppercase tracking-wider text-slate-400">
          {direction === 'custom' ? 'Describe your book' : 'Any details to guide your prompts (optional)'}
        </label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          rows={3}
          placeholder={
            direction === 'custom'
              ? 'e.g. A practical field guide to starting a small bakery, for complete beginners…'
              : 'e.g. Focus on the audience, the core idea, specific people, or a particular era…'
          }
          className="w-full mt-1.5 mb-5 bg-[#f4f2ed] border border-black/5 rounded-xl p-3 font-read text-lg outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />

        <button
          onClick={create}
          disabled={!title.trim() || (direction === 'custom' && !details.trim()) || saving}
          className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? 'Creating…' : 'Create book'}
        </button>
      </div>
    </div>
  )
}
