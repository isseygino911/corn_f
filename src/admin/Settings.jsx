import { useState } from 'react'
import { ApiError, api } from '../api.js'
import { toast } from 'sonner'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { ActionButton, Actions, ConfirmButton, DataTable, Empty, Field, Heading, Loaded, PanelForm, SelectField, SwitchField, formatMoney, fromCents, toCents, useLoad } from '../panel/ui.jsx'

const MAX_TAX_PERCENT = 50
const DEFAULT_ROW = 'default'

function TaxAndShipping({ settings, onSaved }) {
  const [tax, setTax] = useState(String(settings.taxRateBps / 100))
  const [shipping, setShipping] = useState(settings.shippingEnabled)
  return (
    <PanelForm
      submit="Save settings"
      onSubmit={async () => {
        const percent = Number(tax)
        if (!tax.trim() || !(percent >= 0 && percent <= MAX_TAX_PERCENT)) throw new ApiError(`Enter a tax rate between 0 and ${MAX_TAX_PERCENT} percent.`)
        await api.patch('/admin/settings', { taxRateBps: Math.round(percent * 100), shippingEnabled: shipping })
        onSaved()
        return { message: 'Settings saved.' }
      }}
    >
      <Field label="Tax rate (%)" value={tax} onChange={(e) => setTax(e.target.value)} inputMode="decimal" required />
      <SwitchField label="Charge for shipping" checked={shipping} onChange={setShipping} />
    </PanelForm>
  )
}

function PriceCell({ rate, onSaved }) {
  const [price, setPrice] = useState(fromCents(rate.priceCents))
  const cents = toCents(price)
  const changed = cents !== rate.priceCents
  return (
    <Actions>
      <span className="tw:text-muted-foreground">$</span>
      <Input
        aria-label={`Price for ${rate.countryCode ?? 'default'}`}
        className="tw:h-8 tw:w-24"
        value={price}
        inputMode="decimal"
        onChange={(e) => setPrice(e.target.value)}
      />
      {changed && (
        <ActionButton
          action={async () => {
            if (Number.isNaN(cents)) throw new ApiError('Enter the price as dollars, like 8.00.')
            await api.patch(`/admin/shipping-rates/${rate.id}`, { priceCents: cents })
            onSaved()
          }}
        >
          Save
        </ActionButton>
      )}
    </Actions>
  )
}

function AddRate({ rates, countries, onAdded }) {
  const [code, setCode] = useState('')
  const [price, setPrice] = useState('')
  const taken = new Set(rates.map((r) => r.countryCode ?? DEFAULT_ROW))
  const options = [{ value: DEFAULT_ROW, label: 'Default (any other country)' }, ...countries.map((c) => ({ value: c.code, label: c.name }))].filter((o) => !taken.has(o.value))
  return (
    <PanelForm
      wide
      submit="Add rate"
      onSubmit={async () => {
        const priceCents = toCents(price)
        if (Number.isNaN(priceCents)) throw new ApiError('Enter the price as dollars, like 8.00.')
        await api.post('/admin/shipping-rates', { countryCode: code === DEFAULT_ROW ? null : code, priceCents })
        setCode('')
        setPrice('')
        onAdded()
      }}
    >
      <SelectField label="Country" placeholder="Select a country" value={code} onValueChange={setCode} options={options} required />
      <Field label="Price (USD)" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" required />
    </PanelForm>
  )
}

function ShippingRates({ countries }) {
  const load = useLoad(() => api.get('/admin/shipping-rates'))
  const names = Object.fromEntries(countries.map((c) => [c.code, c.name]))
  const columns = [
    { label: 'Country', cell: (r) => (r.countryCode ? names[r.countryCode] ?? r.countryCode : 'Default (any other country)') },
    { label: 'Price', cell: (r) => <PriceCell key={r.priceCents} rate={r} onSaved={load.reload} /> },
    {
      label: 'Active',
      cell: (r) => (
        <Switch
          aria-label={`${r.countryCode ?? 'Default'} rate active`}
          checked={r.active}
          onCheckedChange={(active) => api.patch(`/admin/shipping-rates/${r.id}`, { active }).then(load.reload, (e) => toast.error(e.message))}
        />
      ),
    },
  ]
  return (
    <Loaded load={load}>
      {({ shippingRates }) => (
        <>
          {shippingRates.length ? (
            <DataTable
              columns={columns}
              rows={shippingRates}
              actions={(r) => (
                <ConfirmButton
                  label="Delete"
                  title="Delete this shipping rate?"
                  description={`Orders to ${r.countryCode ? names[r.countryCode] ?? r.countryCode : 'other countries'} will fall back to the default rate, or be refused if there is none.`}
                  action={async () => {
                    await api.del(`/admin/shipping-rates/${r.id}`)
                    load.reload()
                  }}
                />
              )}
            />
          ) : (
            <Empty>No shipping rates yet.</Empty>
          )}
          <AddRate rates={shippingRates} countries={countries} onAdded={load.reload} />
        </>
      )}
    </Loaded>
  )
}

export default function Settings() {
  const settings = useLoad(() => api.get('/admin/settings'))
  const countries = useLoad(() => api.get('/geo/countries'))
  return (
    <>
      <Heading>Settings</Heading>
      <Loaded load={settings}>{(data) => <TaxAndShipping settings={data.settings} onSaved={settings.reload} />}</Loaded>
      <Heading>Shipping rates</Heading>
      <Loaded load={countries}>{({ countries }) => <ShippingRates countries={countries} />}</Loaded>
    </>
  )
}
