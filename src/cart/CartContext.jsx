import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const MAX_QUANTITY = 10
const STORAGE_KEY = 'ggf-cart'

// A line is a product plus an accessory set; the display fields are estimates (the server reprices).
// { key, slug, name, imageUrl, unitCents, accessories: [{ publicId, name, priceCents }], quantity, maxQuantity }
const lineKey = (slug, accessories) => [slug, ...accessories.map((a) => a.publicId).sort()].join('|')
export const lineCents = (line) => (line.unitCents + line.accessories.reduce((sum, a) => sum + a.priceCents, 0)) * line.quantity

const isCents = (n) => Number.isInteger(n) && n >= 0
const isLine = (l) =>
  l !== null &&
  typeof l === 'object' &&
  typeof l.key === 'string' &&
  typeof l.slug === 'string' &&
  typeof l.name === 'string' &&
  isCents(l.unitCents) &&
  Array.isArray(l.accessories) &&
  l.accessories.every((a) => a && typeof a.publicId === 'string' && typeof a.name === 'string' && isCents(a.priceCents)) &&
  Number.isInteger(l.maxQuantity) &&
  l.maxQuantity >= 1 &&
  l.maxQuantity <= MAX_QUANTITY &&
  Number.isInteger(l.quantity)

// Anything unexpected in storage (corrupt, hand-edited, older shape) discards the whole cart rather than crashing the app.
const load = () => {
  try {
    const lines = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(lines) || !lines.every(isLine)) return []
    return lines.map((l) => ({ ...l, quantity: Math.max(1, Math.min(l.quantity, l.maxQuantity)) }))
  } catch {
    return []
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage unavailable: the cart simply lasts for this page view.
    }
  }, [lines])

  const add = useCallback(({ slug, name, imageUrl, unitCents, accessories, quantity, maxQuantity }) => {
    const key = lineKey(slug, accessories)
    if (!Number.isInteger(maxQuantity) || maxQuantity < 1 || !Number.isInteger(quantity) || quantity < 1) return
    setLines((current) => {
      const cap = Math.min(maxQuantity, MAX_QUANTITY)
      const existing = current.find((l) => l.key === key)
      if (!existing) return [...current, { key, slug, name, imageUrl, unitCents, accessories, quantity: Math.min(quantity, cap), maxQuantity: cap }]
      return current.map((l) => (l === existing ? { ...l, unitCents, maxQuantity: cap, quantity: Math.min(l.quantity + quantity, cap) } : l))
    })
  }, [])

  const setQuantity = useCallback(
    (key, quantity) => setLines((current) => current.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxQuantity)) } : l))),
    [],
  )
  const remove = useCallback((key) => setLines((current) => current.filter((l) => l.key !== key)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotalCents: lines.reduce((sum, l) => sum + lineCents(l), 0),
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, open, add, setQuantity, remove, clear],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
