const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000'

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  return fetch(url, {
    credentials: 'include',
    ...options,
  })
}

export default apiFetch


