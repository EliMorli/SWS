import axios from 'axios'
import type { DashboardData, Project, ProjectDashboard, Invoice, ChangeOrder, LienRelease, InsurancePolicy } from '../types'

// Demo mode: when no API backend is available, login and data fetches work with mock data
const DEMO_MODE = !import.meta.env.VITE_API_URL || import.meta.env.VITE_DEMO === 'true'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sws_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_token')
      localStorage.removeItem('sws_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Demo user data
const DEMO_USER = {
  id: 'demo-001',
  email: 'aaron@swsstucco.com',
  first_name: 'Aaron',
  last_name: 'Secharia',
  role: 'owner',
}

// Auth
export const login = async (email: string, _password: string) => {
  if (DEMO_MODE) {
    const user = { ...DEMO_USER, email }
    localStorage.setItem('sws_token', 'demo-token')
    localStorage.setItem('sws_user', JSON.stringify(user))
    return { user, message: 'Logged in successfully.' }
  }

  const res = await axios.post('/auth/login', { user: { email, password: _password } })
  const token = res.headers.authorization?.replace('Bearer ', '')
  if (token) {
    localStorage.setItem('sws_token', token)
    localStorage.setItem('sws_user', JSON.stringify(res.data.user))
  }
  return res.data
}

export const logout = async () => {
  if (!DEMO_MODE) {
    try {
      await axios.delete('/auth/logout', {
        headers: { Authorization: `Bearer ${localStorage.getItem('sws_token')}` },
      })
    } catch { /* ignore */ }
  }
  localStorage.removeItem('sws_token')
  localStorage.removeItem('sws_user')
}

// All fetch functions return null in demo mode so pages fall back to their mock data
export const fetchDashboard = async (): Promise<DashboardData> => {
  if (DEMO_MODE) return null as unknown as DashboardData
  const { data } = await api.get('/dashboard')
  return data
}

export const fetchProjects = async (): Promise<Project[]> => {
  if (DEMO_MODE) return null as unknown as Project[]
  const { data } = await api.get('/projects')
  return data
}

export const fetchProject = async (id: string): Promise<Project> => {
  if (DEMO_MODE) return null as unknown as Project
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export const fetchProjectDashboard = async (id: string): Promise<ProjectDashboard> => {
  if (DEMO_MODE) return null as unknown as ProjectDashboard
  const { data } = await api.get(`/projects/${id}/dashboard`)
  return data
}

export const fetchInvoices = async (projectId: string): Promise<Invoice[]> => {
  if (DEMO_MODE) return null as unknown as Invoice[]
  const { data } = await api.get(`/projects/${projectId}/invoices`)
  return data
}

export const fetchChangeOrders = async (projectId: string): Promise<ChangeOrder[]> => {
  if (DEMO_MODE) return null as unknown as ChangeOrder[]
  const { data } = await api.get(`/projects/${projectId}/change_orders`)
  return data
}

export const fetchLienReleases = async (projectId: string): Promise<LienRelease[]> => {
  if (DEMO_MODE) return null as unknown as LienRelease[]
  const { data } = await api.get(`/projects/${projectId}/lien_releases`)
  return data
}

export const fetchInsurancePolicies = async (): Promise<InsurancePolicy[]> => {
  if (DEMO_MODE) return null as unknown as InsurancePolicy[]
  const { data } = await api.get('/insurance')
  return data
}

export default api
