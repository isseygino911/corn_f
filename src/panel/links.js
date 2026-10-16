// One sidebar for everyone: admins get their management sections above the personal ones.
const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/accessories', label: 'Accessories' },
  { to: '/admin/orders', label: 'All orders' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/settings', label: 'Settings' },
]

const ACCOUNT_LINKS = [
  { to: '/account', label: 'Profile', end: true },
  { to: '/account/password', label: 'Password' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/orders', label: 'My orders' },
]

// [{ heading?, links }]; the headings only appear when there is more than one group.
export const panelGroups = (isAdmin) =>
  isAdmin
    ? [{ heading: 'Admin', links: ADMIN_LINKS }, { heading: 'My account', links: ACCOUNT_LINKS }]
    : [{ links: ACCOUNT_LINKS }]
