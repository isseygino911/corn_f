export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

async function request(method, path, body) {
  let res
  try {
    res = await fetch(`/api/auth${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the server. Please try again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong. Please try again.', data.code)
  return data
}

export const get = (path) => request('GET', path)
export const post = (path, body) => request('POST', path, body)
