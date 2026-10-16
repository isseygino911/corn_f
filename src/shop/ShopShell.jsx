import { useEffect } from 'react'
import Nav from '../sections/Nav.jsx'
import CartButton from '../cart/CartButton.jsx'
import { Band } from '@/ui/surface'
import { Toaster } from '@/ui/sonner'
import { cn } from '@/lib/utils'
import '@/ui/ui.css'
import './shop.css'

// Page frame for shop, checkout and order screens: nav with the cart button, the dark title band, and the `ui` theme.
export default function ShopShell({ band, className, children }) {
  // Radix portals (drawer, select lists) render under <body>, outside the page's `.ui` element.
  useEffect(() => {
    document.body.classList.add('ui')
    return () => document.body.classList.remove('ui')
  }, [])
  return (
    <>
      <Nav cart={<CartButton />} />
      <Band {...band} />
      <main className={cn('ui tw:mx-auto tw:flex tw:min-h-[60svh] tw:w-full tw:max-w-[1200px] tw:flex-col tw:gap-6 tw:px-(--gutter) tw:py-10 tw:md:py-14', className)}>
        {children}
      </main>
      <Toaster />
    </>
  )
}
