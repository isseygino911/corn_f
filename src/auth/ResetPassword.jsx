import { Link, useSearchParams } from 'react-router'
import { post } from './api.js'
import { AuthPage, Field, Form, Message } from './ui.jsx'

export default function ResetPassword() {
  const token = useSearchParams()[0].get('token')
  return (
    <AuthPage title="Choose a new password">
      {token ? (
        <Form submit="Update password" onSubmit={(values) => post('/reset-password', { token, ...values })}>
          <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
        </Form>
      ) : (
        <Message error>This reset link is incomplete. Request a new one.</Message>
      )}
      <p className="auth-links">
        <Link to="/login">Sign in</Link>
        <Link to="/forgot-password">Send a new link</Link>
      </p>
    </AuthPage>
  )
}
