export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

export interface Project {
  id: string
  name: string
  project_number: string
  address: string
  gc_name: string | null
  owner_name?: string | null
  architect_name?: string | null
  status: string
  trade?: string
  description?: string
  original_contract: number
  revised_contract: number
  total_billed: number
  total_paid: number
  outstanding: number
  retention_pct: number
  total_wall_sqyds?: number
  total_ceiling_sqyds?: number
  total_area_sqyds?: number
  start_date?: string
  created_at?: string
}

export interface ProjectPhase {
  id: string
  name: string
  billing_pct: number
  completion_pct: number
  status: string
}

export interface Invoice {
  id: string
  project_id: string
  invoice_number: string
  pay_app_number: number
  period_from: string
  period_to: string
  invoice_date: string
  original_contract: number
  change_order_total: number
  contract_total: number
  completed_previous: number
  completed_this_period: number
  materials_stored: number
  total_completed: number
  retention_held: number
  total_earned_less_retention: number
  less_previous_certificates: number
  current_payment_due: number
  amount_paid: number
  paid_date: string | null
  check_number: string | null
  status: string
  days_outstanding: number
  overdue: boolean
  submitted_at: string | null
  notes: string | null
}

export interface ChangeOrder {
  id: string
  project_id: string
  co_number: number
  title: string
  description: string | null
  scope_of_work: string | null
  amount: number
  amount_cents: number
  status: string
  submitted_date: string | null
  approved_date: string | null
  approved_by: string | null
  notes: string | null
  created_at: string
}

export interface LienRelease {
  id: string
  project_id: string
  invoice_number: string | null
  company_name: string | null
  release_type: string
  direction: string
  amount: number
  through_date: string | null
  status: string
  signed_date: string | null
  notes: string | null
  created_at: string
}

export interface InsurancePolicy {
  id: string
  company_name: string
  policy_type: string
  policy_number: string
  carrier: string
  effective_date: string
  expiry_date: string
  coverage_amount: number
  status: string
  days_until_expiry: number
  expiring_soon: boolean
}

export interface DashboardData {
  summary: {
    total_projects: number
    active_projects: number
    total_contract_value: number
    total_billed: number
    total_paid: number
    total_outstanding: number
  }
  recent_invoices: Array<{
    id: string
    invoice_number: string
    project_name: string
    current_payment_due: number
    status: string
    days_outstanding: number
    invoice_date: string
  }>
  pending_change_orders: Array<{
    id: string
    co_number: number
    title: string
    project_name: string
    amount: number
    status: string
  }>
  expiring_insurance: InsurancePolicy[]
  overdue_invoices: Array<{
    id: string
    invoice_number: string
    project_name: string
    current_payment_due: number
    status: string
    days_outstanding: number
  }>
  recent_field_updates: Array<{
    id: string
    project_name: string
    sender_name: string
    message: string
    photo_thumbnail: string | null
    source: string
    created_at: string
  }>
}

export interface FieldUpdate {
  id: string
  project_id: string
  sender_name: string
  sender_role: string
  message: string
  photo_url: string | null
  photo_thumbnail: string | null
  latitude: number | null
  longitude: number | null
  geocoded_address: string | null
  source: 'telegram' | 'whatsapp' | 'sms' | 'web'
  auto_matched: boolean
  created_at: string
}

// ─── Estimates & Proposals ──────────────────────────────────────────────────

export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined'

export type EstimateLineItemCategory =
  | 'material'
  | 'labor'
  | 'equipment'
  | 'scaffolding'
  | 'subcontractor'
  | 'permits'
  | 'overhead'
  | 'other'

export interface EstimateLineItem {
  id: string
  description: string
  category: EstimateLineItemCategory
  quantity: number
  unit: string
  unit_cost: number
  total: number
}

export interface Estimate {
  id: string
  project_id: string | null
  project_name?: string
  estimate_number: string
  title: string
  client_name: string
  client_address: string
  scope_of_work: string
  exclusions: string
  terms_and_conditions: string
  line_items: EstimateLineItem[]
  subtotal: number
  markup_pct: number
  markup_amount: number
  tax_pct: number
  tax_amount: number
  total: number
  status: EstimateStatus
  valid_days: number
  created_at: string
  sent_date: string | null
  accepted_date: string | null
  expiry_date: string | null
  notes: string | null
}

// ─── Dropbox Integration ────────────────────────────────────────────────────

export interface DropboxConnection {
  id: string
  access_token: string
  refresh_token: string
  account_id: string
  account_display_name: string
  connected_at: string
  expires_at: string
}

export interface DropboxFileEntry {
  id: string
  name: string
  path_lower: string
  path_display: string
  type: 'file' | 'folder'
  size?: number
  modified?: string
  icon?: string
  children?: DropboxFileEntry[]
}

export interface ProjectDropboxMapping {
  project_id: string
  dropbox_folder_path: string
  linked_at: string
}

export interface ProjectDashboard {
  project: Project
  phases: ProjectPhase[]
  billing_summary: {
    original_contract: number
    approved_cos: number
    revised_contract: number
    total_billed: number
    total_paid: number
    outstanding: number
    retention_held: number
  }
  recent_invoices: Array<{
    id: string
    invoice_number: string
    pay_app_number: number
    current_payment_due: number
    status: string
    invoice_date: string
  }>
  change_orders: Array<{
    id: string
    co_number: number
    title: string
    amount: number
    status: string
  }>
  cost_summary: {
    by_category: Record<string, number>
    total: number
    budget: number
    margin: number
  }
}
