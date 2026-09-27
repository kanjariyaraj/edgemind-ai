import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const healthApi = {
  check: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
}

export const memoryApi = {
  create: (data: any) => api.post('/memory', data),
  get: (id: string) => api.get(`/memory/${id}`),
  delete: (id: string) => api.delete(`/memory/${id}`),
}

export const searchApi = {
  search: (data: any) => api.post('/search', data),
}

export const decisionsApi = {
  list: () => api.get('/decisions'),
  get: (id: string) => api.get(`/decisions/${id}`),
}

export const syncApi = {
  status: () => api.get('/sync/status'),
  queue: () => api.get('/sync/queue'),
  retry: (id: string) => api.post(`/sync/retry/${id}`),
}

export const conflictsApi = {
  list: () => api.get('/conflicts'),
  resolve: (id: string, resolution: string) => api.post(`/conflicts/${id}/resolve`, { resolution }),
}

export const dashboardApi = {
  metrics: () => api.get('/dashboard/metrics'),
}

export const systemApi = {
  getStatus: () => api.get('/system/status'),
}

export default {
  health: healthApi,
  memory: memoryApi,
  search: searchApi,
  decisions: decisionsApi,
  sync: syncApi,
  conflicts: conflictsApi,
  dashboard: dashboardApi,
  system: systemApi,
}