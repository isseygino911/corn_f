import { api, ApiError } from '../api.js'

export const IMAGE_TYPES = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 5 * 1024 * 1024

// `kind` ('product' | 'accessory') picks the key prefix. Direct-to-S3: ask the server for a presigned PUT, then send the file bytes straight to the bucket.
export async function uploadImage(file, kind) {
  if (!IMAGE_TYPES.split(',').includes(file.type)) throw new ApiError('Use a JPEG, PNG or WebP image.')
  if (file.size > MAX_BYTES) throw new ApiError('Images can be at most 5 MB.')
  const { uploadUrl, key, publicUrl } = await api.post('/admin/uploads', { contentType: file.type, size: file.size, kind })
  let res
  try {
    res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
  } catch {
    throw new ApiError('The upload could not reach storage. Please try again.')
  }
  if (!res.ok) throw new ApiError('The upload was rejected by storage. Please try again.')
  return { key, url: publicUrl }
}
