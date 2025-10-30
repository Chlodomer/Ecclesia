# Ecclesia Web Client

Single-player narrative game for late antique Christian community building. This repo contains the Vite/React TypeScript app that powers the interactive experience, reporting, and classroom-ready tooling.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>. Hot Module Replacement is enabled.

Optional: copy `.env.example` to `.env` if you want to toggle feature flags locally (e.g., enabling the new tutorial overlay with `VITE_FEATURE_TUTORIAL=true`).

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – type-check and create a production build
- `npm run preview` – serve the built bundle locally
- `npm run lint` – lint with ESLint flat config
- `npm run test` / `npm run test:watch` – run Vitest suites
- `npm run test:coverage` – coverage report via V8
- `npm run format` / `npm run format:check` – Prettier format commands

## Project Layout

- `src/app` – application shell & global providers
- `src/features` – feature modules (gameplay, onboarding, reporting, etc.)
- `src/styles` – global tokens, base styles, shared primitives
- `src/test` – Vitest setup and helpers
- `public/assets` – shared art & audio assets used in the client
- `docs/architecture.md` – architecture notes & upcoming module plan

With the current build, visiting the dev server first prompts for student name and email (stored locally under `ecclesia.studentSession`), then drops you into an interactive narrative loop with live stat updates, weighted outcomes, reflection prompts, and a 6–7 second observation pause between events.

## Deployment

`npm run build` emits a static site (`dist/`). The repo includes a free, always-on GitHub Pages workflow that deploys `webapp/dist` on pushes to `main`:

- Workflow: `.github/workflows/deploy-pages.yml`
- SPA routing: `404.html` is generated from `index.html`
- Base path: auto-configured for project pages (e.g. `/repo-name/`)

To use it:
1. Push to `main` on GitHub.
2. In your repo Settings → Pages, set Source to “GitHub Actions” (if not auto-enabled).
3. The site will be available at `https://<user>.github.io/<repo>/` (or your custom domain).

Alternate free hosts (optional): Cloudflare Pages or Netlify also work well for static sites.
