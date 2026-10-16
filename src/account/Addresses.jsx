import { useState } from 'react'
import { api } from '../api.js'
import { Field } from '../auth/ui.jsx'
import { ActionButton, Heading, Loaded, PanelForm, Select, useLoad } from '../panel/ui.jsx'

const MAX_ADDRESSES = 10
const EMPTY = { fullName: '', phone: '', line1: '', line2: '', countryCode: '', stateCode: '', city: '', postalCode: '' }

// Static for the session: the geo lists never change.
const geo = (path) => api.get(`/geo/${path}`)

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

  const pickCountry = (e) => setForm((f) => ({ ...f, countryCode: e.target.value, stateCode: '', city: '' }))
  const pickState = (e) => setForm((f) => ({ ...f, stateCode: e.target.value, city: '' }))

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
      <Select label="Country" value={form.countryCode} onChange={pickCountry} required>
        <option value="">Select a country</option>
        {countries.data?.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
      </Select>
      <Select label="State / province" value={form.stateCode} onChange={pickState} disabled={!form.countryCode} required>
        <option value="">Select a state</option>
        {states.data?.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
      </Select>
      {cityList.length ? (
        <Select label="City" value={form.city} onChange={set('city')} required>
          <option value="">Select a city</option>
          {cityList.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </Select>
      ) : (
        <Field label="City" value={form.city} onChange={set('city')} autoComplete="address-level2" disabled={!form.stateCode} required />
      )}
      <Field label="Postal code" value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" required />
      <button type="button" className="pill" onClick={onDone}>Cancel</button>
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
    <>
      <Loaded load={load}>
        {({ addresses }) => (
          <>
            <Heading
              action={addresses.length < MAX_ADDRESSES && <button type="button" className="pill pill-solid" onClick={() => setEditing({})}>Add address</button>}
            >
              Addresses
            </Heading>
            {!addresses.length && <p className="panel-empty">No saved addresses yet.</p>}
            <ul className="card-list">
              {addresses.map((a) => (
                <li key={a.id}>
                  <p>
                    <strong>{a.fullName}</strong> {a.isDefault && <span className="tag on">Default</span>}
                  </p>
                  <p>{[a.line1, a.line2, a.city, a.stateCode, a.postalCode, a.countryCode].filter(Boolean).join(', ')}</p>
                  <p>{a.phone}</p>
                  <div className="actions">
                    <button type="button" className="pill pill-sm" onClick={() => setEditing(a)}>Edit</button>
                    {!a.isDefault && <ActionButton className="pill pill-sm" action={act(() => api.post(`/account/addresses/${a.id}/default`))}>Make default</ActionButton>}
                    <ActionButton className="pill pill-sm pill-danger" action={act(() => api.del(`/account/addresses/${a.id}`))}>Delete</ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Loaded>
    </>
  )
}
