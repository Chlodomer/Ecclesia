## Sound Asset Overview

* `webapp/public/sounds/chant` – liturgical beds (bells + chants). Use for prayerful outcomes and victories.
* `webapp/public/sounds/sermon/announcement_tone.mp3` – spoken-word cue (sermon start, decrees).
* `webapp/public/sounds/crowd` – ambient crowds and street gatherings (public feasts, markets).
* `webapp/public/sounds/discussion` – close murmurs for deliberations.
* `webapp/public/sounds/construction` – hammer and site ambience for building sequences.
* `webapp/public/sounds/quiet` – wind/forest textures for contemplative or neutral resolutions.
* `webapp/public/sounds/violence/sword_fight.mp3` – armed conflict or persecution moments.

### Parked bell assets (kept for future use)

The following bell recordings are kept in the repository but are currently unused in-game:

- `webapp/public/sounds/chant/church_bell_ringing.mp3`
- `webapp/public/sounds/chant/church_bell_single.mp3`
- `webapp/public/sounds/chant/church_bells_medieval.mp3`

To re‑enable bells without code changes, set the Vite env flag before starting the app:

```bash
# macOS/Linux
VITE_ENABLE_BELLS=true npm run dev

# or add to an .env file at webapp/.env
VITE_ENABLE_BELLS=true
```

Implementation detail: the sound manifest conditionally includes bell files when `VITE_ENABLE_BELLS=true` (see `webapp/src/lib/soundManifest.ts`).
