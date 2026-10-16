import { post } from './api.js'
import { useAuth } from './AuthContext.jsx'
import SignOutButton from './SignOutButton.jsx'
import { AuthPage, Field, Form } from './ui.jsx'

export default function Account() {
  const { user } = useAuth()
  return (
    <AuthPage title={user.name} lede={user.email}>
      <h2 className="auth-sub">Change password</h2>
      <Form submit="Update password" onSubmit={(values) => post('/change-password', values)}>
        <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
        <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
      </Form>
      <SignOutButton className="pill pill-wide" />
    </AuthPage>
  )
}
