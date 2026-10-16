# Corn Ornament — 3D Scroll Hero Prototype

## Context
User sells resin-coated "glass gem" corn cob ornaments (gold/silver filigree cap + lobster clasp, no husk; sphere variant exists). They want a landing page with the cinematic, scroll-driven 3D feel of alethia.earth. Analysis (in `corn/docs/analysis/`): alethia uses a pre-rendered image sequence, not Three.js — we'll get the same feel with a real, procedural Three.js scene (recolorable, live). Decisions made: **3D hero prototype only**, **light pearl + gold theme**, product called **"corn ornament"**, deps approved **without bloom**.

Goal: a standalone prototype page that nails the look and scroll choreography before any shop work.

## Stack
Vite 8.3.4 + React 19.3.0 + three 0.186.1 + @react-three/fiber 9.8.1 + @react-three/drei 10.7.9 + gsap 3.15.0 + @gsap/react 2.1.2 + lenis 1.3.26. Tests via built-in `node:test` (no new dep).
Project is not a git repo → no worktree; build directly in `corn/`. Copy this plan to `corn/docs/plans/3d-hero-prototype.md` after approval.

## Design system (light pearl)
- Tokens: bg `#F2EEE8`, ink `#16131A`, gold `#C9A14A`, muted `#8A8378`; kernel palettes from `products.md` (Heirloom Rainbow, Ember, Blush, Twilight, Pearl, Noir).
- Type (Alethia pattern): Geist Medium headings (72px desktop, -0.05em, lh 0.95), Geist Mono uppercase labels/chips — loaded from Google Fonts.
- Mono overlay chips over canvas ("RESIN-SEALED · REAL CORN", kernel count), gold chip labels per section.
- Lighting tuned for light bg: warm key + cool rim Lightformers, soft ContactShadows, ACES, so glints read against pearl.

## Architecture (from `docs/analysis/threejs-approach.md`)
- Fixed `<Canvas>` behind normal DOM sections; Lenis (autoRaf off) driven by `gsap.ticker`; one scrubbed ScrollTrigger timeline tweens a plain `sceneState` object; `useFrame` damps toward it (no per-frame React state).
- Kernels: one `InstancedMesh` (14 rows × 20 = 280), per-instance attributes `aDir, aRand, aColorA, aColorB, aSpherePos`; explode / colour-wave / starburst done in shader via `onBeforeCompile` on `MeshPhysicalMaterial` (clearcoat; Fresnel fake translucency — transmission deferred to slice 2).
- Cap: LatheGeometry + procedural filigree alphaMap (canvas-generated, no asset); jump ring torus; simplified procedural clasp.
- Fallback: no WebGL2 or `prefers-reduced-motion` → static poster (owner's photo P0070 copied to `public/poster.jpg`), native scroll.

## Files (one owner each)
```
corn/
  package.json, vite.config.js, index.html          — scroll-builder
  src/main.jsx, src/App.jsx, src/styles.css          — scroll-builder
  src/scroll/useScrollTimeline.js, sceneState.js     — scroll-builder
  src/sections/Sections.jsx, Poster.jsx              — scroll-builder
  src/three/layout.js   (pure math, no three import) — scene-builder
  src/three/palettes.js                              — scene-builder
  src/three/Charm.jsx, Kernels.jsx, Cap.jsx          — scene-builder
  src/three/resinMaterial.js, filigreeTexture.js     — scene-builder
  src/three/Scene.jsx (Canvas, lights, rig)          — scene-builder
  test/layout.test.js, test/palettes.test.js         — tester
```
Contract between builders: `sceneState = { camPos, camTarget, swing, spread, colorMix, paletteFrom, paletteTo, starburst, capRotY, sphereMix }` defined in `src/scroll/sceneState.js`; Scene reads it, timeline writes it.

## Team (3 teammates, lead coordinates only)
1. **tester** (qa-test) — writes `node:test` specs first: `layout.js` (280 kernels, unique positions, outward normals, stagger, taper at tip, Fibonacci sphere points on radius), `palettes.js` (all colorways valid hex, weighted pick deterministic per seed).
2. **scene-builder** (team-builder) — layout math until tests pass, then Charm/materials/shaders/Scene.
3. **scroll-builder** (team-builder) — scaffold, Lenis+GSAP timeline, DOM sections, theme, poster fallback.
Then a **code-review** pass by the lead's reviewer after both builders finish.

## Slice 1 (this session) — beats 1–4
1. Hero: ornament hangs from clasp, pendulum sway + pointer parallax.
2. "Real corn, sealed in resin": macro camera along kernel rows, starburst fades in.
3. "Every kernel unique": kernels explode outward and reassemble.
4. Colorways: colour wave up the cob, synced DOM swatches (click also works under reduced motion).

## Slice 2 (next session)
Beat 5 cap rotation + gold/silver toggle, beat 6 cob→sphere morph, beat 7 CTA settle; high-tier transmission; clasp polish / beaded strap; PerformanceMonitor tiers.

## Verification
- `npm test` (node:test) green; `npm run build` green with no warnings.
- `npm run dev` → **verify-app** teammate drives Chrome: scroll through all 4 beats, screenshots at each, check console clean, test 390px mobile width, test reduced-motion emulation shows poster.
- Lead reports results; no commit (not a repo; never commit without asking).
