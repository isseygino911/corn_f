import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from './AuthContext.jsx'
import { AuthPage, Field, Form, GoogleButton, Message, ResendVerification } from './ui.jsx'

const GOOGLE_ERRORS = {
  google: 'Google sign-in did not complete. Please try again.',
  google_unverified: 'Google has not verified that email address, so we could not sign you in with it.',
}

export default function Login() {
  const { login } = useAuth()
  const googleError = GOOGLE_ERRORS[useSearchParams()[0].get('error')]
  const [unverified, setUnverified] = useState(null)

  const submit = async (values) => {
    setUnverified(null)
    try {
      await login(values)
    } catch (e) {
      if (e.code === 'email_not_verified') setUnverified(values.email)
      throw e
    }
  }

  return (
    <AuthPage title="Sign in" lede="Welcome back to Glass Gem Farm.">
      {googleError && <Message error>{googleError}</Message>}
      <GoogleButton />
      <p className="auth-or">or</p>
      <Form submit="Sign in" onSubmit={submit}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      </Form>
      {unverified && <ResendVerification email={unverified} />}
      <p className="auth-links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Create an account</Link>
      </p>
    </AuthPage>
  )
}
