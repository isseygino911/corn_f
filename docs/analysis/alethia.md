# alethia.earth — design analysis

Analyzed 2026-10-14 at a 1512×827 desktop viewport in Chrome. Read-only. No forms submitted, and no cookie banner appeared.

## TL;DR

- **Built in Framer** (`meta generator: Framer c54c588`) with **Lenis** smooth scroll (`<html class="lenis lenis-smooth">`, `lenis.*.mjs`) and Framer Motion (`motion.*.mjs`) for reveals. There's no GSAP, no ScrollTrigger and no Three.js (`window.__THREE__` is undefined).
- **The "3D" hero is not real-time WebGL.** It's a **scroll-scrubbed image sequence**: 187 pre-rendered WebP frames (`r2-assets.alethia.earth/framer/1920/floating-island_00000…00186.webp`). They're drawn into one `position:fixed` **2D canvas** (2268×1240, DPR 1.5) inside a layer named `scrub DSK`, in a section named `peliculita` ("little film"). The model is an offline render (Blender/C4D-style) of a mossy floating rock island.
- Other "3D" moments are **looping WebM videos** (`scan.webm`, `loop1.webm`, `loop2.webm`, `CLOUDS_no fade.webm`) plus pre-rendered PNG product shots, layered under sticky sections with opacity and blur crossfades.
- The hero **doesn't react to the mouse**. A synthetic mousemove/pointermove test produced no transform changes. All motion is scroll-driven.

## 1. Page structure (top → bottom, doc height ≈ 12,968px at 827px viewport)

| # | Section (Framer layer name) | Content | Notes |
|---|---|---|---|
| 0 | `Preloader` / `loading` | Near-black `#0f0f0f` screen, tiny white hexagon (logo glyph) in centre, faint dark silhouette of the rock island | Lenis is stopped (`lenis-stopped`) until frames are loaded. Then the island "lights up" from black and the H1, CTA and nav fade in. |
| 1 | Hero (inside `Rock Section`, ~2,646px tall, sticky/fixed layers) | H1 "Where Ecosystem Science and Enterprise Strategy Meet" (left, 72px), outlined "LET'S TALK" button, sub-copy bottom-left "Know your impact—precisely…", "Scroll to discover" bottom-right with a mouse icon. The centre rock island plus 3–4 smaller floating rocks sit on a deep forest-green bg `#0f1f10`. A mono HUD overlay sits on the rock: a scanning rectangle, a `-8.3 tCO₂E` chip and a data ticker "VERIFIED REMOVAL -1.2 tCO₂…" | The rock image sequence scrubs with scroll. The camera dollies **into** the rock until the moss fills the screen, becoming a green tunnel/portal. |
| 2 | "Our Vision" (same pinned scene) | Lime chip "OUR VISION" + centred H2 "From Data Chaos to Science-Backed, Actionable Insights" + sub "A Breakthrough In Environmental Measurement. Built for Commercial Use." | Text fades in **over** the zoomed-in moss. The hero copy fades and blurs out as you scroll. |
| 3 | `Loops section` / Clouds | Crossfades (through grey fog / `CLOUDS` video) into a macro photoreal scene of a fern, soil and moss (looping video). Large paragraph "Our Ecosystem-Level Accounting Solutions translate complex scientific data…", mono label top-left "REAL-TIME, BLOCKCHAIN-BACKED CARBON INTELLIGENCE", and 4 lime circular hotspots with mono captions "CO₂ EMISSIONS REACH RECORD HIGH IN 2024" | Text reveals line by line, with a masked or opacity sweep. |
| 4 | `Steps` / `Antena` | Dark bg, rendered **sensor tower** (eddy-covariance mast). Left: glass card "Accumulated carbon balance 24 tCO₂e" with a mini line chart. Right: accordion list `01.`–`05.` (GOLD-STANDARD OBSERVATION SYSTEMS …) with `+` icons. Heading "↗ Scientific Credibility to Corporate Climate Action" | A pinned step sequence where the tower scales and pans between steps. |
| 5 | `solutions` (white `#ffffff`/`#f5f4f2` bg) | Lime chip "OUR SOLUTIONS", H2 "Validating What the Ecosystem Does Naturally", 2 large image cards (rounded ~20px): "[NATURE-BASED SOLUTIONS] Carbon Markets Built on Truth, Not Estimates" and "[SUPPLY CHAIN SOLUTIONS] …". Each card has a lime round arrow button top-right | A hard cut from the dark scene to a light section. Cards have hover variants (`Variant 1/2`). |
| 6 | `Our Tech DSK` (black `#000`, ~3,300px, `Sticky` + `Data 1-3` + `Data final`) | "OUR TECHNOLOGY" chip, centred H2 "Scientific Rigor. Commercial Precision. Unmatched Trust." over a giant blurred close-up of a radiation shield. Then "ATMOSPHERIC-BASED MRV" (left text, tower right) → "BLOCKCHAIN TECHNOLOGY" (right text, anemometer + glass UI cards: "Main Sensor 864,000 inputs/day", carbon-balance chart) → "NO SPREADSHEETS / NO GUESSWORK — Just Real, Measured Insight Delivered with Integrity." | A sticky stage with black overlay blobs (`Blck ov`, `bl ov`) that fade and blur between steps. Product renders get rack-focus blur in and out. |
| 7 | `alethia solves` (off-white `#f5f4f2`) | "ALETHIA SOLVES" chip, H2 "The Biggest Problem in Climate Action: Trust", body copy, scattered collage tiles: contour-line topo drawing, leaf photo + dark chart card, lime "CARBON BALANCE -2.4 tCO₂e" card, small rock render + "42.152 INPUTS/DAY" card | Tiles parallax and drift at different rates. |
| 8 | `not just evolving` | H2 "We're Not Just Evolving the System. We're Redefining It." + 2×2 grid of white pill cards with lime number circles 01–04 | Simple fade-up. |
| 9 | `Case studies` | "CASE STUDIES" chip + heading + horizontal carousel (prev/next circle buttons): big white card, image left, "SUCCESS STORY" chip, title, author + mono role, dark round arrow button | |
| 10 | News | "LATEST NEWS & INSIGHTS / Insights that Move the Market." + "SEE ALL" + news card (image with frosted "MEDIA & PRESS" pill, mono date, title, excerpt, "FULL STORY >") | |
| 11 | Final CTA + footer | Full-bleed blurred moss **video** bg. Lime-tinted (`#d5eebc`) H2 "Turn Climate Data Into Business Results", sub, solid lime "LET'S TALK" button. A **giant "alethia" wordmark** spans the full width (lime). Footer: 2 city lines (large sans), 4 link columns in mono uppercase with dim group labels, LinkedIn/Instagram, "© 2025", "Made by ++", "Back to top ↑" | |

**Copy tone:** confident, B2B-premium, short declarative headlines with full stops ("Scientific Rigor. Commercial Precision. Unmatched Trust."). Sections are labelled with tiny mono "eyebrow" chips. Data and HUD micro-copy (numbers + units) makes the product feel instrumented and real.

## 2. The 3D / WebGL work

- **Technique:** an image-sequence scrubber, i.e. Apple-style "canvas frame scrub". There's a single `<canvas>` (2D context), `position:fixed`, full viewport. Frame index = scroll progress through the ~2,646px `Rock Section` × 186. Lenis smoothing makes the scrub feel inertial and cinematic.
- **What's rendered:** a photoreal floating rock island covered in moss, grass and small plants, with smaller bare rocks around it (also part of the frames, or separate images). Lighting is a soft key from upper-left with warm rim highlights. Shadows are dark and fall off into the green void. There's no visible bloom. The grade is natural with slight desaturation, and the moss shifts to a **neon chartreuse** in the zoomed frames (a stylised "data/scan" look).
- **Camera path:** starts with a 3/4 view of the island, slow rotation plus dolly-in. By ~1 viewport of scroll the camera is inside the moss and the frame is a ring/portal of foliage around a dark centre, where the "Our Vision" text sits. Then it crossfades to clouds/fog and the next scene.
- **Intro:** first frame shown as a black silhouette, brightened to full exposure on load (loader → reveal).
- **HUD overlay (DOM, not WebGL):** a thin 1px scanning rectangle, a lime/mono value chip and a scrolling data ticker pinned over the model. This sells "measurement".
- **Other 3D-looking elements:** WebM loops and PNG renders (sensor tower, anemometer, radiation shield) with CSS blur, scale and opacity driven by scroll.
- **Mouse:** no parallax or tilt was detected. There's **no custom cursor** (`cursor: auto`).

## 3. Scroll & motion

- **Lenis** smooth scroll, stopped during the preloader.
- **Framer scroll transforms and appear effects** (Framer Motion) do the work instead of GSAP: opacity, translateY, blur and scale tied to scroll progress. Sticky containers create pinned "stages": Rock Section ≈ 3.2 vh, Our Tech ≈ 4 vh with `Data final` sticky.
- **Transitions:** crossfades with blur between scenes. Black overlay blobs fade the stage between steps. Large headlines fade and blur out upward as the next one fades in.
- **Reveals:** fade-up with slight blur on text blocks. Collage tiles move at varied parallax speeds.
- **Loader:** dark screen + hexagon glyph → island lights up → UI fades in.

## 4. Visual system

**Colors (Framer tokens on `body`):**

| Token | Hex | Use |
|---|---|---|
| Forest ink | `#0f1f10` | Hero bg, dark text on light sections, dark buttons |
| Lime | `#c6f19d` | Chips, icon buttons, hotspots, CTA fill |
| Pale lime | `#d5eebc` | Text on dark (final CTA, footer wordmark) |
| Bone | `#f5f4f2` | Light section bg, H1 text on dark |
| White | `#ffffff` | Cards, text |
| Near-black | `#0f0f0f` / `#000000` | Loader, tech section |
| Grey | `#e0e0e0` | Dividers |
| Glass | `rgba(255,255,255,.1)` / `rgba(243,243,243,.1)` | Frosted pills and cards on imagery |

**Fonts:** **Geist** (sans: Regular 400 / Medium 500 / SemiBold 600) for display and body. **Geist Mono** (400/500/600, **uppercase**) for nav, buttons, eyebrows, labels and data. Both are free (Vercel / Google Fonts).

| Role | Spec |
|---|---|
| H1 | Geist Medium 72px / lh 0.95 (68.4px) / tracking −0.05em (−3.6px) |
| H2 large | Geist Medium 64px / −3.2px; 56px / −2.8px |
| H3 | Geist Medium 40px / lh 38px / −1.2px |
| Lead body | Geist Regular 24px / lh 1.0 / −0.96px |
| Body | Geist 18–20px / lh 1.2 / −0.02em |
| Small | Geist 14px / −0.42px |
| Nav / buttons | Geist Mono 14–16px, 500, uppercase |
| Eyebrow chip | Geist Mono 14px 500 uppercase, `#0f1f10` on `#c6f19d`, ~4px radius, ~6×4px padding |
| Data micro | Geist Mono 10–12px |

Pattern: **tight negative tracking and sub-1.0 line-height on display type, with mono uppercase for everything functional.**

**Layout:** 28px side gutter at desktop, content flush-left for the hero and centred for manifesto statements. Cards have radius ~20–24px. Lots of empty space, and each section is about one idea.

**Nav:** fixed, transparent (no bg, no backdrop blur). Logo left, centre mono links with chevrons (dropdowns), right "LET'S TALK" + small lime square chevron icon.

**Buttons:** mono uppercase label + **small square (~26px, 4px radius) lime icon box with a chevron**. The variants are an outlined ghost button (1px light border, ~8px radius, dark transparent bg), a solid lime button (dark icon box), and round lime or dark 36px arrow buttons on cards.

## 5. Responsive

Framer breakpoints: **≥1440 / 1000–1439 / <1000** (other components use 1199/809 and 960). Desktop-specific layers are suffixed `DSK` (`scrub DSK`, `Our Tech DSK`, `St 3 DSK`, `Video 1 DSK`), which implies separate mobile variants and probably a different sequence or video on mobile. The frame folder is `/1920/`, so another resolution folder likely exists for small screens. I couldn't verify at phone width: the window resize didn't change the viewport (stayed 1512px).

## 6. Screenshots (saved by Claude-in-Chrome)

Folder: `/var/folders/tr/r_63b_ws3wl52xfd_zj33n5r0000gn/T/claude-chrome-screenshots-Owo36E/`

| File | What |
|---|---|
| `screenshot-1791961600450-0.jpg` | Preloader (black, hexagon, rock silhouette) |
| `screenshot-1791961738390-31.jpg` | Intro: island lighting up from black |
| `screenshot-1791961613740-1.jpg` | **Hero, full** |
| `screenshot-1791961651062-2.jpg` | Camera dolly into moss, hero text fading |
| `screenshot-1791961651063-3.jpg` | "Our Vision" inside the moss portal |
| `screenshot-1791961651064-6.jpg` | Fern/moss scene with lime hotspots |
| `screenshot-1791961651064-7.jpg` | Sensor tower + accordion + glass card |
| `screenshot-1791961668274-8.jpg` | Solutions (light section, image cards) |
| `screenshot-1791961668280-10.jpg` | "Our Technology" manifesto on black |
| `screenshot-1791961668281-14.jpg` | Blockchain step with UI cards |
| `screenshot-1791961688393-18.jpg` | "Alethia Solves" collage |
| `screenshot-1791961688394-20.jpg` | 01–04 grid |
| `screenshot-1791961688395-22.jpg` | Case study carousel |
| `screenshot-1791961705170-26.jpg` | Final CTA + giant wordmark |
| `screenshot-1791961705171-28.jpg` | Footer |

## 7. Recreating the feel with Three.js for a corn-ornament shop

1. **Decide between real-time and image sequence.** Alethia's photoreal look comes from offline renders. For a live Three.js version, use a single hero GLB (a corn ornament: cob + husk, or a dried-corn wreath) with PBR textures and an HDRI environment (warm studio or golden-hour). Add soft shadows and ACES tone mapping, keep post-processing subtle (light bloom on highlights, vignette, film grain), and use a dark harvest background (for example deep husk-brown or forest green).
2. **Scroll-scrubbed camera path, not mouse-driven.** Lenis plus normalized scroll progress over a pinned ~300vh hero should drive a spline camera: 3/4 orbit → dolly into the kernels/husk until they fill the screen (the "portal") → the manifesto line fades in over it. Optional subtle mouse parallax is an improvement over Alethia.
3. **Floating satellites:** 3–5 smaller ornaments or loose kernels drifting at different depths and rotation speeds (instanced meshes) echo the floating rocks.
4. **Loader:** model shown as a silhouette (exposure 0) → ramp the light up when assets are ready, then fade in the UI. Hold scroll (`lenis.stop()`) until then.
5. **HUD overlay in DOM** over the canvas, with mono chips like "HAND-DRIED · 100% NATURAL" and a thin scan box tracking the model. It's cheap to build and does a lot for the look.
6. **Design system to copy:** Geist + Geist Mono uppercase, tight negative tracking, one dark ink + one bright accent (swap lime `#c6f19d` for a corn-gold such as `#f2c94c`/`#e8b23a` on deep `#1a140c` or keep forest `#0f1f10`), bone `#f5f4f2` light sections, eyebrow chips, buttons with a small square accent icon box, a giant wordmark footer over a blurred video or render.
7. **Rhythm:** alternate dark cinematic pinned stages with calm light sections (product cards, collage, testimonials carousel, final CTA).
8. **Perf:** compress the GLB with Draco/meshopt and KTX2 textures, cap DPR at 1.5–2, and give mobile a simplified scene or a poster image (Alethia ships separate `DSK` layers for desktop).
