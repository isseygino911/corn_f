import { useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { Field } from '../auth/ui.jsx'
import { Heading, PanelForm } from '../panel/ui.jsx'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user.name)
  return (
    <>
      <Heading>Profile</Heading>
      <PanelForm
        submit="Save"
        onSubmit={async () => {
          setUser((await api.patch('/account/profile', { name })).user)
          return { message: 'Saved.' }
        }}
      >
        <Field label="Email" value={user.email} disabled readOnly />
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      </PanelForm>
    </>
  )
}
