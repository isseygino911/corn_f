import { api } from '../api.js'
import { Heading, Loaded, useLoad } from '../panel/ui.jsx'

export default function Dashboard() {
  const load = useLoad(() => api.get('/admin/dashboard'))
  return (
    <>
      <Heading>Dashboard</Heading>
      <Loaded load={load}>
        {(d) => (
          <div className="panel-grid">
            {[
              ['Users', d.users],
              ['Active products', d.products.active],
              ['Inactive products', d.products.inactive],
              ['Accessories', d.accessories],
              ['Sold out', d.soldOut],
            ].map(([label, n]) => (
              <div className="stat" key={label}>
                <b>{n}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </Loaded>
    </>
  )
}
