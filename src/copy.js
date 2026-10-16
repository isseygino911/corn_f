// All page copy in one place (draft, written for the owner to review). Photos live in public/photos.
// No prices, certifications, statistics or shipping/care policies are stated on purpose.
export const BRAND = 'Glass Gem Farm'
export const ORIGIN = 'Yancheng, Jiangsu, China'

export const NAV = {
  links: [
    { label: 'Collection', href: '#collections' },
    { label: 'Craft', href: '#process' },
    { label: 'Colorways', href: '#colorways' },
    { label: 'Farm', href: '#farm' },
  ],
  cta: { label: 'Shop the collection', href: '/products' },
  menu: 'Menu',
  close: 'Close',
}

export const HERO = {
  title: 'Harvest, held in glass.',
  cta: NAV.cta,
  hint: 'Scroll to discover',
}

export const CRAFT = {
  eyebrow: 'Our craft',
  title: 'From our farm to your hands.',
  body: `Every cob is chosen, dried and finished by hand in one place — our farm in ${ORIGIN}.`,
  chips: ['Real corn', 'Resin-sealed'],
}

// "Loops" scene over the leaf macro: large paragraph + four hotspots.
export const LEAF = {
  label: 'From the field to the resin',
  title: 'Every kernel unique.',
  body: 'Every cob starts as real heirloom corn. Dried, sorted and sealed by hand, no two kernels match — so no two ornaments do either.',
  hotspots: ['No two kernels alike', 'Dried, then sealed in resin', 'Finished in gold or silver', 'Made by hand in Yancheng'],
}

export const COLORWAYS_COPY = { eyebrow: 'Colorways', title: 'Pick your harvest.' }

export const PROCESS = {
  eyebrow: 'How it’s made',
  title: 'Slow work, done by hand.',
  steps: [
    { title: 'Chosen', body: 'Each cob is picked for its colors and the way its kernels sit.', photo: '/photos/hand.jpg' },
    { title: 'Dried', body: 'Left to dry until the kernels turn hard and glassy.', photo: '/photos/dried.jpg' },
    { title: 'Sorted', body: 'Kernels are matched by color and size so every row reads right.', photo: '/photos/sorted.jpg' },
    { title: 'Sealed', body: 'Coated in clear resin for the glass-gem shine.', cutout: '/cutouts/pastel.webp' },
    { title: 'Finished', body: 'A gold or silver cap, jump ring and clasp, plus a beaded strap.', cutout: '/cutouts/cream.webp' },
  ],
}

export const COLLECTIONS = {
  eyebrow: 'Our collection',
  title: 'Two ways to carry the harvest.',
  items: [
    { tag: 'Corn charm', title: 'The full cob, with cap and clasp.', photo: '/photos/heirloom.jpg', bg: '/photos/nature-corn-leaf.jpg', cutout: '/cutouts/heirloom.webp', href: '/products' },
    { tag: 'Corn pearl', title: 'Kernels set into a round bead.', photo: '/photos/pearls.jpg', bg: '/photos/nature-dew.jpg', cutout: '/cutouts/pearls.webp', href: '/products' },
  ],
}

export const FARM = {
  eyebrow: 'Our farm',
  title: 'Made in Yancheng, Jiangsu.',
  body: 'Our ornaments are made at the farm where the corn is dried and finished. Small batches, made by hand, sent from China.',
  backdrop: '/photos/nature-corn-leaf.jpg',
  collage: {
    eyebrow: 'Small batches',
    title: 'Made by hand, one cob at a time.',
    body: 'Each ornament is dried, sealed and finished in one place, then sent from China.',
    dew: '/photos/nature-dew.jpg',
    cutout: '/cutouts/pearl.webp',
    stat: { label: 'Made by hand', value: ORIGIN },
    note: { value: '1 of 1', label: 'Every cob' },
    kernels: { label: 'Real corn', value: 'Resin-sealed' },
    cap: { label: 'Finish', value: 'Gold or silver cap' },
  },
}

export const PROMISES = {
  eyebrow: 'Four promises',
  title: 'Made slowly, made to be carried.',
  items: [
    { title: 'Handmade', body: 'Every piece is finished by hand.' },
    { title: 'One of a kind', body: 'No two cobs are the same.' },
    { title: 'Real corn', body: 'Actual kernels, sealed for keeps.' },
    { title: 'Made to carry', body: 'Clasp it to a bag, keys or a strap.' },
  ],
}

export const PAIRINGS = {
  eyebrow: 'Pairings',
  title: 'A strap for every harvest.',
  role: 'Corn charm + beaded strap',
  items: [
    { title: 'Pearl & gold', body: 'Cream kernels with pearl beads and gold spacers.', photo: '/photos/pearl.jpg', cutout: '/cutouts/pearl.webp' },
    { title: 'Aquamarine & crystal', body: 'Rainbow kernels against pale blue beads and a gold clover.', photo: '/photos/heirloom.jpg', cutout: '/cutouts/heirloom.webp' },
    { title: 'Slate & sky', body: 'Dusty violet kernels with the same pale blue strap.', photo: '/photos/twilight.jpg', cutout: '/cutouts/twilight.webp' },
    { title: 'Rose & glass', body: 'Mauve kernels with a mix of faceted glass beads.', photo: '/photos/rosestrap.jpg' },
  ],
}

export const QUESTIONS = {
  eyebrow: 'Questions',
  title: 'Good to know.',
  items: [
    { q: 'Is it real corn?', a: 'Yes. Each ornament is made from real dried heirloom corn, sealed in clear resin.' },
    { q: 'Are they all different?', a: 'Yes. Every cob has its own mix of kernel colors, so no two ornaments match.' },
    { q: 'Where is it made?', a: `By hand, on our farm in ${ORIGIN}.` },
  ],
}

export const CTA = {
  title: 'Turn a harvest into a keepsake.',
  body: 'Find the cob that looks like yours.',
  button: NAV.cta,
}

export const FOOTER = {
  columns: [
    { label: 'Explore', links: NAV.links },
    { label: 'Collection', links: [{ label: 'Corn charms', href: '#collections' }, { label: 'Corn pearls', href: '#collections' }] },
    { label: 'Craft', links: [{ label: 'How it’s made', href: '#process' }, { label: 'Pairings', href: '#pairings' }] },
    { label: 'Farm', links: [{ label: 'Our farm', href: '#farm' }, { label: 'Questions', href: '#questions' }] },
  ],
  places: ['Yancheng, Jiangsu', 'China'],
  copyright: `© ${new Date().getFullYear()} ${BRAND}`,
  top: 'Back to top ↑',
}
