import { Link } from 'react-router'
import { post } from './api.js'
import { AuthPage, Field, Form } from './ui.jsx'

export default function ForgotPassword() {
  return (
    <AuthPage title="Reset your password" lede="Enter your email and we will send you a reset link.">
      <Form submit="Send reset link" onSubmit={(values) => post('/forgot-password', values)}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </Form>
      <p className="auth-links">
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthPage>
  )
}
