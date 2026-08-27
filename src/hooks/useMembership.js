import { useEffect, useState, useRef, useCallback } from 'react'
import { auth } from '../lib/auth'
import { db } from '../lib/db'
import { payments } from '../lib/payments'

// Duration passes — one-time payments that unlock the whole app for a fixed
// window. Longer pass = better per-month value. Buying more time while a pass
// is still active STACKS on top of the remaining days.
// Prices are easy to change — just edit `price` below.
export const TIERS = [
  { id: '3mo', sku: 'uspk-pass-3mo', months: 3, price: 39, perMonth: '13' },
  { id: '6mo', sku: 'uspk-pass-6mo', months: 6, price: 69, perMonth: '11.50', tag: 'Most popular' },
  { id: '12mo', sku: 'uspk-pass-12mo', months: 12, price: 119, perMonth: '9.92', tag: 'Best value' },
]

export function tierLabel(months) {
  return months === 12 ? '12-month pass' : `${months}-month pass`
}

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function daysBetween(from, to) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)))
}

/**
 * Server-verified membership state.
 * Access is granted for a time window computed from confirmed one-time
 * purchases of the pass SKUs. Each pass extends `membershipUntil`; extra
 * purchases stack. The computed expiry is stored on the user's private
 * profile record so the countdown survives reloads. The app owner always
 * has access to their own app.
 */
export function useMembership() {
  const [state, setState] = useState({ loading: true, active: false, until: null, isOwner: false })
  const reconciling = useRef(false)

  const check = useCallback(async () => {
    if (auth.isAppOwner()) {
      setState({ loading: false, active: true, until: null, isOwner: true })
      return
    }
    try {
      const ent = await payments.getEntitlements()
      const purchases = ent.purchases || []

      const rows = await db.select('profile', {}, { limit: 1 })
      const prof = rows[0] || {}
      const applied = { ...(prof.membershipApplied || {}) }
      let until = prof.membershipUntil ? new Date(prof.membershipUntil) : null

      let changed = false
      const now = new Date()
      for (const tier of TIERS) {
        const p = purchases.find(x => x.sku === tier.sku)
        const count = p ? p.count : 0
        const already = applied[tier.sku] || 0
        const fresh = count - already
        if (fresh > 0) {
          const base = until && until > now ? until : now
          until = addMonths(base, tier.months * fresh)
          applied[tier.sku] = count
          changed = true
        }
      }

      if (changed && !reconciling.current) {
        reconciling.current = true
        try {
          await db.upsert('profile', {
            membershipUntil: until.toISOString(),
            membershipApplied: applied,
          }, 'my-profile')
        } finally {
          reconciling.current = false
        }
      }

      const active = !!until && until > new Date()
      setState({ loading: false, active, until, isOwner: false })
    } catch {
      setState({ loading: false, active: false, until: null, isOwner: false })
    }
  }, [])

  useEffect(() => {
    check()
    const sub = payments.onPayment(check)
    return () => { try { sub && sub.unsubscribe && sub.unsubscribe() } catch {} }
  }, [check])

  return { ...state, refresh: check }
}
