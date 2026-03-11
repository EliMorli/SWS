import axios from 'axios'
import type { DashboardData, Project, ProjectDashboard, Invoice, ChangeOrder, LienRelease, InsurancePolicy } from '../types'
import * as demo from './demoData'

// Demo mode: when no API backend is available, use localStorage-backed data
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

// ─── Fetch functions ─────────────────────────────────────────────────────────

export const fetchDashboard = async (): Promise<DashboardData> => {
  if (DEMO_MODE) return demo.getDashboardData()
  const { data } = await api.get('/dashboard')
  return data
}

export const fetchProjects = async (): Promise<Project[]> => {
  if (DEMO_MODE) return demo.getProjects()
  const { data } = await api.get('/projects')
  return data
}

export const fetchProject = async (id: string): Promise<Project> => {
  if (DEMO_MODE) return demo.getProject(id)!
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export const fetchProjectDashboard = async (id: string): Promise<ProjectDashboard> => {
  if (DEMO_MODE) return demo.getProjectDashboard(id) as ProjectDashboard
  const { data } = await api.get(`/projects/${id}/dashboard`)
  return data
}

export const fetchInvoices = async (projectId: string): Promise<Invoice[]> => {
  if (DEMO_MODE) return demo.getInvoices(projectId)
  const { data } = await api.get(`/projects/${projectId}/invoices`)
  return data
}

export const fetchChangeOrders = async (projectId: string): Promise<ChangeOrder[]> => {
  if (DEMO_MODE) return demo.getChangeOrders(projectId)
  const { data } = await api.get(`/projects/${projectId}/change_orders`)
  return data
}

export const fetchLienReleases = async (projectId: string): Promise<LienRelease[]> => {
  if (DEMO_MODE) return demo.getLienReleases(projectId)
  const { data } = await api.get(`/projects/${projectId}/lien_releases`)
  return data
}

export const fetchInsurancePolicies = async (): Promise<InsurancePolicy[]> => {
  if (DEMO_MODE) return demo.getInsurancePolicies()
  const { data } = await api.get('/insurance')
  return data
}

// ─── Mutation functions ──────────────────────────────────────────────────────

export const apiCreateProject = async (input: {
  name: string; project_number: string; address: string
  gc_name: string; original_contract: number; retention_pct: number
}): Promise<Project> => {
  if (DEMO_MODE) return demo.createProject(input)
  const { data } = await api.post('/projects', input)
  return data
}

export const apiCreateInvoice = async (projectId: string, input: {
  completed_this_period: number; invoice_date: string
}): Promise<Invoice> => {
  if (DEMO_MODE) return demo.createInvoice(projectId, input)
  const { data } = await api.post(`/projects/${projectId}/invoices`, input)
  return data
}

export const apiSubmitInvoice = async (invoiceId: string): Promise<Invoice> => {
  if (DEMO_MODE) return demo.submitInvoice(invoiceId)
  const { data } = await api.post(`/invoices/${invoiceId}/submit`)
  return data
}

export const apiRecordPayment = async (invoiceId: string, input: {
  amount: number; check_number: string
}): Promise<Invoice> => {
  if (DEMO_MODE) return demo.recordPayment(invoiceId, input)
  const { data } = await api.post(`/invoices/${invoiceId}/record_payment`, input)
  return data
}

export const apiCreateChangeOrder = async (projectId: string, input: {
  title: string; amount: number; description?: string
}): Promise<ChangeOrder> => {
  if (DEMO_MODE) return demo.createChangeOrder(projectId, input)
  const { data } = await api.post(`/projects/${projectId}/change_orders`, input)
  return data
}

export const apiSubmitChangeOrder = async (coId: string): Promise<ChangeOrder> => {
  if (DEMO_MODE) return demo.submitChangeOrder(coId)
  const { data } = await api.post(`/change_orders/${coId}/submit`)
  return data
}

export const apiApproveChangeOrder = async (coId: string): Promise<ChangeOrder> => {
  if (DEMO_MODE) return demo.approveChangeOrder(coId)
  const { data } = await api.post(`/change_orders/${coId}/approve`)
  return data
}

export const apiCreateLienRelease = async (projectId: string, input: {
  release_type: string; direction: string; amount: number
  invoice_number?: string; company_name?: string; through_date: string
}): Promise<LienRelease> => {
  if (DEMO_MODE) return demo.createLienRelease(projectId, input)
  const { data } = await api.post(`/projects/${projectId}/lien_releases`, input)
  return data
}

export const apiCreateInsurancePolicy = async (input: {
  policy_type: string; policy_number: string; carrier: string
  effective_date: string; expiry_date: string; coverage_amount: number
}): Promise<InsurancePolicy> => {
  if (DEMO_MODE) return demo.createInsurancePolicy(input)
  const { data } = await api.post('/insurance', input)
  return data
}

export const apiResetDemoData = () => {
  demo.resetDemoData()
}

export default api
