# Glass Gem Farm — Alethia-style full landing page

## Context
The photo-based scroll hero (beats 1–4, `corn/src/`) works, and the user now wants the **whole page restructured like alethia.earth** (analysis: `corn/docs/analysis/alethia.md` §1) using our own photos, with newly written copy. Facts supplied by the user: every ornament is **handmade on a farm in Yancheng, Jiangsu, China**. Brand/wordmark: **Glass Gem Farm**. Scope stays a single landing page (no cart/checkout). Rejected: Three.js (archived in `../corn-three-archive/`).

## Palette (derived from the real product photos + collages)
Kernels read as dusty rose, coral, slate, mauve, olive/moss, cream; hardware is gold and silver; backdrops are gray seamless or black velvet with green plant leaves.

| Token | Hex | Source / use |
|---|---|---|
| ink (aubergine) | `#231A29` | darkest kernels / Noir; dark stages, text on light |
| bone | `#F5F0EA` | gray-seamless warmed; light sections |
| rose (single accent, = Alethia's lime) | `#E8B7B0` | blush kernels; chips, buttons, hotspots |
| gold | `#C9A14A` | cap/clasp hardware; hairlines, small details |
| slate | `#5B6378` | twilight kernels; muted text |
| moss | `#6F7A4E` | olive kernels / plant leaves; rare secondary (farm section) |

Type unchanged: Geist (headings, -0.05em, lh .95) + Geist Mono uppercase (chips, nav, buttons).

## Page structure (Alethia → ours)
| # | Alethia | Ours | Treatment |
|---|---|---|---|
| 0 | Preloader | dark aubergine screen, hero photo brightens from silhouette | exists (`ready` intro) |
| 1 | Hero | **Harvest, held in glass.** + outlined "SHOP THE COLLECTION" + mono chips "HAND-MADE · YANCHENG, JIANGSU" | exists; add nav + CTA |
| 2 | Our Vision | **From our farm to your hands.** over zoomed kernels | exists (beat resin), new copy |
| 3 | Clouds/loops | **Every kernel unique.** drifting tiles | exists |
| 4 | — | **Pick your harvest.** blur-crossfading colorways | exists |
| 5 | Steps / sensor tower | **How it's made** — dark, sticky photo left, accordion 01–05 right | new |
| 6 | Solutions | **Collections** — 2 big rounded cards (Corn Charms, Corn Pearls) with rose arrow buttons | new |
| 7 | Alethia solves | **Made on a farm in Yancheng** — collage tiles + body copy | new |
| 8 | Not just evolving | **Four promises** — 2×2 pill cards 01–04 | new |
| 9 | Case studies | **Pairings** — horizontal carousel of cob + strap pairs | new |
| 10 | News | **Questions** — 3-item accordion | new |
| 11 | Final CTA + footer | dark blurred-photo bg, **Turn a harvest into a keepsake.**, giant **Glass Gem Farm** wordmark, footer columns, "Made in Yancheng, Jiangsu, China", Back to top | new |
Nav (fixed, transparent): wordmark left, mono links Collection / Craft / Colorways / Farm, CTA right.
Pinned beats 1–4 stay a fixed-stage scroll story; sections 5–11 are a normal-flow `<Flow/>` with opaque backgrounds that cover the stage (hard cut, like Alethia), with fade-up + blur reveals.

## Draft copy (all new; flagged for owner review — no prices, certifications, stats or shipping/care policy invented)
- Hero: "Harvest, held in glass." / "Real heirloom corn, made by hand on our farm in Yancheng, Jiangsu — sealed in resin and finished in gold." / chips "HAND-MADE · YANCHENG, JIANGSU", "REAL CORN · RESIN-SEALED"
- Craft: eyebrow "OUR CRAFT" / "From our farm to your hands." / "Every cob is chosen, dried and finished by hand in one place — our farm in Yancheng, Jiangsu, China."
- Unique: "Every kernel unique." / "No two kernels match, so no two ornaments do either. Yours is the only one."
- Colorways: "Pick your harvest." (Heirloom Rainbow, Ember, Blush, Twilight, Pearl, Noir)
- How it's made: "Six hands, one cob." no → "Slow work, done by hand." steps: 01 Chosen — each cob is picked for its colors; 02 Dried — left to dry until the kernels harden; 03 Sorted — kernels matched by color and size; 04 Sealed — coated in clear resin for the glass-gem shine; 05 Finished — a gold or silver cap, jump ring and clasp, plus a beaded strap.
- Collections: "Two ways to carry the harvest." Corn Charms ("The full cob, with cap and clasp.") / Corn Pearls ("Kernels set into a round bead.")
- Farm: eyebrow "OUR FARM" / "Made in Yancheng, Jiangsu." / "Our ornaments are made at the farm where the corn is dried and finished. Small batches, made by hand, shipped from China." (shipping wording to confirm)
- Promises: 01 Handmade — "Every piece is finished by hand."; 02 One of a kind — "No two cobs are the same."; 03 Real corn — "Actual kernels, sealed for keeps."; 04 Made to carry — "Clasp it to a bag, keys or a strap."
- Pairings: carousel items from owner bracelet photos: "Pearl & gold", "Aquamarine & crystal", "Rose quartz & tassel" etc. with mono role "CORN CHARM + BEADED STRAP".
- Questions: "Is it real corn?" yes, real dried heirloom corn, sealed in resin. / "Are they all different?" yes… / "Where is it made?" on our farm in Yancheng, Jiangsu, China.
- Final CTA: "Turn a harvest into a keepsake." / button "SHOP THE COLLECTION" (anchor to #collections; no shop yet).

## Implementation
Lead (before spawning, so teammates share one source): `src/copy.js` (all copy above), `src/scroll/useReveal.js` (fade-up/blur ScrollTrigger batch, reused by every flow section), extend `scripts/prepare-photos.sh` with cap-detail, sphere, bracelet and farm-section photos from the owner's iPhone shots (not the web-stock P0272–P0333, flagged earlier; ask the owner to confirm rights for the supplier-style black-velvet shots P0076/P0189 already in use), tokens in `src/styles.css`.

Teammates (3, one owner per file, **teammate panel opened immediately after spawn** per saved memory):
1. **pinned-builder** — `Nav.jsx`, `Sections.jsx`, `Stage.jsx`, `App.jsx`, `useScrollTimeline.js`, `beats.js`, `Flow.jsx` (composes 5–11), `styles.css`; new copy + CTA for beats 1–4, dark intro/loader.
2. **flow-a-builder** — `Process.jsx` (sticky photo + accordion), `Collections.jsx`, `Farm.jsx`, `flow-a.css`.
3. **flow-b-builder** — `Values.jsx`, `Pairings.jsx`, `Questions.jsx`, `Footer.jsx` (CTA + giant wordmark), `flow-b.css`.
Then **verify-app** (browser) and **code-review**. Reuse: `COLORWAYS` (`src/colorways.js`), `BEATS` (`src/scroll/beats.js`), existing `.chip`, `.swatch` styles. Reduced-motion: `static` layout keeps working (flow sections simply render unanimated). Mobile at 390px checked.

## Carry-over fixes from the desktop verification of the current photo hero (mobile + reduced-motion passes still unrun)
Resin-beat subline/pills low contrast over busy kernels (add a soft scrim); zoom looks soft at 2.6× (cap scale ~2.2 or use a sharper crop); dead no-text stretches at ~1.5vh and ~3.8vh (shorten the blur dissolve); overlapping collage tiles; colorway check advances before the crossfade resolves (switch at the midpoint); duplicate caption chip under the swatches; set `history.scrollRestoration = 'manual'`. All owned by pinned-builder.

## Verification
`npm run build` warning-free; dev server http://localhost:5173 (already running); verify-app: scroll all 11 sections at 1512×827 and 390×844, swatch clicks, accordion + carousel interaction, console clean, reduced-motion emulation. No commit (never without asking).

## Round 2 — closer to Alethia's layout (user: "the UI layout is not the same as the example site")
Gap analysis (our screenshots vs `docs/analysis/alethia.md`): ours is a light, photo-filled page; Alethia is a **dark cinematic stage with isolated objects floating in a void**, big negative space, a mono HUD over the object, and alternating dark/light sections where every section is one idea.

Assets (no new dependencies):
- **Cutouts**: transparent PNGs of the owner's cobs/spheres made with macOS Vision foreground masking (`scripts/cutout.swift`, run by `scripts/prepare-photos.sh`) → `public/cutouts/*.png`. Replaces the gray-backdrop photos on dark stages.
- **Nature atmosphere** (free Unsplash License, downloaded via Chrome; sources listed in `docs/credits.md`): `nature-dew.jpg` (leaf macro), `nature-corn-leaf.jpg` (corn seedling), `nature-field.jpg` (aerial terraced field). Decorative only; never captioned as the owner's farm.

Layout changes:
1. **Hero**: dark aubergine void; large cob cutout floating, 2–3 satellite cutouts (sphere, small cobs) drifting at different depths; H1 left (bone), outlined CTA, sub-copy bottom-left, "Scroll to discover" bottom-right; mono HUD on the cob (1px scan rectangle + chip + ticker, copy in `copy.js`). Scroll = dolly into the kernels until they fill the screen (portal) → "From our farm to your hands." centered with eyebrow chip.
2. **Loops/leaf scene** (Alethia §3): fog crossfade to the dew-leaf macro, big paragraph, 4 rose circle hotspots with mono captions. Replaces the tiles beat.
3. **Colorways stage**: dark; cutout per colorway centered, swatches below; blur crossfade.
4. Flow sections follow Alethia rhythm: dark Process (center cutout + glass card + right accordion), light Collections (cards use nature photos + white text, rose arrow), dark Farm/tech statement, light collage ('alethia solves'), light 2×2, carousel, FAQ, final blurred CTA + giant wordmark.
