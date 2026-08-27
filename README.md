# EchoLegacy — legacy-book-write

A prompt-a-day writing app. You pick a *direction* for a book — memoir, personal
journal, letters to the people you love, a how-to guide, a self-help book, a faith
story, a novel — and the app gives you one writing prompt at a time. Your answers
accumulate, day by day, into a real book you can read back and export.

This repository is the consolidated source code, exported from Whacka.

## What the app does

- **Books (`src/pages/Projects.jsx`)** — start and browse book projects, each with a
  chosen direction from `src/prompts.js`.
- **Write / Your Book (`src/pages/ProjectPage.jsx`)** — answer today's prompt, keep a
  writing streak, then read the accumulated entries as a formatted book and download
  or print it.
- **Membership (`src/pages/MembershipGate.jsx`, `src/hooks/useMembership.js`)** —
  access is unlocked by one-time duration passes (3 / 6 / 12 months) that stack; the
  expiry is server-verified and stored on the user's profile.
- **Profile (`src/pages/Profile.jsx`)** and **Install (`src/pages/HowToInstall.jsx`)** —
  account details and PWA install instructions.
- **Prompts (`src/prompts.js`)** — the direction presets, each with a static fallback
  prompt list and an AI hint used to generate the daily prompt.

## Layout

```
index.html            App shell: safe-area CSS, error capture, OAuth-return handling
vite.config.js        Vite + React, with defensive transforms for generated code
tailwind.config.js    Tailwind theme (primary/secondary read from CSS variables)
src/App.jsx           Router, auth gate, membership gate, responsive shell
src/main.jsx          Entry point (platform bootstrap stubbed — see below)
src/pages/*           Screens
src/components/*      GateLock, PassOptions
src/hooks/*           useMembership
src/prompts.js        Book directions and prompt generation helpers
src/lib/*             Whacka client SDK stubs (db, auth, ai, payments, docs, push, …)
```

## Does it run standalone?

**Not as-is.** Everything under `src/lib/` is a *stub*. Data, auth, AI, payments,
storage and push are powered by Whacka's hosted backend, and the client SDK that talks
to it is provided to the app at runtime — it is not part of the export. Each stub
exports a proxy that throws if called:

```
`db.list` runs on the Whacka platform and is not available in exported code.
```

So `npm install && npm run dev` will build and serve the UI, but any screen that
touches `db`, `auth`, `ai`, `payments` or `docs` will throw as soon as it calls out.

To run this outside Whacka, replace `src/lib/*` with real implementations — the stubs
double as the interface list: each file names exactly which APIs the app code uses
(see `src/lib/db.js`, `src/lib/auth.js`, `src/lib/ai.js`, `src/lib/payments.js`,
`src/lib/docs.js`, `src/lib/useLive.js`). The rest of the code — `App.jsx`, `pages/`,
`components/`, `hooks/`, `prompts.js` — is complete and untouched.

## Local development

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Ownership

The application code here is yours. The Whacka platform SDK and backend that make it
run are Whacka's, and are not included in this export.
