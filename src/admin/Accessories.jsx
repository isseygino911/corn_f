import { useState } from 'react'
import { api, ApiError } from '../api.js'
import { Button } from '@/ui/button'
import { Check, Field, FormRow, Heading, PanelForm, Textarea, Thumb, fromCents, toCents } from '../panel/ui.jsx'
import Catalog, { Status, priceCell } from './Catalog.jsx'
import ImageUploader from './ImageUploader.jsx'

const COLUMNS = [
  { label: 'Image', cell: (a) => <Thumb url={a.imageUrl} /> },
  { label: 'SKU', cell: (a) => a.sku },
  { label: 'Name', cell: (a) => a.name },
  { label: 'Price', cell: priceCell },
  { label: 'Stock', cell: (a) => a.stock },
  { label: 'Status', cell: (a) => <Status row={a} /> },
]

const initial = (a) => ({
  sku: a?.sku ?? '',
  name: a?.name ?? '',
  description: a?.description ?? '',
  price: a ? fromCents(a.priceCents) : '',
  stock: String(a?.stock ?? 0),
  active: a?.active ?? false,
  images: a?.imageKey ? [{ key: a.imageKey, url: a.imageUrl, isMain: true }] : [],
})

function AccessoryForm({ accessory, onDone }) {
  const [form, setForm] = useState(initial(accessory))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  return (
    <>
      <Heading>{accessory ? `Edit ${accessory.name}` : 'New accessory'}</Heading>
      <PanelForm
        submit="Save accessory"
        onSubmit={async () => {
          const priceCents = toCents(form.price)
          if (Number.isNaN(priceCents)) throw new ApiError('Enter the price as dollars, like 2.00.')
          const body = {
            sku: form.sku.trim() || undefined,
            name: form.name,
            description: form.description || null,
            priceCents,
            stock: Number(form.stock),
            active: form.active,
            imageKey: form.images[0]?.key ?? null,
          }
          await (accessory ? api.patch(`/admin/accessories/${accessory.id}`, body) : api.post('/admin/accessories', body))
          onDone()
        }}
      >
        <Field label="SKU" value={form.sku} onChange={set('sku')} placeholder="Auto-generated (ACC0001)" maxLength={7} />
        <Field label="Name" value={form.name} onChange={set('name')} required />
        <Textarea label="Description (optional)" value={form.description} onChange={set('description')} />
        <FormRow>
          <Field label="Price (USD)" value={form.price} onChange={set('price')} inputMode="decimal" required />
          <Field label="Stock" type="number" min={0} value={form.stock} onChange={set('stock')} required />
        </FormRow>
        <ImageUploader kind="accessory" max={1} images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
        <Check label="Active (visible on the storefront)" checked={form.active} onChange={(active) => setForm((f) => ({ ...f, active }))} />
        <Button type="button" variant="outline" className="tw:self-start" onClick={onDone}>Cancel</Button>
      </PanelForm>
    </>
  )
}

export default function Accessories() {
  const [editing, setEditing] = useState(null) // null = list, {} = new, row = edit
  const [version, setVersion] = useState(0)
  const done = () => {
    setEditing(null)
    setVersion((v) => v + 1)
  }
  if (editing) return <AccessoryForm accessory={editing.id ? editing : null} onDone={done} />
  return (
    <Catalog
      title="Accessories"
      endpoint="/admin/accessories"
      listKey="accessories"
      columns={COLUMNS}
      reloadKey={version}
      action={<Button type="button" onClick={() => setEditing({})}>New accessory</Button>}
      edit={(a) => <Button type="button" variant="outline" size="sm" onClick={() => setEditing(a)}>Edit</Button>}
    />
  )
}
