import { formatMoney } from '../panel/ui.jsx'

const Row = ({ label, cents, strong }) => (
  <div className={strong ? 'tw:flex tw:justify-between tw:border-t tw:border-current/20 tw:pt-3 tw:text-2xl tw:font-medium' : 'tw:flex tw:justify-between'}>
    <dt>{label}</dt>
    <dd className="tw:m-0">{formatMoney(cents)}</dd>
  </div>
)

// Subtotal, shipping, tax and total, all integer cents from the server. Shipping shows when enabled or charged.
export function Totals({ subtotalCents, shippingCents, taxCents, totalCents, showShipping = shippingCents > 0 }) {
  return (
    <dl className="tw:m-0 tw:flex tw:flex-col tw:gap-2">
      <Row label="Subtotal" cents={subtotalCents} />
      {showShipping && <Row label="Shipping" cents={shippingCents} />}
      <Row label="Tax" cents={taxCents} />
      <Row label="Total" cents={totalCents} strong />
    </dl>
  )
}
