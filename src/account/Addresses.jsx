import { useState } from 'react'
import { api } from '../api.js'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ActionButton, Actions, ConfirmButton, Empty, Field, Heading, Loaded, PanelForm, SelectField, useLoad } from '../panel/ui.jsx'

const MAX_ADDRESSES = 10
const EMPTY = { fullName: '', phone: '', line1: '', line2: '', countryCode: '', stateCode: '', city: '', postalCode: '' }

// Static for the session: the geo lists never change.
const geo = (path) => api.get(`/geo/${path}`)
const asOptions = (items = [], valueKey = 'code') => items.map((i) => ({ value: i[valueKey], label: i.name }))

function AddressForm({ address, onDone }) {
  const [form, setForm] = useState({ ...EMPTY, ...address })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const countries = useLoad(() => geo('countries'))
  const states = useLoad(() => (form.countryCode ? geo(`states?country=${form.countryCode}`) : Promise.resolve({ states: [] })), [form.countryCode])
  const cities = useLoad(
    () => (form.stateCode ? geo(`cities?country=${form.countryCode}&state=${form.stateCode}`) : Promise.resolve({ cities: [] })),
    [form.countryCode, form.stateCode],
  )
  const cityList = cities.data?.cities ?? []

  const pickCountry = (countryCode) => setForm((f) => ({ ...f, countryCode, stateCode: '', city: '' }))
  const pickState = (stateCode) => setForm((f) => ({ ...f, stateCode, city: '' }))

  return (
    <PanelForm
      submit="Save address"
      onSubmit={async () => {
        const { id, isDefault, ...body } = form
        await (address?.id ? api.patch(`/account/addresses/${address.id}`, body) : api.post('/account/addresses', body))
        onDone()
      }}
    >
      <Field label="Full name" value={form.fullName} onChange={set('fullName')} autoComplete="name" required />
      <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
      <Field label="Address line 1" value={form.line1} onChange={set('line1')} autoComplete="address-line1" required />
      <Field label="Address line 2 (optional)" value={form.line2 ?? ''} onChange={set('line2')} autoComplete="address-line2" />
      <SelectField label="Country" placeholder="Select a country" value={form.countryCode} onValueChange={pickCountry} options={asOptions(countries.data?.countries)} required />
      <SelectField label="State / province" placeholder="Select a state" value={form.stateCode} onValueChange={pickState} options={asOptions(states.data?.states)} disabled={!form.countryCode} required />
      {cityList.length ? (
        <SelectField label="City" placeholder="Select a city" value={form.city} onValueChange={(city) => setForm((f) => ({ ...f, city }))} options={asOptions(cityList, 'name')} required />
      ) : (
        <Field label="City" value={form.city} onChange={set('city')} autoComplete="address-level2" disabled={!form.stateCode} required />
      )}
      <Field label="Postal code" value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" required />
      <Button type="button" variant="outline" className="tw:self-start" onClick={onDone}>Cancel</Button>
    </PanelForm>
  )
}

export default function Addresses() {
  const load = useLoad(() => api.get('/account/addresses'))
  const [editing, setEditing] = useState(null) // null = list, {} = new, address = edit
  const done = () => {
    setEditing(null)
    load.reload()
  }
  const act = (fn) => async () => {
    await fn()
    load.reload()
  }

  if (editing) {
    return (
      <>
        <Heading>{editing.id ? 'Edit address' : 'New address'}</Heading>
        <AddressForm address={editing} onDone={done} />
      </>
    )
  }
  return (
    <Loaded load={load}>
      {({ addresses }) => (
        <>
          <Heading action={addresses.length < MAX_ADDRESSES && <Button type="button" onClick={() => setEditing({})}>Add address</Button>}>
            Addresses
          </Heading>
          {!addresses.length && <Empty>No saved addresses yet.</Empty>}
          <ul className="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-3 tw:p-0">
            {addresses.map((a) => (
              <li key={a.id} className="tw:flex tw:flex-col tw:gap-2 tw:rounded-3xl tw:bg-card tw:p-5">
                <p>
                  <strong>{a.fullName}</strong> {a.isDefault && <Badge variant="secondary">Default</Badge>}
                </p>
                <p>{[a.line1, a.line2, a.city, a.stateCode, a.postalCode, a.countryCode].filter(Boolean).join(', ')}</p>
                <p>{a.phone}</p>
                <Actions>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(a)}>Edit</Button>
                  {!a.isDefault && <ActionButton action={act(() => api.post(`/account/addresses/${a.id}/default`))}>Make default</ActionButton>}
                  <ConfirmButton
                    label="Delete"
                    title="Delete this address?"
                    description={`${a.line1}, ${a.city} will be removed from your saved addresses.`}
                    action={act(() => api.del(`/account/addresses/${a.id}`))}
                  />
                </Actions>
              </li>
            ))}
          </ul>
        </>
      )}
    </Loaded>
  )
}
