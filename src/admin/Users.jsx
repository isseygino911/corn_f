import { useState } from 'react'
import { api } from '../api.js'
import { Heading, Loaded, useLoad } from '../panel/ui.jsx'

export default function Users() {
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const load = useLoad(() => api.get(`/admin/users?q=${encodeURIComponent(term)}&page=${page}`), [term, page])
  return (
    <>
      <Heading>Users</Heading>
      <form
        className="actions"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          setTerm(q.trim())
        }}
      >
        <label className="field">
          <span>Search name or email</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="pill pill-solid">Search</button>
      </form>
      <Loaded load={load}>
        {({ users, total, pageSize }) => (
          <>
            {!users.length && <p className="panel-empty">No users found.</p>}
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Verified</th><th>Sign-in</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td data-label="Name">{u.name}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Verified">{u.verified ? 'Yes' : 'No'}</td>
                      <td data-label="Sign-in">{u.signInMethod}</td>
                      <td data-label="Role">{u.admin ? <span className="tag on">Admin</span> : 'User'}</td>
                      <td data-label="Joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions">
              <button type="button" className="pill pill-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="tag">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
              <button type="button" className="pill pill-sm" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </>
        )}
      </Loaded>
    </>
  )
}
