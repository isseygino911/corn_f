import { useState } from 'react'
import { api } from '../api.js'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { DataTable, Empty, Heading, Loaded, Pager, formatDate, useLoad } from '../panel/ui.jsx'

const COLUMNS = [
  { label: 'Name', cell: (u) => u.name },
  { label: 'Email', cell: (u) => u.email },
  { label: 'Verified', cell: (u) => (u.verified ? 'Yes' : 'No') },
  { label: 'Sign-in', cell: (u) => u.signInMethod },
  { label: 'Role', cell: (u) => (u.admin ? <Badge variant="secondary">Admin</Badge> : 'User') },
  { label: 'Joined', cell: (u) => formatDate(u.createdAt) },
]

export default function Users() {
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const load = useLoad(() => api.get(`/admin/users?q=${encodeURIComponent(term)}&page=${page}`), [term, page])
  return (
    <>
      <Heading>Users</Heading>
      <form
        className="tw:flex tw:flex-wrap tw:items-end tw:gap-2"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          setTerm(q.trim())
        }}
      >
        <div className="tw:flex tw:min-w-0 tw:flex-1 tw:flex-col tw:gap-2 tw:sm:max-w-sm">
          <Label htmlFor="user-search">Search name or email</Label>
          <Input id="user-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button>Search</Button>
      </form>
      <Loaded load={load}>
        {({ users, total, pageSize }) => (
          <>
            {users.length ? <DataTable columns={COLUMNS} rows={users} /> : <Empty>No users found.</Empty>}
            <Pager page={page} total={total} pageSize={pageSize} onPage={setPage} />
          </>
        )}
      </Loaded>
    </>
  )
}
