import { useState } from 'react'
import { api } from '../api.js'
import { Badge } from '@/ui/badge'
import { ActionButton, Actions, Check, ConfirmButton, DataTable, Empty, Heading, Loaded, formatMoney, useLoad } from '../panel/ui.jsx'

export const Status = ({ row }) => (
  <span className="tw:flex tw:flex-wrap tw:justify-end tw:gap-1">
    <Badge variant={row.active ? 'secondary' : 'outline'}>{row.active ? 'Active' : 'Inactive'}</Badge>
    {row.stock === 0 && <Badge variant="outline">Sold out</Badge>}
  </span>
)

export const priceCell = (row) => formatMoney(row.priceCents)

// Shared list for products and accessories: archived toggle, archive (confirmed) / restore, edit hook.
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
      <Check label="Show archived" checked={archived} onChange={setArchived} />
      <Loaded load={load}>
        {(data) => {
          const rows = data[listKey]
          return rows.length ? (
            <DataTable
              columns={columns}
              rows={rows}
              actions={(row) => (
                <Actions>
                  {edit(row)}
                  {archived ? (
                    <ActionButton action={toggle(row)}>Restore</ActionButton>
                  ) : (
                    <ConfirmButton
                      label="Archive"
                      title={`Archive ${row.name}?`}
                      description="It disappears from the storefront. You can restore it from the archived list."
                      action={toggle(row)}
                    />
                  )}
                </Actions>
              )}
            />
          ) : (
            <Empty>{archived ? 'Nothing archived.' : 'Nothing here yet.'}</Empty>
          )
        }}
      </Loaded>
    </>
  )
}
