import type { Project, Invoice, ChangeOrder, LienRelease, InsurancePolicy } from '../types'

const STORAGE_KEY = 'sws_demo_data'

export interface DemoData {
  projects: Project[]
  invoices: Invoice[]
  changeOrders: ChangeOrder[]
  lienReleases: LienRelease[]
  insurancePolicies: InsurancePolicy[]
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

function seedProjects(): Project[] {
  return [
    {
      id: 'hartford-001',
      name: '495 Hartford Apartments',
      project_number: 'HTF-2022-001',
      address: '1441 W. 5th Street, Los Angeles, CA, 90017',
      gc_name: 'Fassberg Construction Company',
      owner_name: 'Intergulf Development',
      architect_name: 'IBI Group',
      status: 'active',
      trade: 'CSI 09-200 Lath & Plaster',
      original_contract: 865000.00,
      revised_contract: 1133005.20,
      total_billed: 1157965.20,
      total_paid: 966182.81,
      outstanding: 191782.39,
      retention_pct: 10.0,
      total_wall_sqyds: 13827.78,
      total_ceiling_sqyds: 1863.00,
      total_area_sqyds: 15690.78,
      start_date: '2022-03-15',
      created_at: '2022-03-01',
    },
  ]
}

function seedInvoices(): Invoice[] {
  const payAppData = [
    { inv: '7452', date: '2022-06-15', thisPeriod: 152250.00, total: 152250.00, paid: 137025.00, status: 'paid' },
    { inv: '7453', date: '2022-08-15', thisPeriod: 129750.00, total: 282000.00, paid: 116775.00, status: 'paid' },
    { inv: '7454', date: '2022-10-15', thisPeriod: 144000.00, total: 426000.00, paid: 129600.00, status: 'paid' },
    { inv: '7455', date: '2023-01-15', thisPeriod: 115000.00, total: 541000.00, paid: 103500.00, status: 'paid' },
    { inv: '7456', date: '2023-04-15', thisPeriod: 132000.00, total: 673000.00, paid: 118800.00, status: 'paid' },
    { inv: '7457', date: '2023-07-15', thisPeriod: 108000.00, total: 781000.00, paid: 97200.00, status: 'paid' },
    { inv: '7458', date: '2023-10-15', thisPeriod: 126000.00, total: 907000.00, paid: 113400.00, status: 'paid' },
    { inv: '7459', date: '2024-01-15', thisPeriod: 95000.00, total: 1002000.00, paid: 85500.00, status: 'paid' },
    { inv: '7460', date: '2024-05-15', thisPeriod: 126772.20, total: 1128772.20, paid: 114094.98, status: 'paid' },
    { inv: '7461', date: '2024-09-15', thisPeriod: 29193.00, total: 1157965.20, paid: 0, status: 'submitted' },
  ]

  return payAppData.map((d, i) => ({
    id: `inv-${i + 1}`,
    project_id: 'hartford-001',
    invoice_number: d.inv,
    pay_app_number: i + 1,
    period_from: d.date,
    period_to: d.date,
    invoice_date: d.date,
    original_contract: 865000.00,
    change_order_total: 268005.20,
    contract_total: 1133005.20,
    completed_previous: [0, 152250, 282000, 426000, 541000, 673000, 781000, 907000, 1002000, 1128772.20][i],
    completed_this_period: d.thisPeriod,
    materials_stored: 0,
    total_completed: d.total,
    retention_held: d.total * 0.10,
    total_earned_less_retention: d.total * 0.90,
    less_previous_certificates: 0,
    current_payment_due: d.thisPeriod * 0.90,
    amount_paid: d.paid,
    paid_date: d.status === 'paid' ? d.date : null,
    check_number: d.status === 'paid' ? `${10000 + i + 1}` : null,
    status: d.status,
    days_outstanding: d.status === 'submitted' ? Math.floor((Date.now() - new Date(d.date).getTime()) / 86400000) : 0,
    overdue: d.status === 'submitted',
    submitted_at: d.date,
    notes: null,
  }))
}

function seedChangeOrders(): ChangeOrder[] {
  const cos = [
    { title: 'Additional waterproofing at balconies', amount: 24500, sub: '2022-08-01', app: '2022-08-15' },
    { title: 'Extra lath at modified wall sections', amount: 18200, sub: '2022-09-08', app: '2022-09-22' },
    { title: 'Added ceiling scope - Building B corridors', amount: 42800, sub: '2022-10-27', app: '2022-11-10' },
    { title: 'Revised scratch coat specification', amount: 15600, sub: '2023-01-04', app: '2023-01-18' },
    { title: 'Extended scaffold rental - weather delays', amount: 31400, sub: '2023-02-19', app: '2023-03-05' },
    { title: 'Additional masking at storefront glazing', amount: 12300, sub: '2023-04-28', app: '2023-05-12' },
    { title: 'XJ-15 additive scope increase', amount: 19800, sub: '2023-07-06', app: '2023-07-20' },
    { title: 'Drip edge at revised parapet details', amount: 8900, sub: '2023-08-25', app: '2023-09-08' },
    { title: 'Color coat revision - Sherwin-Williams spec change', amount: 28500, sub: '2023-11-01', app: '2023-11-15' },
    { title: 'Additional brown coat at mechanical screen walls', amount: 22100, sub: '2024-01-18', app: '2024-02-01' },
    { title: 'Elastomeric crack system upgrade', amount: 26400, sub: '2024-04-04', app: '2024-04-18' },
    { title: 'Final scope additions - rooftop amenity walls', amount: 17505.20, sub: '2024-06-26', app: '2024-07-10' },
  ]

  return cos.map((co, i) => ({
    id: `co-${i + 1}`,
    project_id: 'hartford-001',
    co_number: i + 1,
    title: co.title,
    description: null,
    scope_of_work: null,
    amount: co.amount,
    amount_cents: Math.round(co.amount * 100),
    status: 'approved',
    submitted_date: co.sub,
    approved_date: co.app,
    approved_by: 'Fassberg Construction',
    notes: null,
    created_at: co.sub,
  }))
}

function seedLienReleases(): LienRelease[] {
  const releases: LienRelease[] = []
  const amounts = [137025, 116775, 129600, 103500, 118800, 97200, 113400, 85500, 114094.98]

  for (let i = 0; i < 9; i++) {
    const year = i < 4 ? '2022' : i < 8 ? '2023' : '2024'
    const month = String(((i * 2 + 5) % 12) + 1).padStart(2, '0')

    releases.push({
      id: `cond-${i + 1}`,
      project_id: 'hartford-001',
      invoice_number: `745${i + 2}`,
      company_name: 'Southwest Stucco, Inc.',
      release_type: 'conditional_waiver',
      direction: 'outgoing',
      amount: amounts[i],
      through_date: `${year}-${month}-28`,
      status: 'signed',
      signed_date: `${year}-${month}-15`,
      notes: null,
      created_at: `${year}-${month}-15`,
    })
    releases.push({
      id: `uncond-${i + 1}`,
      project_id: 'hartford-001',
      invoice_number: `745${i + 2}`,
      company_name: 'Southwest Stucco, Inc.',
      release_type: 'unconditional_waiver',
      direction: 'outgoing',
      amount: amounts[i],
      through_date: `${year}-${month}-20`,
      status: 'signed',
      signed_date: `${year}-${month}-23`,
      notes: null,
      created_at: `${year}-${month}-20`,
    })
  }

  const lwAmounts = [47959, 40871, 45360, 36225, 41580, 34020]
  for (let i = 0; i < 6; i++) {
    const year = i < 4 ? '2022' : '2023'
    const month = String(((i * 2 + 5) % 12) + 1).padStart(2, '0')
    releases.push({
      id: `lw-${i + 1}`,
      project_id: 'hartford-001',
      invoice_number: `745${i + 2}`,
      company_name: 'L&W Supply',
      release_type: 'conditional_waiver',
      direction: 'incoming',
      amount: lwAmounts[i],
      through_date: `${year}-${month}-28`,
      status: 'received',
      signed_date: null,
      notes: null,
      created_at: `${year}-${month}-15`,
    })
  }

  return releases
}

function seedInsurancePolicies(): InsurancePolicy[] {
  return [
    { id: 'ins-1', company_name: 'Southwest Stucco, Inc.', policy_type: 'general_liability', policy_number: 'GL-2025-SWS-001', carrier: 'State Farm', effective_date: '2025-07-01', expiry_date: '2026-07-01', coverage_amount: 2000000, status: 'active', days_until_expiry: 112, expiring_soon: false },
    { id: 'ins-2', company_name: 'Southwest Stucco, Inc.', policy_type: 'workers_comp', policy_number: 'WC-2025-SWS-001', carrier: 'State Compensation Insurance Fund', effective_date: '2025-07-01', expiry_date: '2026-07-01', coverage_amount: 1000000, status: 'active', days_until_expiry: 112, expiring_soon: false },
    { id: 'ins-3', company_name: 'Southwest Stucco, Inc.', policy_type: 'auto', policy_number: 'AU-2025-SWS-001', carrier: 'Progressive Commercial', effective_date: '2025-09-01', expiry_date: '2026-09-01', coverage_amount: 1000000, status: 'active', days_until_expiry: 174, expiring_soon: false },
    { id: 'ins-4', company_name: 'Southwest Stucco, Inc.', policy_type: 'ocip', policy_number: 'OCIP-HTF-2022', carrier: 'Hartford / Intergulf OCIP', effective_date: '2022-03-01', expiry_date: '2026-12-31', coverage_amount: 5000000, status: 'active', days_until_expiry: 295, expiring_soon: false },
  ]
}

// ─── Store Operations ────────────────────────────────────────────────────────

function loadData(): DemoData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as DemoData
    }
  } catch { /* corrupted data, re-seed */ }

  const data = {
    projects: seedProjects(),
    invoices: seedInvoices(),
    changeOrders: seedChangeOrders(),
    lienReleases: seedLienReleases(),
    insurancePolicies: seedInsurancePolicies(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

function saveData(data: DemoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

let _cache: DemoData | null = null

function getData(): DemoData {
  if (!_cache) _cache = loadData()
  return _cache
}

function update(updater: (data: DemoData) => void) {
  const data = getData()
  updater(data)
  saveData(data)
}

function genId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Public API ──────────────────────────────────────────────────────────────

// Projects
export function getProjects(): Project[] {
  return getData().projects
}

export function getProject(id: string): Project | undefined {
  return getData().projects.find(p => p.id === id)
}

export function createProject(input: {
  name: string
  project_number: string
  address: string
  gc_name: string
  original_contract: number
  retention_pct: number
}): Project {
  const project: Project = {
    id: genId(),
    ...input,
    owner_name: null,
    architect_name: null,
    status: 'active',
    revised_contract: input.original_contract,
    total_billed: 0,
    total_paid: 0,
    outstanding: 0,
    start_date: today(),
    created_at: today(),
  }
  update(d => d.projects.push(project))
  return project
}

// Invoices
export function getInvoices(projectId: string): Invoice[] {
  return getData().invoices.filter(i => i.project_id === projectId)
}

export function createInvoice(projectId: string, input: {
  completed_this_period: number
  invoice_date: string
}): Invoice {
  const projectInvoices = getInvoices(projectId)
  const project = getProject(projectId)
  if (!project) throw new Error('Project not found')

  const lastInv = projectInvoices[projectInvoices.length - 1]
  const prevTotal = lastInv ? lastInv.total_completed : 0
  const newTotal = prevTotal + input.completed_this_period

  const approvedCOs = getData().changeOrders
    .filter(co => co.project_id === projectId && co.status === 'approved')
    .reduce((sum, co) => sum + co.amount, 0)

  const nextNumber = projectInvoices.length > 0
    ? String(Math.max(...projectInvoices.map(i => parseInt(i.invoice_number))) + 1)
    : '7462'

  const invoice: Invoice = {
    id: genId(),
    project_id: projectId,
    invoice_number: nextNumber,
    pay_app_number: projectInvoices.length + 1,
    period_from: input.invoice_date,
    period_to: input.invoice_date,
    invoice_date: input.invoice_date,
    original_contract: project.original_contract,
    change_order_total: approvedCOs,
    contract_total: project.original_contract + approvedCOs,
    completed_previous: prevTotal,
    completed_this_period: input.completed_this_period,
    materials_stored: 0,
    total_completed: newTotal,
    retention_held: newTotal * (project.retention_pct / 100),
    total_earned_less_retention: newTotal * (1 - project.retention_pct / 100),
    less_previous_certificates: 0,
    current_payment_due: input.completed_this_period * (1 - project.retention_pct / 100),
    amount_paid: 0,
    paid_date: null,
    check_number: null,
    status: 'draft',
    days_outstanding: 0,
    overdue: false,
    submitted_at: null,
    notes: null,
  }

  update(d => {
    d.invoices.push(invoice)
    // Update project totals
    const proj = d.projects.find(p => p.id === projectId)!
    proj.total_billed = newTotal
    proj.outstanding = newTotal - proj.total_paid
  })

  return invoice
}

export function submitInvoice(invoiceId: string): Invoice {
  const data = getData()
  const inv = data.invoices.find(i => i.id === invoiceId)
  if (!inv) throw new Error('Invoice not found')
  inv.status = 'submitted'
  inv.submitted_at = today()
  saveData(data)
  return inv
}

export function recordPayment(invoiceId: string, input: {
  amount: number
  check_number: string
}): Invoice {
  const data = getData()
  const inv = data.invoices.find(i => i.id === invoiceId)
  if (!inv) throw new Error('Invoice not found')

  inv.amount_paid = input.amount
  inv.paid_date = today()
  inv.check_number = input.check_number
  inv.status = 'paid'
  inv.days_outstanding = 0
  inv.overdue = false

  // Update project totals
  const proj = data.projects.find(p => p.id === inv.project_id)
  if (proj) {
    proj.total_paid = data.invoices
      .filter(i => i.project_id === proj.id)
      .reduce((sum, i) => sum + i.amount_paid, 0)
    proj.outstanding = proj.total_billed - proj.total_paid
  }

  saveData(data)
  return inv
}

// Change Orders
export function getChangeOrders(projectId: string): ChangeOrder[] {
  return getData().changeOrders.filter(co => co.project_id === projectId)
}

export function createChangeOrder(projectId: string, input: {
  title: string
  amount: number
  description?: string
}): ChangeOrder {
  const projectCOs = getChangeOrders(projectId)
  const co: ChangeOrder = {
    id: genId(),
    project_id: projectId,
    co_number: projectCOs.length + 1,
    title: input.title,
    description: input.description || null,
    scope_of_work: null,
    amount: input.amount,
    amount_cents: Math.round(input.amount * 100),
    status: 'draft',
    submitted_date: null,
    approved_date: null,
    approved_by: null,
    notes: null,
    created_at: today(),
  }
  update(d => d.changeOrders.push(co))
  return co
}

export function submitChangeOrder(coId: string): ChangeOrder {
  const data = getData()
  const co = data.changeOrders.find(c => c.id === coId)
  if (!co) throw new Error('CO not found')
  co.status = 'submitted'
  co.submitted_date = today()
  saveData(data)
  return co
}

export function approveChangeOrder(coId: string): ChangeOrder {
  const data = getData()
  const co = data.changeOrders.find(c => c.id === coId)
  if (!co) throw new Error('CO not found')
  co.status = 'approved'
  co.approved_date = today()
  co.approved_by = 'GC Approved'

  // Update project revised contract
  const proj = data.projects.find(p => p.id === co.project_id)
  if (proj) {
    const totalCOs = data.changeOrders
      .filter(c => c.project_id === proj.id && c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0)
    proj.revised_contract = proj.original_contract + totalCOs
  }

  saveData(data)
  return co
}

// Lien Releases
export function getLienReleases(projectId: string): LienRelease[] {
  return getData().lienReleases.filter(lr => lr.project_id === projectId)
}

export function createLienRelease(projectId: string, input: {
  release_type: string
  direction: string
  amount: number
  invoice_number?: string
  company_name?: string
  through_date: string
}): LienRelease {
  const lr: LienRelease = {
    id: genId(),
    project_id: projectId,
    invoice_number: input.invoice_number || null,
    company_name: input.company_name || 'Southwest Stucco, Inc.',
    release_type: input.release_type,
    direction: input.direction,
    amount: input.amount,
    through_date: input.through_date,
    status: 'pending',
    signed_date: null,
    notes: null,
    created_at: today(),
  }
  update(d => d.lienReleases.push(lr))
  return lr
}

// Insurance
export function getInsurancePolicies(): InsurancePolicy[] {
  const data = getData()
  // Recompute days_until_expiry
  const now = Date.now()
  return data.insurancePolicies.map(p => {
    const expiry = new Date(p.expiry_date).getTime()
    const daysLeft = Math.max(0, Math.ceil((expiry - now) / 86400000))
    return {
      ...p,
      days_until_expiry: daysLeft,
      expiring_soon: daysLeft > 0 && daysLeft <= 60,
      status: daysLeft <= 0 ? 'expired' : daysLeft <= 60 ? 'expiring_soon' : 'active',
    }
  })
}

export function createInsurancePolicy(input: {
  policy_type: string
  policy_number: string
  carrier: string
  effective_date: string
  expiry_date: string
  coverage_amount: number
}): InsurancePolicy {
  const expiry = new Date(input.expiry_date).getTime()
  const daysLeft = Math.max(0, Math.ceil((expiry - Date.now()) / 86400000))

  const policy: InsurancePolicy = {
    id: genId(),
    company_name: 'Southwest Stucco, Inc.',
    ...input,
    status: daysLeft <= 0 ? 'expired' : daysLeft <= 60 ? 'expiring_soon' : 'active',
    days_until_expiry: daysLeft,
    expiring_soon: daysLeft > 0 && daysLeft <= 60,
  }
  update(d => d.insurancePolicies.push(policy))
  return policy
}

// Dashboard computed data
export function getDashboardData() {
  const data = getData()
  const projects = data.projects
  const invoices = data.invoices
  const changeOrders = data.changeOrders

  const totalContractValue = projects.reduce((s, p) => s + p.revised_contract, 0)
  const totalBilled = projects.reduce((s, p) => s + p.total_billed, 0)
  const totalPaid = projects.reduce((s, p) => s + p.total_paid, 0)

  const recentInvoices = [...invoices]
    .sort((a, b) => b.invoice_date.localeCompare(a.invoice_date))
    .slice(0, 5)
    .map(inv => {
      const proj = projects.find(p => p.id === inv.project_id)
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        project_name: proj?.name || 'Unknown',
        current_payment_due: inv.current_payment_due,
        status: inv.status,
        days_outstanding: inv.status === 'submitted'
          ? Math.floor((Date.now() - new Date(inv.invoice_date).getTime()) / 86400000)
          : 0,
        invoice_date: inv.invoice_date,
      }
    })

  const overdueInvoices = invoices
    .filter(inv => inv.status === 'submitted' && (Date.now() - new Date(inv.invoice_date).getTime()) > 30 * 86400000)
    .map(inv => {
      const proj = projects.find(p => p.id === inv.project_id)
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        project_name: proj?.name || 'Unknown',
        current_payment_due: inv.current_payment_due,
        status: inv.status,
        days_outstanding: Math.floor((Date.now() - new Date(inv.invoice_date).getTime()) / 86400000),
      }
    })

  const pendingCOs = changeOrders
    .filter(co => co.status === 'submitted' || co.status === 'draft')
    .map(co => {
      const proj = projects.find(p => p.id === co.project_id)
      return {
        id: co.id,
        co_number: co.co_number,
        title: co.title,
        project_name: proj?.name || 'Unknown',
        amount: co.amount,
        status: co.status,
      }
    })

  const policies = getInsurancePolicies()
  const expiringInsurance = policies.filter(p => p.expiring_soon || p.status === 'expiring_soon')

  return {
    summary: {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      total_contract_value: totalContractValue,
      total_billed: totalBilled,
      total_paid: totalPaid,
      total_outstanding: totalBilled - totalPaid,
    },
    recent_invoices: recentInvoices,
    pending_change_orders: pendingCOs,
    expiring_insurance: expiringInsurance,
    overdue_invoices: overdueInvoices,
  }
}

// Project detail dashboard
export function getProjectDashboard(projectId: string) {
  const project = getProject(projectId)
  if (!project) return null

  const invoices = getInvoices(projectId)
  const changeOrders = getChangeOrders(projectId)
  const approvedCOs = changeOrders.filter(co => co.status === 'approved')
  const approvedTotal = approvedCOs.reduce((s, co) => s + co.amount, 0)
  const lastInv = invoices[invoices.length - 1]

  return {
    project,
    phases: [
      { id: '1', name: 'Scaffold', billing_pct: 0, completion_pct: 100, status: 'complete' },
      { id: '2', name: 'Lath', billing_pct: 35, completion_pct: 100, status: 'complete' },
      { id: '3', name: 'Scratch', billing_pct: 20, completion_pct: 100, status: 'complete' },
      { id: '4', name: 'Brown', billing_pct: 25, completion_pct: 85, status: 'in_progress' },
      { id: '5', name: 'Color', billing_pct: 20, completion_pct: 40, status: 'in_progress' },
    ],
    billing_summary: {
      original_contract: project.original_contract,
      approved_cos: approvedTotal,
      revised_contract: project.original_contract + approvedTotal,
      total_billed: project.total_billed,
      total_paid: project.total_paid,
      outstanding: project.outstanding,
      retention_held: lastInv ? lastInv.retention_held : 0,
    },
    recent_invoices: [...invoices]
      .sort((a, b) => b.invoice_date.localeCompare(a.invoice_date))
      .slice(0, 3)
      .map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        pay_app_number: inv.pay_app_number,
        current_payment_due: inv.current_payment_due,
        status: inv.status,
        invoice_date: inv.invoice_date,
      })),
    change_orders: changeOrders.map(co => ({
      id: co.id,
      co_number: co.co_number,
      title: co.title,
      amount: co.amount,
      status: co.status,
    })),
    cost_summary: {
      by_category: {
        material: 50810.68,
        labor_own: 102500.00,
        labor_sub: 17300.00,
        equipment: 6200.00,
        scaffold: 15800.00,
        overhead: 9500.00,
      },
      total: 202110.68,
      budget: project.original_contract + approvedTotal,
      margin: Number((((project.original_contract + approvedTotal - 202110.68) / (project.original_contract + approvedTotal)) * 100).toFixed(1)),
    },
  }
}

// Reset to seed data
export function resetDemoData() {
  _cache = null
  localStorage.removeItem(STORAGE_KEY)
  getData() // re-seed
}
