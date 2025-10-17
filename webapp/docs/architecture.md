# Ecclesia Web Application Architecture

## Stack Overview

- **Runtime:** React 19 + TypeScript compiled via Vite.
- **Styling:** CSS Modules for feature-level styles, shared design tokens declared in `src/styles/global.css`.
- **State Management:** Local component state for scaffolding, to be replaced with battle-tested stores (e.g. Zustand) when gameplay systems arrive.
- **Testing:** Vitest + Testing Library with JSDOM environment (see `npm test`).
- **Lint & Formatting:** Flat ESLint config plus Prettier; run `npm run lint` and `npm run format`.

## Directory Layout

```
src/
  app/               Application shell, high-level providers & routing.
  features/game/     Gameplay surface and nested feature modules.
  styles/            Global tokens, resets, shared primitives.
  test/              Test utilities and setup files.
  lib/               (reserved) shared helpers/utilities.
```

Feature modules follow a co-located structure (`index.ts`, components, hooks, services). Content decks, audio manifests, and localization tables will live under `src/content/` once authored.

## Upcoming Modules

1. **Reporting:** JSON export containing student identifiers, decision log, outcomes, rationales, and derived performance metrics.
2. **Audio Manager:** user-gesture-gated playback for contextual SFX (chanting, building, etc.) with volume controls.

_Delivered:_
- Onboarding gate captures identity, locks attempts per browser, and exposes the active session via context.
- Game engine (`useGameEngine`) drives the event loop with weighted outcomes, stat deltas, era-aware deck selection, cooldown pacing, and a running decision log for analytics.

These modules will be wired through context providers exposed by `src/app` so the root shell stays declarative and testable.

## Deployment Targets

The Vite build emits a static site (`npm run build`). Deploy via Netlify, Vercel, or GitHub Pages; no server is required unless we later persist reports centrally.
