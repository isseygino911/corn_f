import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api, ApiError } from '../api.js'
import { COLORWAYS } from '../colorways.js'
import { Button } from '@/ui/button'
import { Check, Field, Fieldset, FormRow, Heading, Loaded, PanelForm, SelectField, Textarea, fromCents, toCents, useLoad } from '../panel/ui.jsx'
import ImageUploader from './ImageUploader.jsx'

const initial = (p) => ({
  sku: p?.sku ?? '',
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  description: p?.description ?? '',
  collection: p?.collection ?? 'charms',
  colorway: p?.colorway ?? COLORWAYS[0].id,
  price: p ? fromCents(p.priceCents) : '',
  stock: String(p?.stock ?? 0),
  active: p?.active ?? false,
  accessoryIds: p?.accessoryIds ?? [],
  images: p?.images ?? [],
})

function Form({ product, accessories }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial(product))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleAccessory = (id) => (on) =>
    setForm((f) => ({ ...f, accessoryIds: on ? [...f.accessoryIds, id] : f.accessoryIds.filter((a) => a !== id) }))

  const save = async () => {
    const priceCents = toCents(form.price)
    if (Number.isNaN(priceCents)) throw new ApiError('Enter the price as dollars, like 10.00.')
    const body = {
      sku: form.sku.trim() || undefined,
      name: form.name,
      slug: form.slug.trim() || undefined,
      description: form.description,
      collection: form.collection,
      colorway: form.colorway,
      priceCents,
      stock: Number(form.stock),
      active: form.active,
      accessoryIds: form.accessoryIds,
    }
    const saved = (await (product ? api.patch(`/admin/products/${product.id}`, body) : api.post('/admin/products', body))).product
    if (form.images.length) await api.put(`/admin/products/${saved.id}/images`, form.images.map(({ key, isMain }) => ({ key, isMain })))
    navigate('/admin/products')
  }

  return (
    <PanelForm submit="Save product" onSubmit={save}>
      <Field label="SKU" value={form.sku} onChange={set('sku')} placeholder="Leave blank to auto-generate (CHM0001 / PRL0001)" maxLength={7} />
      <Field label="Name" value={form.name} onChange={set('name')} required />
      <Field label="URL slug" value={form.slug} onChange={set('slug')} placeholder="Auto-generated from the name" />
      <Textarea label="Description (optional)" value={form.description} onChange={set('description')} />
      <FormRow>
        <SelectField
          label="Collection"
          value={form.collection}
          onValueChange={(collection) => setForm((f) => ({ ...f, collection }))}
          options={[{ value: 'charms', label: 'Charms' }, { value: 'pearls', label: 'Pearls' }]}
        />
        <Field label="Colorway" value={form.colorway} onChange={set('colorway')} list="colorway-ids" pattern="[a-z0-9\-]{1,40}" title="Lowercase letters, digits and hyphens" required />
        <datalist id="colorway-ids">
          {COLORWAYS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </datalist>
      </FormRow>
      <FormRow>
        <Field label="Price (USD)" value={form.price} onChange={set('price')} inputMode="decimal" required />
        <Field label="Stock" type="number" min={0} value={form.stock} onChange={set('stock')} required />
      </FormRow>
      <Fieldset legend="Images (optional: 1 main + up to 4 more)">
        <ImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
      </Fieldset>
      <Fieldset legend="Accessories offered with this product">
        {accessories.length ? (
          accessories.map((a) => <Check key={a.publicId} label={a.name} checked={form.accessoryIds.includes(a.publicId)} onChange={toggleAccessory(a.publicId)} />)
        ) : (
          <p>No accessories yet.</p>
        )}
      </Fieldset>
      <Check label="Active (visible on the storefront)" checked={form.active} onChange={(active) => setForm((f) => ({ ...f, active }))} />
      <Button type="button" variant="outline" className="tw:self-start" onClick={() => navigate('/admin/products')}>Cancel</Button>
    </PanelForm>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const accessories = useLoad(() => api.get('/admin/accessories'))
  const product = useLoad(() => (id ? api.get(`/admin/products/${id}`) : Promise.resolve({ product: null })), [id])
  return (
    <>
      <Heading>{id ? 'Edit product' : 'New product'}</Heading>
      <Loaded load={accessories}>
        {({ accessories }) => (
          <Loaded load={product}>{({ product }) => <Form product={product} accessories={accessories} />}</Loaded>
        )}
      </Loaded>
    </>
  )
}
