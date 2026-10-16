import { post } from '../auth/api.js'
import { Field, Form } from '../auth/ui.jsx'
import { Heading } from '../panel/ui.jsx'

export default function Password() {
  return (
    <>
      <Heading>Change password</Heading>
      <div className="panel-form">
        <Form submit="Update password" onSubmit={(values) => post('/change-password', values)}>
          <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
          <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
        </Form>
      </div>
    </>
  )
}
