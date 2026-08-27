import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Share2, PlusSquare, MoreVertical, Check, Smartphone, QrCode, Copy, Download, CheckCircle2 } from 'lucide-react'
import { push } from '../lib/push'

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

function detectPlatform() {
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export default function HowToInstall({ onBack }) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState(detectPlatform() === 'android' ? 'android' : 'ios')
  const [installed, setInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [installMsg, setInstallMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    const check = () => {
      if (cancelled) return
      try {
        setInstalled(push.isInstalled())
        setCanInstall(push.canInstall() && !push.isInstalled())
      } catch {
        setCanInstall(false)
      }
    }
    check()
    // Chrome fires its install-availability event shortly after load
    const t1 = setTimeout(check, 600)
    const t2 = setTimeout(check, 2000)
    return () => { cancelled = true; clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const runInstall = async () => {
    setInstallMsg('')
    try {
      const outcome = await push.promptInstall()
      if (outcome === 'accepted') {
        setInstalled(true)
        setCanInstall(false)
      } else if (outcome === 'dismissed') {
        setInstallMsg('No problem — you can add it any time with the steps below.')
      } else {
        setInstallMsg('Your browser handles this from its own menu — see the steps below.')
      }
    } catch {
      setInstallMsg('Your browser handles this from its own menu — see the steps below.')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-paper text-[#1c2434]">
      <div className="max-w-3xl mx-auto w-full px-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-16">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 -ml-1 py-2"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-3 py-1.5 mb-5">
          <Smartphone size={14} />
          <span className="text-xs font-semibold tracking-wide uppercase">Keep it on your phone</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl leading-tight">
          Add U Spk to your home screen
        </h1>
        <p className="font-read text-base md:text-lg text-slate-600 mt-4 leading-relaxed">
          U Spk works like any app on your phone — its own icon, full screen, no browser bars.
          You just add it yourself in two taps. It takes about ten seconds, uses almost no
          storage, and there's no app store, no download, and no account with Apple or Google needed.
        </p>

        {installed && (
          <div className="mt-8 flex items-start gap-3 bg-secondary/10 border border-secondary/20 rounded-2xl p-5">
            <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-primary">You're all set</h2>
              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                U Spk is already on this device's home screen. Open it from the icon any time.
              </p>
            </div>
          </div>
        )}

        {!installed && canInstall && (
          <div className="mt-8 bg-primary rounded-2xl p-6 text-white">
            <h2 className="font-display text-xl mb-1.5">Add it right now</h2>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Your browser can do this in one tap — no steps needed.
            </p>
            <button
              onClick={runInstall}
              className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-5 py-3 text-sm font-bold transition-transform active:scale-[0.98]"
            >
              <Download size={16} />
              Add U Spk to home screen
            </button>
          </div>
        )}

        {installMsg && (
          <p className="text-sm text-slate-500 mt-4">{installMsg}</p>
        )}

        {/* Platform tabs */}
        <div className="flex gap-2 mt-9 mb-5">
          {[
            { id: 'ios', label: 'iPhone / iPad' },
            { id: 'android', label: 'Android' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-black/5 text-slate-500 hover:text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
          {tab === 'ios' ? (
            <ol className="space-y-5">
              <Step n={1} title="Open this page in Safari">
                If you're reading this in another app (Instagram, Messages, Facebook), tap the
                <span className="font-semibold"> ⋯ </span> menu and choose “Open in Safari” first.
                Home-screen install only works from Safari on iPhone.
              </Step>
              <Step n={2} title="Tap the Share button" icon={Share2}>
                It's the square with an arrow pointing up — at the bottom of the screen on iPhone,
                or the top on iPad.
              </Step>
              <Step n={3} title="Choose “Add to Home Screen”" icon={PlusSquare}>
                Scroll down the list of options a little; it sits under the row of sharing icons.
              </Step>
              <Step n={4} title="Tap “Add”" icon={Check}>
                The U Spk icon appears on your home screen. Open it from there from now on.
              </Step>
            </ol>
          ) : (
            <ol className="space-y-5">
              <Step n={1} title="Open this page in Chrome">
                If you arrived from another app, tap its menu and choose “Open in Chrome”.
              </Step>
              <Step n={2} title="Look for the Install prompt">
                Chrome often shows an “Install app” or “Add to Home screen” banner near the bottom.
                If you see it, tap it — you're done.
              </Step>
              <Step n={3} title="Or use the menu" icon={MoreVertical}>
                No banner? Tap the three dots in the top-right corner, then choose
                “Add to Home screen” or “Install app”.
              </Step>
              <Step n={4} title="Confirm" icon={Check}>
                Tap “Install” or “Add”. The U Spk icon lands on your home screen.
              </Step>
            </ol>
          )}
        </div>

        {/* QR + link sharing */}
        <div className="mt-10 bg-primary rounded-2xl p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={16} className="text-white/70" />
            <h2 className="font-display text-xl">Share U Spk</h2>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            Anyone who scans this code or opens the link lands straight on U Spk — then they can
            add it to their home screen with the steps above.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="bg-white p-3 rounded-xl self-start shrink-0">
              <QRCodeSVG value={APP_URL} size={132} level="M" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-white/50 font-semibold mb-2">Your link</p>
              <p className="font-read text-sm break-all text-white/90 mb-4">{APP_URL}</p>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.98]"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-8 leading-relaxed">
          Adding to your home screen doesn't install anything from an app store — it saves a
          shortcut that opens U Spk full screen. Your writing is saved to your account, so it's
          there whether you open it from the icon or the link.
        </p>
      </div>
    </div>
  )
}

function Step({ n, title, icon: Icon, children }) {
  return (
    <li className="flex gap-4">
      <div className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
        {n}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-primary flex items-center gap-2 mb-1">
          {title}
          {Icon && <Icon size={15} className="text-secondary shrink-0" />}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">{children}</p>
      </div>
    </li>
  )
}
