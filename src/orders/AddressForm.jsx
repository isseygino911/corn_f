import { useState } from 'react'
import { api } from '../api.js'
import { Message } from '../auth/ui.jsx'
import { useAction } from '../auth/useAction.js'
import { useLoad } from '../panel/ui.jsx'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'

const EMPTY = { fullName: '', phone: '', line1: '', line2: '', countryCode: '', stateCode: '', city: '', postalCode: '' }
const geo = (path) => api.get(`/geo/${path}`)
const none = (key) => Promise.resolve({ [key]: [] })

const Field = ({ label, id, children }) => (
  <div className="tw:flex tw:flex-col tw:gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
)

function Dropdown({ id, value, onChange, items, placeholder, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="tw:w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="tw:max-h-72">
        {items.map(({ code, name }) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

// Creates a saved address (country → state → city from /api/geo) and hands it to onSaved.
export default function AddressForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const countries = useLoad(() => geo('countries'))
  const states = useLoad(() => (form.countryCode ? geo(`states?country=${form.countryCode}`) : none('states')), [form.countryCode])
  const cities = useLoad(
    () => (form.stateCode ? geo(`cities?country=${form.countryCode}&state=${form.stateCode}`) : none('cities')),
    [form.countryCode, form.stateCode],
  )
  const cityList = cities.data?.cities ?? []
  const save = useAction(async () => onSaved((await api.post('/account/addresses', form)).address))

  return (
    <form
      className="tw:flex tw:max-w-xl tw:flex-col tw:gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        save.run()
      }}
    >
      <Field label="Full name" id="addr-name"><Input id="addr-name" value={form.fullName} onChange={set('fullName')} autoComplete="name" required /></Field>
      <Field label="Phone" id="addr-phone"><Input id="addr-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required /></Field>
      <Field label="Address line 1" id="addr-line1"><Input id="addr-line1" value={form.line1} onChange={set('line1')} autoComplete="address-line1" required /></Field>
      <Field label="Address line 2 (optional)" id="addr-line2"><Input id="addr-line2" value={form.line2} onChange={set('line2')} autoComplete="address-line2" /></Field>
      <Field label="Country" id="addr-country">
        <Dropdown id="addr-country" value={form.countryCode} placeholder="Select a country" items={countries.data?.countries ?? []} onChange={(v) => setForm((f) => ({ ...f, countryCode: v, stateCode: '', city: '' }))} />
      </Field>
      <Field label="State / province" id="addr-state">
        <Dropdown id="addr-state" value={form.stateCode} placeholder="Select a state" items={states.data?.states ?? []} disabled={!form.countryCode} onChange={(v) => setForm((f) => ({ ...f, stateCode: v, city: '' }))} />
      </Field>
      <Field label="City" id="addr-city">
        {cityList.length ? (
          <Dropdown id="addr-city" value={form.city} placeholder="Select a city" items={cityList.map((c) => ({ code: c.name, name: c.name }))} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
        ) : (
          <Input id="addr-city" value={form.city} onChange={set('city')} autoComplete="address-level2" disabled={!form.stateCode} required />
        )}
      </Field>
      <Field label="Postal code" id="addr-postal"><Input id="addr-postal" value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" required /></Field>
      {save.error && <Message error>{save.error.message}</Message>}
      <div className="tw:flex tw:gap-3">
        <Button type="submit" size="lg" className="tw:h-11" disabled={save.pending || !form.countryCode || !form.stateCode || !form.city}>{save.pending ? 'One moment…' : 'Save address'}</Button>
        {onCancel && <Button type="button" variant="outline" size="lg" className="tw:h-11" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
