import { api } from '../api.js'

export { ApiError } from '../api.js'
export const get = (path) => api.get(`/auth${path}`)
export const post = (path, body) => api.post(`/auth${path}`, body)
