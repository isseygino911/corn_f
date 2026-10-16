export const formatAddress = (a) => [a.line1, a.line2, a.city, a.stateCode, a.postalCode, a.countryCode].filter(Boolean).join(', ')
