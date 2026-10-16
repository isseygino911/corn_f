import { useState } from 'react'
import { api } from '../api.js'
import { ActionButton, Check, Heading, Loaded, formatMoney, useLoad } from '../panel/ui.jsx'

export const Status = ({ row }) => (
  <>
    <span className={row.active ? 'tag on' : 'tag'}>{row.active ? 'Active' : 'Inactive'}</span>{' '}
    {row.stock === 0 && <span className="tag">Sold out</span>}
  </>
)

export const Thumb = ({ url }) => (url ? <img src={url} alt="" /> : null)

export const priceCell = (row) => formatMoney(row.priceCents)

// Shared list for products and accessories: archived toggle, archive/restore, edit hook.
// `endpoint` is e.g. '/admin/products'; `listKey` the response key; `action` the heading button; `edit` renders the row's edit control.
export default function Catalog({ title, endpoint, listKey, columns, action, edit, reloadKey }) {
  const [archived, setArchived] = useState(false)
  const load = useLoad(() => api.get(`${endpoint}${archived ? '?archived=true' : ''}`), [archived, reloadKey])
  const toggle = (row) => async () => {
    await api.post(`${endpoint}/${row.id}/${archived ? 'restore' : 'archive'}`)
    load.reload()
  }
  return (
    <>
      <Heading action={action}>{title}</Heading>
      <Check label="Show archived" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
      <Loaded load={load}>
        {(data) => {
          const rows = data[listKey]
          return rows.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {columns.map((c) => <th key={c.label}>{c.label}</th>)}
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {columns.map((c) => <td key={c.label} data-label={c.label}>{c.cell(row)}</td>)}
                      <td>
                        <div className="actions">
                          {edit(row)}
                          <ActionButton className="pill pill-sm" action={toggle(row)}>{archived ? 'Restore' : 'Archive'}</ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="panel-empty">{archived ? 'Nothing archived.' : 'Nothing here yet.'}</p>
          )
        }}
      </Loaded>
    </>
  )
}
