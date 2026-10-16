// Section heights in viewport-heights. Single source for Sections.jsx spacers and timeline offsets.
export const BEATS = [
  { id: 'hero', h: 2.2 },
  { id: 'craft', h: 1.8 },
  { id: 'leaf', h: 2.4 },
  { id: 'colorways', h: 3.6 },
]

// Scroll offset (in vh from the top of #story) at which each beat begins.
export const BEAT_START = Object.fromEntries(
  BEATS.map((beat, i) => [beat.id, BEATS.slice(0, i).reduce((sum, b) => sum + b.h, 0)]),
)

// Total scrollable distance of #story: all beats minus the one viewport that is always on screen.
export const SCROLL_LENGTH = BEATS.reduce((sum, b) => sum + b.h, 0) - 1
