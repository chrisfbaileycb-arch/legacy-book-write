import React, { useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, PenLine, Check, Flame, ChevronDown, ChevronUp, Sparkles, RefreshCw, BookOpen, Download, Loader2 } from 'lucide-react'
import { db } from '../lib/db'
import { ai } from '../lib/ai'
import { docs } from '../lib/docs'
import { download } from '../lib/download'
import { useLive } from '../lib/useLive'
import { directionInfo, fallbackPromptForDate, buildPromptRequest } from '../prompts'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function computeStreak(entries) {
  const days = new Set(entries.map(e => e.date))
  let streak = 0
  let d = new Date()
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) { streak++; d.setDate(d.getDate() - 1) } else break
  }
  return streak
}

export default function ProjectPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const tab = location.pathname.endsWith('/book') ? 'book' : 'write'

  const { data: projects, loading: loadingProject } = useLive('projects', { limit: 100 })
  const project = projects.find(p => p.id === id)
  const dir = project ? directionInfo(project.direction) : null

  if (!loadingProject && !project) {
    return (
      <div className="max-w-2xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+2rem)] text-center">
        <p className="font-read text-lg text-slate-500 mb-4">This book couldn't be found.</p>
        <button onClick={() => navigate('/')} className="text-primary font-semibold">Back to your books</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-6">
      <header className="mb-5 animate-fade-up">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-3">
          <ArrowLeft size={15} /> All books
        </button>
        {project && (
          <>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{dir.label}</span>
            <h1 className="font-display text-2xl mt-1 text-primary">{project.title}</h1>
          </>
        )}
        <div className="flex gap-2 mt-4">
          <TabButton active={tab === 'write'} onClick={() => navigate(`/project/${id}/write`)}>Write</TabButton>
          <TabButton active={tab === 'book'} onClick={() => navigate(`/project/${id}/book`)}>Your Book</TabButton>
        </div>
      </header>

      {project && (tab === 'write' ? <WriteTab project={project} /> : <BookTab project={project} />)}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-primary hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  )
}

function WriteTab({ project }) {
  const { data: entries, loading, refetch } = useLive('entries', { filters: { projectId: project.id }, order: '-createdAt', limit: 500 })
  const { data: pending, refetch: refetchPending } = useLive('daily_prompts', { filters: { projectId: project.id }, limit: 5 })

  const [answer, setAnswer] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPast, setShowPast] = useState(true)

  const date = todayStr()
  const dir = directionInfo(project.direction)
  const alreadyAnsweredToday = useMemo(() => entries.find(e => e.date === date), [entries, date])

  const todaysDoc = pending.find(p => p.date === date)
  const pastPromptTexts = entries.map(e => e.prompt)

  const promptText = alreadyAnsweredToday
    ? alreadyAnsweredToday.prompt
    : (todaysDoc ? todaysDoc.text : null)

  const generatePrompt = async (fresh = false) => {
    setGenerating(true)
    try {
      const instruction = buildPromptRequest(project, fresh ? [...pastPromptTexts, todaysDoc?.text].filter(Boolean) : pastPromptTexts)
      const result = await ai.run(instruction)
      const text = (result.text || '').trim().replace(/^["“]|["”]$/g, '')
      const final = text || fallbackPromptForDate(project, date + (fresh ? Math.random() : ''), pastPromptTexts)
      await db.upsert('daily_prompts', { projectId: project.id, date, text: final }, `${project.id}_${date}`)
    } catch (e) {
      const fallback = fallbackPromptForDate(project, date + (fresh ? Math.random() : ''), pastPromptTexts)
      await db.upsert('daily_prompts', { projectId: project.id, date, text: fallback }, `${project.id}_${date}`)
    }
    setGenerating(false)
    refetchPending()
  }

  const handleSave = async () => {
    if (!answer.trim() || !promptText) return
    setSaving(true)
    await db.insert('entries', {
      projectId: project.id,
      prompt: promptText,
      answer: answer.trim(),
      date,
    })
    setSaving(false)
    setAnswer('')
    refetch()
  }

  const streak = computeStreak(entries)
  const pastEntries = entries.filter(e => e.date !== date)

  return (
    <>
      <div className="flex items-center justify-between mb-4 animate-fade-up">
        <h2 className="font-display text-lg text-primary">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full">
          <Flame size={16} />
          <span className="text-sm font-semibold">{streak}</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-black/5 p-6 md:p-8 shadow-lg shadow-black/5 relative overflow-hidden animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {!promptText ? (
          <div className="text-center py-6">
            <Sparkles size={26} className="text-secondary mx-auto mb-3" />
            <p className="font-read text-lg text-slate-600 mb-5">Ready for today's writing prompt for your {dir.label.toLowerCase()}?</p>
            <button
              onClick={() => generatePrompt(false)}
              disabled={generating}
              className="bg-primary text-white font-semibold py-3 px-6 rounded-2xl inline-flex items-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {generating ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
              {generating ? 'Thinking…' : "Get today's prompt"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white bg-secondary">
                {dir.label}
              </span>
              {!alreadyAnsweredToday && (
                <button
                  onClick={() => generatePrompt(true)}
                  disabled={generating}
                  className="text-slate-400 hover:text-primary flex items-center gap-1 text-xs disabled:opacity-40"
                >
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} another
                </button>
              )}
            </div>
            <p className="font-read text-2xl md:text-3xl leading-snug text-primary">{promptText}</p>

            {alreadyAnsweredToday ? (
              <div className="mt-6 pt-5 border-t border-black/10">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-2">
                  <Check size={16} /> Answered today
                </div>
                <p className="font-read text-lg leading-relaxed whitespace-pre-wrap text-slate-700">{alreadyAnsweredToday.answer}</p>
              </div>
            ) : (
              <div className="mt-6">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Take your time. Write as little or as much as you like…"
                  rows={6}
                  className="w-full bg-[#f4f2ed] rounded-2xl p-4 font-read text-lg leading-relaxed placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  onClick={handleSave}
                  disabled={!answer.trim() || saving}
                  className="mt-4 w-full sm:w-auto sm:px-8 bg-primary text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
                >
                  <PenLine size={17} />
                  {saving ? 'Saving…' : 'Add to my book'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'} written so far</span>
        <button onClick={() => setShowPast(s => !s)} className="flex items-center gap-1 text-primary">
          {showPast ? 'Hide past' : 'Show past'} {showPast ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showPast && (
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-slate-400">Loading…</p>}
          {!loading && pastEntries.length === 0 && (
            <p className="text-sm text-slate-400 italic">Earlier entries will appear here.</p>
          )}
          {pastEntries.map(e => (
            <div key={e.id} className="rounded-2xl bg-white border border-black/5 shadow-sm p-4 animate-fade-up">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">{e.date}</span>
              </div>
              <p className="font-read text-base text-secondary mb-1">{e.prompt}</p>
              <p className="font-read text-lg leading-relaxed whitespace-pre-wrap text-slate-700">{e.answer}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function BookTab({ project }) {
  const { data: entries, loading } = useLive('entries', { filters: { projectId: project.id }, order: 'createdAt', limit: 1000 })
  const { data: authorRows } = useLive('profile', { limit: 1 })
  const author = authorRows?.[0] || {}
  const [generating, setGenerating] = useState(false)
  const dir = directionInfo(project.direction)

  const buildBook = async () => {
    setGenerating(true)
    try {
      const authorName = author.name || 'The Author'
      const pages = []
      const coverSections = [{
        type: 'cover',
        title: project.title,
        subtitle: dir.tagline,
        meta: [
          { label: 'Written by', value: authorName },
          { label: 'Entries', value: String(entries.length) },
          { label: 'Compiled on', value: new Date().toLocaleDateString() },
        ],
      }]
      if (project.details) {
        coverSections.push({ type: 'pageBreak' })
        coverSections.push({ type: 'heading', text: 'A note before you begin', level: 2 })
        coverSections.push({ type: 'paragraph', text: project.details })
      }
      coverSections.push({ type: 'pageBreak' })
      coverSections.push({ type: 'toc', title: 'Contents' })
      pages.push({ sections: coverSections })

      const sections = [{ type: 'pageBreak' }, { type: 'heading', text: 'Chapters', level: 1 }]
      entries.forEach((e, i) => {
        sections.push({ type: 'heading', text: e.prompt, level: 3 })
        sections.push({ type: 'paragraph', text: e.answer })
        if (i < entries.length - 1) sections.push({ type: 'divider' })
      })
      pages.push({ sections })

      const file = await docs.pdf({
        title: project.title,
        theme: { primary: '#203354', accent: '#b86a42' },
        page: { size: 'LETTER' },
        footer: { center: project.title, pageNumbers: true, line: true },
        pages,
      })
      await download.saveFile(file, `${project.title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  const hasContent = entries.length > 0

  return (
    <>
      <div className="rounded-3xl bg-white border border-black/5 shadow-lg shadow-black/5 p-6 md:p-8 mb-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-lg text-primary">{project.title}</p>
            <p className="text-sm text-slate-500">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
          </div>
        </div>

        {!loading && !hasContent && (
          <p className="text-slate-500 font-read text-lg mb-4">
            Answer a prompt in Write to begin your first chapter — your book fills in as you go.
          </p>
        )}

        <button
          onClick={buildBook}
          disabled={!hasContent || generating}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {generating ? 'Compiling your book…' : 'Download your book (PDF)'}
        </button>
        {!hasContent && <p className="text-xs text-slate-400 mt-3 text-center">Add at least one chapter first.</p>}
      </div>

      <div className="space-y-3 mb-8">
        {!loading && entries.map(e => (
          <div key={e.id} className="rounded-2xl bg-white border border-black/5 shadow-sm p-4 animate-fade-up">
            <p className="text-[11px] text-slate-400 mb-1">{e.date}</p>
            <p className="font-read text-base text-slate-700 truncate">{e.prompt}</p>
          </div>
        ))}
      </div>
    </>
  )
}
