import { useState } from 'react'
import { post } from '../auth/api.js'
import { Field, Heading, PanelForm } from '../panel/ui.jsx'

const EMPTY = { currentPassword: '', newPassword: '' }

export default function Password() {
  const [form, setForm] = useState(EMPTY)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  return (
    <>
      <Heading>Change password</Heading>
      <PanelForm
        submit="Update password"
        onSubmit={async () => {
          const result = await post('/change-password', form)
          setForm(EMPTY)
          return result
        }}
      >
        <Field label="Current password" type="password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" required />
        <Field label="New password" type="password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" minLength={8} maxLength={128} required />
      </PanelForm>
    </>
  )
}
