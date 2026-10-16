import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import Nav from '../sections/Nav.jsx'
import CartButton from '../cart/CartButton.jsx'
import SignOutButton from '../auth/SignOutButton.jsx'
import { useAction } from '../auth/useAction.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { panelGroups } from './links.js'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button, buttonVariants } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import { Switch } from '@/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Textarea as TextareaInput } from '@/ui/textarea'
import { Toaster } from '@/ui/sonner'
import '@/ui/ui.css'

export const formatMoney = (cents) => {
  if (!Number.isFinite(cents)) return '—'
  return `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`
}

const MAX_CENTS = 10_000_000 // $100,000.00

// Whole-dollar-and-cents text → integer cents, or NaN when it is not a price or is above the maximum.
export const toCents = (text) => {
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) return NaN
  const cents = Math.round(Number(text) * 100)
  return cents > MAX_CENTS ? NaN : cents
}
export const fromCents = (cents) => (cents / 100).toFixed(2)

// Router links styled as buttons; the landing page's global underline must not leak in.
export const linkButton = (options, className) => cn('tw:text-foreground', buttonVariants(options), 'tw:no-underline', className)

const navLink = () => linkButton({ variant: 'ghost' }, 'tw:relative tw:justify-start tw:h-10 tw:px-4 tw:max-[809px]:flex-none tw:hover:bg-transparent')

// The pill slides between links (shared layoutId); under reduced motion it simply appears.
function NavItem({ to, label, end }) {
  const reduced = useReducedMotion()
  return (
    <NavLink to={to} end={end} className={navLink}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="panel-nav-pill" transition={reduced ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }} className="tw:absolute tw:inset-0 tw:rounded-full tw:bg-primary" />}
          <span className={`tw:relative ${isActive ? 'tw:text-primary-foreground' : ''}`}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

// Sidebar + content pane, shared by the account and admin routes.
export function PanelShell() {
  const { user } = useAuth()
  const groups = panelGroups(user.isAdmin)
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  return (
    <>
      <Nav cart={<CartButton />} />
      <main className="ui tw:mx-auto tw:grid tw:min-h-svh tw:max-w-[1200px] tw:grid-cols-[240px_minmax(0,1fr)] tw:content-start tw:gap-10 tw:px-[var(--gutter)] tw:pt-28 tw:pb-16 tw:max-[809px]:grid-cols-1 tw:max-[809px]:gap-6 tw:max-[809px]:pt-[88px]">
        <aside className="tw:sticky tw:top-24 tw:flex tw:flex-col tw:items-start tw:gap-5 tw:self-start tw:max-[809px]:static">
          <h1 className="tw:text-[40px] tw:max-[809px]:text-[34px]">Account</h1>
          {groups.map(({ heading, links }) => (
            <nav key={heading ?? 'account'} aria-label={heading ?? 'Account'} className="tw:flex tw:flex-col tw:gap-1 tw:self-stretch tw:max-[809px]:flex-row tw:max-[809px]:flex-wrap">
              {heading && <span className="tw:px-4 tw:pt-2 tw:font-mono tw:text-xs tw:uppercase tw:text-muted-foreground tw:max-[809px]:w-full">{heading}</span>}
              {links.map(({ to, label, end }) => (
                <NavItem key={to} to={to} label={label} end={end} />
              ))}
            </nav>
          ))}
          <SignOutButton className={buttonVariants({ variant: 'outline' })} />
        </aside>
        {/* The landing page sets an unlayered `p` colour, so paragraphs here need `!` to use the ink colour. */}
        <motion.section
          key={pathname}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="tw:flex tw:min-w-0 tw:flex-col tw:gap-6 tw:[&_p]:text-foreground!"
        >
          <Outlet />
        </motion.section>
      </main>
      <Toaster />
    </>
  )
}

export const Heading = ({ children, action }) => (
  <header className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
    <h2 className="tw:text-[40px] tw:max-[809px]:text-[34px]">{children}</h2>
    {action}
  </header>
)

// Loads fn() on mount and whenever deps change; reload() refetches.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    fn().then(
      (data) => live && setState({ data, error: null }),
      (error) => live && setState({ data: null, error }),
    )
    return () => {
      live = false
    }
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, loading: !state.data && !state.error, reload }
}

// Renders the loading / error states, then children(data).
export function Loaded({ load, children }) {
  if (load.error) return <p role="alert" className="tw:text-destructive">{load.error.message}</p>
  if (load.loading) {
    return (
      <div className="tw:flex tw:flex-col tw:gap-3" aria-busy="true">
        <Skeleton className="tw:h-10 tw:w-full" />
        <Skeleton className="tw:h-10 tw:w-full" />
        <Skeleton className="tw:h-10 tw:w-2/3" />
      </div>
    )
  }
  return children(load.data)
}

export const Empty = ({ children }) => <p className="tw:py-6">{children}</p>

// Label above a control. `id` ties them together.
export const FieldShell = ({ label, id, className, children }) => (
  <div className={cn('tw:flex tw:flex-col tw:gap-2', className)}>
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
)

export function Field({ label, className, ...input }) {
  const id = input.id ?? `f-${label}`
  return (
    <FieldShell label={label} id={id} className={className}>
      <Input id={id} {...input} />
    </FieldShell>
  )
}

export function Textarea({ label, ...input }) {
  const id = `f-${label}`
  return (
    <FieldShell label={label} id={id}>
      <TextareaInput id={id} rows={4} {...input} />
    </FieldShell>
  )
}

// options: [{ value, label }]. Radix selects cannot hold '' as an item value, so an empty value shows the placeholder.
export function SelectField({ label, value, onValueChange, options, placeholder = 'Select…', className, ...root }) {
  const id = `f-${label}`
  return (
    <FieldShell label={label} id={id} className={className}>
      <Select value={value} onValueChange={onValueChange} {...root}>
        <SelectTrigger id={id} className="tw:w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

export function Check({ label, checked, onChange, id = `c-${label}` }) {
  return (
    <div className="tw:flex tw:items-center tw:gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor={id} className="tw:cursor-pointer tw:normal-case tw:text-base">{label}</Label>
    </div>
  )
}

export function SwitchField({ label, checked, onChange }) {
  const id = `s-${label}`
  return (
    <div className="tw:flex tw:items-center tw:gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="tw:cursor-pointer">{label}</Label>
    </div>
  )
}

export const Fieldset = ({ legend, children }) => (
  <fieldset className="tw:m-0 tw:flex tw:min-w-0 tw:flex-col tw:gap-3 tw:border-0 tw:p-0">
    <legend className="tw:pb-2 tw:font-mono tw:text-xs tw:uppercase">{legend}</legend>
    {children}
  </fieldset>
)

export const FormRow = ({ children }) => <div className="tw:grid tw:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] tw:gap-4">{children}</div>

// Runs an async action from a button; a failure shows as an error toast.
export function ActionButton({ action, children, variant = 'outline', size = 'sm' }) {
  const { run, pending } = useAction(async () => {
    try {
      await action()
    } catch (error) {
      toast.error(error.message)
    }
  })
  return <Button type="button" variant={variant} size={size} disabled={pending} onClick={run}>{children}</Button>
}

// Confirm step for destructive actions. `onConfirm` may throw; its message shows as a toast and the dialog stays open.
export function ConfirmDialog({ open, onOpenChange, title, description, confirm, onConfirm }) {
  const { run, pending } = useAction(async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message)
    }
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={run}>{pending ? 'One moment…' : confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// A button that asks first. `action` runs after the user confirms.
export function ConfirmButton({ label, title, description, confirm = label, action, size = 'sm' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="outline" size={size} className="tw:hover:bg-destructive tw:hover:text-white" onClick={() => setOpen(true)}>{label}</Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} title={title} description={description} confirm={confirm} onConfirm={action} />
    </>
  )
}

// Controlled-form shell: submit runs onSubmit(); a `{ message }` result and any error show as toasts.
export function PanelForm({ submit, onSubmit, children, wide }) {
  const { run, pending } = useAction(async () => {
    try {
      const result = await onSubmit()
      if (result?.message) toast.success(result.message)
    } catch (error) {
      toast.error(error.message)
    }
  })
  return (
    <form
      className={cn('tw:flex tw:w-full tw:flex-col tw:gap-4', wide ? 'tw:max-w-[720px]' : 'tw:max-w-[480px]')}
      onSubmit={(e) => {
        e.preventDefault()
        run()
      }}
    >
      {children}
      <Button type="submit" className="tw:h-11 tw:self-start tw:px-6" disabled={pending}>{pending ? 'One moment…' : submit}</Button>
    </form>
  )
}

export const Actions = ({ children }) => <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2">{children}</div>

export const Thumb = ({ url }) =>
  url ? <img src={url} alt="" className="tw:size-12 tw:rounded-lg tw:bg-muted tw:object-contain" /> : null

// Table that collapses to labelled cards on phones. columns: [{ label, cell(row), className? }]; `actions(row)` adds a trailing cell.
const MotionRow = motion.create(TableRow)

export function DataTable({ columns, rows, rowKey = (r) => r.id, actions }) {
  const reduced = useReducedMotion()
  return (
    <Table className="tw:max-[809px]:block">
      <TableHeader className="tw:max-[809px]:sr-only">
        <TableRow>
          {columns.map((c) => <TableHead key={c.label} className="tw:font-mono tw:text-xs tw:uppercase tw:font-normal">{c.label}</TableHead>)}
          {actions && <TableHead><span className="tw:sr-only">Actions</span></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody className="tw:max-[809px]:block">
        {rows.map((row, i) => (
          <MotionRow
            key={rowKey(row)}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut', delay: Math.min(i, 8) * 0.03 }}
            className="tw:max-[809px]:block tw:max-[809px]:py-3"
          >
            {columns.map((c) => (
              <TableCell
                key={c.label}
                data-label={c.label}
                className="tw:max-[809px]:flex tw:max-[809px]:items-center tw:max-[809px]:justify-between tw:max-[809px]:gap-4 tw:max-[809px]:px-0 tw:max-[809px]:py-1.5 tw:max-[809px]:text-right tw:max-[809px]:whitespace-normal tw:max-[809px]:[overflow-wrap:anywhere] tw:max-[809px]:before:shrink-0 tw:max-[809px]:before:text-left tw:max-[809px]:before:font-mono tw:max-[809px]:before:text-xs tw:max-[809px]:before:uppercase tw:max-[809px]:before:content-[attr(data-label)]"
              >
                {c.cell(row)}
              </TableCell>
            ))}
            {actions && <TableCell className="tw:max-[809px]:block tw:max-[809px]:px-0 tw:max-[809px]:pt-2">{actions(row)}</TableCell>}
          </MotionRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Previous / next with "Page n of m".
export function Pager({ page, total, pageSize, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const go = (p, disabled) => (e) => {
    e.preventDefault()
    if (!disabled) onPage(p)
  }
  const state = (disabled) => ({ href: '#', 'aria-disabled': disabled, className: disabled ? 'tw:pointer-events-none tw:opacity-50' : undefined })
  return (
    <Pagination className="tw:justify-start">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious {...state(page <= 1)} onClick={go(page - 1, page <= 1)} />
        </PaginationItem>
        <PaginationItem>
          <span className="tw:px-3 tw:font-mono tw:text-xs tw:uppercase">Page {page} of {pages}</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext {...state(page >= pages)} onClick={go(page + 1, page >= pages)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const ORDER_STATUS = {
  placed: { label: 'Placed', variant: 'secondary' },
  shipped: { label: 'Shipped', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export const OrderStatus = ({ status }) => {
  const { label, variant } = ORDER_STATUS[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS)

export const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
