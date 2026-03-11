import axios from 'axios'
import type { DashboardData, Project, ProjectDashboard, Invoice, ChangeOrder, LienRelease, InsurancePolicy } from '../types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sws_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 - redirect to login
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

// Auth
export const login = async (email: string, password: string) => {
  const res = await axios.post('/auth/login', { user: { email, password } })
  const token = res.headers.authorization?.replace('Bearer ', '')
  if (token) {
    localStorage.setItem('sws_token', token)
    localStorage.setItem('sws_user', JSON.stringify(res.data.user))
  }
  return res.data
}

export const logout = async () => {
  try {
    await axios.delete('/auth/logout', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sws_token')}` },
    })
  } finally {
    localStorage.removeItem('sws_token')
    localStorage.removeItem('sws_user')
  }
}

// Dashboard
export const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get('/dashboard')
  return data
}

// Projects
export const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await api.get('/projects')
  return data
}

export const fetchProject = async (id: string): Promise<Project> => {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export const fetchProjectDashboard = async (id: string): Promise<ProjectDashboard> => {
  const { data } = await api.get(`/projects/${id}/dashboard`)
  return data
}

// Invoices
export const fetchInvoices = async (projectId: string): Promise<Invoice[]> => {
  const { data } = await api.get(`/projects/${projectId}/invoices`)
  return data
}

// Change Orders
export const fetchChangeOrders = async (projectId: string): Promise<ChangeOrder[]> => {
  const { data } = await api.get(`/projects/${projectId}/change_orders`)
  return data
}

// Lien Releases
export const fetchLienReleases = async (projectId: string): Promise<LienRelease[]> => {
  const { data } = await api.get(`/projects/${projectId}/lien_releases`)
  return data
}

// Insurance
export const fetchInsurancePolicies = async (): Promise<InsurancePolicy[]> => {
  const { data } = await api.get('/insurance')
  return data
}

export default api
