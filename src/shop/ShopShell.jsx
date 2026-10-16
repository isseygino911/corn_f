import { useEffect } from 'react'
import Nav from '../sections/Nav.jsx'
import CartButton from '../cart/CartButton.jsx'
import { Toaster } from '@/ui/sonner'
import { cn } from '@/lib/utils'
import '@/ui/ui.css'
import './shop.css'

// Page frame for shop, checkout and order screens: nav with the cart button, and the `ui` theme.
export default function ShopShell({ className, children }) {
  // Radix portals (drawer, select lists) render under <body>, outside the page's `.ui` element.
  useEffect(() => {
    document.body.classList.add('ui')
    return () => document.body.classList.remove('ui')
  }, [])
  return (
    <>
      <Nav cart={<CartButton />} />
      <main className={cn('ui tw:mx-auto tw:flex tw:min-h-svh tw:w-full tw:max-w-[1200px] tw:flex-col tw:gap-6 tw:px-(--gutter) tw:pt-22 tw:pb-16 tw:md:pt-28', className)}>
        {children}
      </main>
      <Toaster />
    </>
  )
}

export const PageTitle = ({ children }) => (
  <h1 className="tw:text-[clamp(40px,6vw,72px)]">{children}</h1>
)
