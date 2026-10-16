// Colorways in scroll order. `photo` is a studio shot in public/photos (see scripts/prepare-photos.sh),
// `tint` is the stage colour behind it.
export const COLORWAYS = [
  {
    id: 'pastel',
    name: 'Pastel',
    line: 'Butter yellow, lilac and candy pink, on a milky bead strap with a pastel tassel.',
    dots: ['#F6C5D3', '#F3D36B', '#C9B6E4'],
    tint: '#F7EDF0',
  },
  {
    id: 'cream',
    name: 'Cream',
    line: 'Cream, lemon and soft lilac kernels, on a strap of ivory and yellow beads.',
    dots: ['#F7EBC9', '#F2C94C', '#D9B8DA'],
    tint: '#F8F1DD',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    line: 'Amber, plum and burgundy kernels, on a strap of crackled crystal beads.',
    dots: ['#E0A030', '#8E3B4E', '#5E3A6B'],
    tint: '#F1E2CC',
  },
].map((c) => ({ ...c, photo: `/photos/${c.id}.jpg` }))
