import React, { useState } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { payments } from '../lib/payments'
import { TIERS, tierLabel } from '../hooks/useMembership'

export default function PassOptions() {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const buy = async (tier) => {
    setError('')
    setBusy(tier.id)
    try {
      await payments.checkout({
        sku: tier.sku,
        name: `U Spk — ${tierLabel(tier.months)}`,
        amount: tier.price,
        currency: 'USD',
      })
      // checkout redirects away; membership unlocks on return via entitlements
    } catch (e) {
      if (e && e.code === 'NO_CONNECTION') {
        setError('Payments aren\u2019t connected yet. If you\u2019re the owner, finish the payment-setup card in the builder chat, then try again.')
      } else {
        setError('Something went wrong starting checkout. Please try again.')
      }
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIERS.map(tier => (
          <button
            key={tier.id}
            onClick={() => buy(tier)}
            disabled={!!busy}
            className={`relative text-left rounded-2xl border p-5 transition-all active:scale-[0.98] disabled:opacity-60 ${
              tier.tag === 'Best value'
                ? 'border-primary bg-primary/5 hover:bg-primary/10'
                : 'border-black/10 bg-white hover:border-primary/40'
            }`}
          >
            {tier.tag && (
              <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-white">
                {tier.tag}
              </span>
            )}
            <p className="font-display text-lg text-primary">{tierLabel(tier.months)}</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl text-primary">${tier.price}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">${tier.perMonth}/mo · billed once</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
              {busy === tier.id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {busy === tier.id ? 'Opening…' : 'Choose'}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
    </div>
  )
}
