# UI polish — colour and variation for shop, checkout, order and panel pages

Landing page stays untouched (only `Nav.jsx` dark-section selector gains `.ui-band`). No new dependencies. Built in one session, no teammates.

## Decisions (grilling)
- Colour: dark aubergine hero bands + tinted cards (owner: panels get a dark sidebar too).
- Product list: band with title and cutout art; tinted cards; collection filter pills (backend already supports `?collection=charms|pearls`).
- Product detail: sticky photo on a tinted panel; "How it's made" strip; "You may also like" row; trust chips.
- Checkout: dark sticky summary card, numbered step cards. Order page and cart drawer get the same treatment.
- Panels (account and admin share `PanelShell`): dark sidebar, tinted content cards, greeting header, tinted admin stat cards.

## Shared pieces
- Tint tokens on `.ui` in `src/ui/ui.css`: `--tint-rose`, `--tint-sand`, `--tint-sage` (moss), `--tint-mist` (slate), `--surface-dark` (ink). Mixed from the existing tokens, no new hues.
- `src/ui/surface.jsx`: `Surface({tone})` tinted rounded card; `Band({eyebrow, title, intro, art})` full-bleed dark hero band (class `ui-band`).
- `ShopShell` takes `title`/`eyebrow`/`intro`/`art` and renders the band above the content container; `PageTitle` is removed.
- Nav dark-theme detection: add `.ui-band` to `DARK_SECTIONS` so the nav flips light over the band.

## Pages
1. Product list: band (art = a cutout photo), collection pills (All / Charms / Pearls) that refetch, tinted cards cycling tones, name and price footer row.
2. Product detail: two-column, left photo panel sticky on desktop; accessories/quantity/total in a tinted card; trust chips; "How it's made" strip (landing step copy); related products row (same API list, current excluded).
3. Checkout: band "Checkout"; numbered cards (1 Shipping address); summary dark and sticky with large total.
4. Order page: band with order number and status; timeline on a tinted card; items and totals cards.
5. Cart drawer: tinted lines, dark footer.
6. Panel: dark sidebar (pill inverts), greeting header on dashboard/account home, content in tinted cards (forms, tables wrapped), admin stat cards tinted per metric.

## Verify
`npm run build` clean; browser at 1512 and 390 px for every page above; landing identical; reduced motion respected.
