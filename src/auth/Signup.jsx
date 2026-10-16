import { useState } from 'react'
import { Link } from 'react-router'
import { post } from './api.js'
import { AuthPage, Field, Form, GoogleButton, ResendVerification } from './ui.jsx'

export default function Signup() {
  const [sentTo, setSentTo] = useState(null)

  if (sentTo) {
    return (
      <AuthPage title="Check your email" lede={`We sent a verification link to ${sentTo}. It stays valid for 24 hours.`}>
        <ResendVerification email={sentTo} />
        <p className="auth-links">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthPage>
    )
  }

  return (
    <AuthPage title="Create an account" lede="Join Glass Gem Farm.">
      <GoogleButton />
      <p className="auth-or">or</p>
      <Form
        submit="Create account"
        onSubmit={async (values) => {
          await post('/signup', values)
          setSentTo(values.email)
        }}
      >
        <Field label="Name" name="name" autoComplete="name" maxLength={80} required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
      </Form>
      <p className="auth-links">
        <Link to="/login">Already have an account?</Link>
      </p>
    </AuthPage>
  )
}
