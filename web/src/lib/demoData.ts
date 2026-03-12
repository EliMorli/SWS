import type { Project, Invoice, ChangeOrder, LienRelease, InsurancePolicy, FieldUpdate, Estimate, EstimateLineItem, ProjectDropboxMapping, DropboxFileEntry } from '../types'

const STORAGE_KEY = 'sws_demo_data'

export interface DemoData {
  projects: Project[]
  invoices: Invoice[]
  changeOrders: ChangeOrder[]
  lienReleases: LienRelease[]
  insurancePolicies: InsurancePolicy[]
  fieldUpdates: FieldUpdate[]
  estimates: Estimate[]
  dropboxMappings: ProjectDropboxMapping[]
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

function seedFieldUpdates(): FieldUpdate[] {
  return [
    {
      id: 'fu-1',
      project_id: 'hartford-001',
      sender_name: 'Marco R.',
      sender_role: 'Field Super',
      message: 'Brown coat on Building A west wall complete. Moving to east side tomorrow. Crew of 6 on site.',
      photo_url: null,
      photo_thumbnail: null,
      latitude: 34.0536,
      longitude: -118.2658,
      geocoded_address: '1441 W 5th St, Los Angeles, CA 90017',
      source: 'telegram',
      auto_matched: true,
      created_at: '2024-09-10T14:32:00Z',
    },
    {
      id: 'fu-2',
      project_id: 'hartford-001',
      sender_name: 'Aaron S.',
      sender_role: 'PM',
      message: 'Fassberg wants revised schedule for color coat phase. Meeting tomorrow at 9am on site.',
      photo_url: null,
      photo_thumbnail: null,
      latitude: null,
      longitude: null,
      geocoded_address: null,
      source: 'web',
      auto_matched: false,
      created_at: '2024-09-12T09:15:00Z',
    },
    {
      id: 'fu-3',
      project_id: 'hartford-001',
      sender_name: 'Marco R.',
      sender_role: 'Field Super',
      message: 'Scaffold issue on north elevation - need engineer signoff before we can proceed to 4th floor. See attached.',
      photo_url: null,
      photo_thumbnail: null,
      latitude: 34.0538,
      longitude: -118.2655,
      geocoded_address: '1441 W 5th St, Los Angeles, CA 90017',
      source: 'telegram',
      auto_matched: true,
      created_at: '2024-09-14T11:45:00Z',
    },
  ]
}

function seedEstimates(): Estimate[] {
  const lineItems1: EstimateLineItem[] = [
    { id: 'li-1', description: 'Metal lath (3.4 lb diamond)', category: 'material', quantity: 15691, unit: 'sq yd', unit_cost: 3.25, total: 50995.75 },
    { id: 'li-2', description: 'Scratch coat material (cement/sand)', category: 'material', quantity: 15691, unit: 'sq yd', unit_cost: 1.80, total: 28243.80 },
    { id: 'li-3', description: 'Brown coat material', category: 'material', quantity: 15691, unit: 'sq yd', unit_cost: 2.10, total: 32951.10 },
    { id: 'li-4', description: 'Color coat material (Sherwin-Williams)', category: 'material', quantity: 15691, unit: 'sq yd', unit_cost: 2.85, total: 44719.35 },
    { id: 'li-5', description: 'Lath installation labor', category: 'labor', quantity: 15691, unit: 'sq yd', unit_cost: 12.50, total: 196137.50 },
    { id: 'li-6', description: 'Plaster application labor (scratch/brown/color)', category: 'labor', quantity: 15691, unit: 'sq yd', unit_cost: 18.00, total: 282438.00 },
    { id: 'li-7', description: 'Scaffolding - full project duration', category: 'scaffolding', quantity: 1, unit: 'ls', unit_cost: 85000, total: 85000.00 },
    { id: 'li-8', description: 'Pump/mixer equipment rental', category: 'equipment', quantity: 6, unit: 'mo', unit_cost: 4500, total: 27000.00 },
  ]
  const subtotal1 = lineItems1.reduce((s, li) => s + li.total, 0)
  const markup1 = subtotal1 * 0.15
  const total1 = subtotal1 + markup1

  const lineItems2: EstimateLineItem[] = [
    { id: 'li-9', description: 'Stucco material - amenity deck walls', category: 'material', quantity: 2400, unit: 'sq yd', unit_cost: 4.50, total: 10800.00 },
    { id: 'li-10', description: 'Metal lath - amenity deck', category: 'material', quantity: 2400, unit: 'sq yd', unit_cost: 3.25, total: 7800.00 },
    { id: 'li-11', description: 'Labor - lath & plaster (amenity)', category: 'labor', quantity: 2400, unit: 'sq yd', unit_cost: 32.00, total: 76800.00 },
    { id: 'li-12', description: 'Scaffolding - amenity deck', category: 'scaffolding', quantity: 1, unit: 'ls', unit_cost: 18000, total: 18000.00 },
    { id: 'li-13', description: 'Waterproofing additive', category: 'material', quantity: 2400, unit: 'sq yd', unit_cost: 1.75, total: 4200.00 },
  ]
  const subtotal2 = lineItems2.reduce((s, li) => s + li.total, 0)
  const markup2 = subtotal2 * 0.15
  const total2 = subtotal2 + markup2

  return [
    {
      id: 'est-001',
      project_id: 'hartford-001',
      project_name: '495 Hartford Apartments',
      estimate_number: 'EST-2022-001',
      title: '495 Hartford Apartments - Lath & Plaster - Original Bid',
      client_name: 'Fassberg Construction Company',
      client_address: '1441 W. 5th Street, Los Angeles, CA 90017',
      scope_of_work: 'Furnish all labor, material, equipment, and scaffolding required for the complete installation of metal lath and three-coat plaster system (scratch, brown, and color coat) per CSI 09-200 specifications for the 495 Hartford Apartments project.\n\nWork includes all exterior walls (13,828 sq yds) and ceilings (1,863 sq yds) across Buildings A through D, totaling approximately 15,691 square yards.\n\nColor coat finish: Sherwin-Williams Harmonized Colors system, smooth trowel finish, as selected by architect (IBI Group).',
      exclusions: '- Structural framing and sheathing\n- Waterproofing and weather barriers (by others)\n- Window and door installation\n- Painting beyond integral color coat\n- Permits and engineering (by GC)\n- Overtime or shift work unless pre-approved',
      terms_and_conditions: 'Payment: Net 30 from certified pay application\nRetention: Per subcontract agreement (10%)\nPrice valid for 60 days from date of proposal\nWork to be performed during normal business hours (7am-3:30pm M-F)\nAny changes to scope require written change order approval\nSouthwest Stucco maintains all required insurance and licensing (CA License #702110)',
      line_items: lineItems1,
      subtotal: subtotal1,
      markup_pct: 15,
      markup_amount: markup1,
      tax_pct: 0,
      tax_amount: 0,
      total: total1,
      status: 'accepted',
      valid_days: 60,
      created_at: '2022-01-15',
      sent_date: '2022-02-01',
      accepted_date: '2022-02-28',
      expiry_date: '2022-04-02',
      notes: null,
    },
    {
      id: 'est-002',
      project_id: 'hartford-001',
      project_name: '495 Hartford Apartments',
      estimate_number: 'EST-2026-002',
      title: 'Hartford - Phase 2 Amenity Deck Stucco',
      client_name: 'Fassberg Construction Company',
      client_address: '1441 W. 5th Street, Los Angeles, CA 90017',
      scope_of_work: 'Furnish all labor, material, equipment, and scaffolding required for lath and plaster installation at the Phase 2 rooftop amenity deck walls. Scope includes approximately 2,400 square yards of exterior stucco with waterproofing additive at all amenity-level walls.\n\nFinish to match existing color coat specification (Sherwin-Williams).',
      exclusions: '- Structural modifications\n- Roofing and waterproofing membrane\n- Electrical or plumbing penetrations\n- Overtime premium',
      terms_and_conditions: 'Payment: Net 30 from certified pay application\nRetention: Per subcontract agreement (10%)\nPrice valid for 45 days from date of proposal\nWork to be performed during normal business hours\nAny changes to scope require written change order approval',
      line_items: lineItems2,
      subtotal: subtotal2,
      markup_pct: 15,
      markup_amount: markup2,
      tax_pct: 0,
      tax_amount: 0,
      total: total2,
      status: 'draft',
      valid_days: 45,
      created_at: '2026-02-20',
      sent_date: null,
      accepted_date: null,
      expiry_date: null,
      notes: 'Pending GC review of amenity deck structural drawings',
    },
  ]
}

function seedDropboxMappings(): ProjectDropboxMapping[] {
  return [
    {
      project_id: 'hartford-001',
      dropbox_folder_path: '/SWS Projects/495 Hartford Apartments',
      linked_at: '2022-03-10',
    },
  ]
}

// Mock Dropbox file tree (not persisted, returned by demo API)
export function getMockDropboxFiles(): DropboxFileEntry[] {
  return [
    {
      id: 'dbx-1', name: 'Estimates', path_lower: '/sws projects/495 hartford apartments/estimates',
      path_display: '/SWS Projects/495 Hartford Apartments/Estimates', type: 'folder', icon: 'folder',
      children: [
        { id: 'dbx-1a', name: 'HTF-Original-Bid.pdf', path_lower: '/sws projects/495 hartford apartments/estimates/htf-original-bid.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Estimates/HTF-Original-Bid.pdf', type: 'file', size: 245000, modified: '2022-02-01', icon: 'pdf' },
        { id: 'dbx-1b', name: 'HTF-CO12-Amenity-Walls.pdf', path_lower: '/sws projects/495 hartford apartments/estimates/htf-co12-amenity-walls.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Estimates/HTF-CO12-Amenity-Walls.pdf', type: 'file', size: 189000, modified: '2024-06-26', icon: 'pdf' },
      ],
    },
    {
      id: 'dbx-2', name: 'Contracts', path_lower: '/sws projects/495 hartford apartments/contracts',
      path_display: '/SWS Projects/495 Hartford Apartments/Contracts', type: 'folder', icon: 'folder',
      children: [
        { id: 'dbx-2a', name: 'Subcontract-Fassberg-SWS.pdf', path_lower: '/sws projects/495 hartford apartments/contracts/subcontract-fassberg-sws.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Contracts/Subcontract-Fassberg-SWS.pdf', type: 'file', size: 520000, modified: '2022-03-01', icon: 'pdf' },
        { id: 'dbx-2b', name: 'Insurance-Requirements.pdf', path_lower: '/sws projects/495 hartford apartments/contracts/insurance-requirements.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Contracts/Insurance-Requirements.pdf', type: 'file', size: 98000, modified: '2022-03-01', icon: 'pdf' },
      ],
    },
    {
      id: 'dbx-3', name: 'Submittals', path_lower: '/sws projects/495 hartford apartments/submittals',
      path_display: '/SWS Projects/495 Hartford Apartments/Submittals', type: 'folder', icon: 'folder',
      children: [
        { id: 'dbx-3a', name: 'Color-Samples-Sherwin-Williams.pdf', path_lower: '/sws projects/495 hartford apartments/submittals/color-samples-sherwin-williams.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Submittals/Color-Samples-Sherwin-Williams.pdf', type: 'file', size: 1200000, modified: '2022-05-15', icon: 'pdf' },
        { id: 'dbx-3b', name: 'Metal-Lath-Spec-Sheet.pdf', path_lower: '/sws projects/495 hartford apartments/submittals/metal-lath-spec-sheet.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Submittals/Metal-Lath-Spec-Sheet.pdf', type: 'file', size: 340000, modified: '2022-04-20', icon: 'pdf' },
      ],
    },
    {
      id: 'dbx-4', name: 'Photos', path_lower: '/sws projects/495 hartford apartments/photos',
      path_display: '/SWS Projects/495 Hartford Apartments/Photos', type: 'folder', icon: 'folder',
      children: [
        { id: 'dbx-4a', name: '2024-09-10-BrownCoat-BuildingA.jpg', path_lower: '/sws projects/495 hartford apartments/photos/2024-09-10-browncoat-buildinga.jpg', path_display: '/SWS Projects/495 Hartford Apartments/Photos/2024-09-10-BrownCoat-BuildingA.jpg', type: 'file', size: 3400000, modified: '2024-09-10', icon: 'image' },
        { id: 'dbx-4b', name: '2024-09-14-Scaffold-NorthElev.jpg', path_lower: '/sws projects/495 hartford apartments/photos/2024-09-14-scaffold-northelev.jpg', path_display: '/SWS Projects/495 Hartford Apartments/Photos/2024-09-14-Scaffold-NorthElev.jpg', type: 'file', size: 2800000, modified: '2024-09-14', icon: 'image' },
      ],
    },
    {
      id: 'dbx-5', name: 'Change Orders', path_lower: '/sws projects/495 hartford apartments/change orders',
      path_display: '/SWS Projects/495 Hartford Apartments/Change Orders', type: 'folder', icon: 'folder',
      children: [
        { id: 'dbx-5a', name: 'CO-01-Waterproofing.pdf', path_lower: '/sws projects/495 hartford apartments/change orders/co-01-waterproofing.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Change Orders/CO-01-Waterproofing.pdf', type: 'file', size: 156000, modified: '2022-08-15', icon: 'pdf' },
        { id: 'dbx-5b', name: 'CO-12-Amenity-Walls.pdf', path_lower: '/sws projects/495 hartford apartments/change orders/co-12-amenity-walls.pdf', path_display: '/SWS Projects/495 Hartford Apartments/Change Orders/CO-12-Amenity-Walls.pdf', type: 'file', size: 178000, modified: '2024-07-10', icon: 'pdf' },
      ],
    },
    {
      id: 'dbx-6', name: 'Close-out', path_lower: '/sws projects/495 hartford apartments/close-out',
      path_display: '/SWS Projects/495 Hartford Apartments/Close-out', type: 'folder', icon: 'folder',
      children: [],
    },
  ]
}

// ─── Store Operations ────────────────────────────────────────────────────────

function loadData(): DemoData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      let dirty = false
      // Migrate: add fieldUpdates if missing from older stored data
      if (!parsed.fieldUpdates) {
        parsed.fieldUpdates = seedFieldUpdates()
        dirty = true
      }
      if (!parsed.estimates) {
        parsed.estimates = seedEstimates()
        dirty = true
      }
      if (!parsed.dropboxMappings) {
        parsed.dropboxMappings = seedDropboxMappings()
        dirty = true
      }
      if (dirty) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return parsed as DemoData
    }
  } catch { /* corrupted data, re-seed */ }

  const data: DemoData = {
    projects: seedProjects(),
    invoices: seedInvoices(),
    changeOrders: seedChangeOrders(),
    lienReleases: seedLienReleases(),
    insurancePolicies: seedInsurancePolicies(),
    fieldUpdates: seedFieldUpdates(),
    estimates: seedEstimates(),
    dropboxMappings: seedDropboxMappings(),
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
    recent_field_updates: getRecentFieldUpdates(),
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

// Field Updates
export function getFieldUpdates(projectId: string): FieldUpdate[] {
  return getData().fieldUpdates
    .filter(fu => fu.project_id === projectId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function getAllFieldUpdates(): FieldUpdate[] {
  return [...getData().fieldUpdates].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function createFieldUpdate(input: {
  project_id: string
  sender_name: string
  sender_role: string
  message: string
  photo_thumbnail: string | null
  latitude: number | null
  longitude: number | null
  geocoded_address: string | null
  source: 'telegram' | 'whatsapp' | 'sms' | 'web'
  auto_matched: boolean
}): FieldUpdate {
  const fu: FieldUpdate = {
    id: genId(),
    ...input,
    photo_url: input.photo_thumbnail,
    created_at: new Date().toISOString(),
  }
  update(d => d.fieldUpdates.push(fu))
  return fu
}

function getRecentFieldUpdates() {
  const data = getData()
  return [...data.fieldUpdates]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map(fu => {
      const proj = data.projects.find(p => p.id === fu.project_id)
      return {
        id: fu.id,
        project_name: proj?.name || 'Unknown',
        sender_name: fu.sender_name,
        message: fu.message,
        photo_thumbnail: fu.photo_thumbnail,
        source: fu.source,
        created_at: fu.created_at,
      }
    })
}

// Estimates
export function getEstimates(): Estimate[] {
  return getData().estimates
}

export function getEstimate(id: string): Estimate | undefined {
  return getData().estimates.find(e => e.id === id)
}

export function createEstimate(input: Omit<Estimate, 'id' | 'created_at'>): Estimate {
  const estimate: Estimate = {
    id: genId(),
    ...input,
    created_at: today(),
  }
  update(d => d.estimates.push(estimate))
  return estimate
}

export function updateEstimate(id: string, input: Partial<Estimate>): Estimate {
  const data = getData()
  const est = data.estimates.find(e => e.id === id)
  if (!est) throw new Error('Estimate not found')
  Object.assign(est, input)
  saveData(data)
  return est
}

export function updateEstimateStatus(id: string, status: Estimate['status']): Estimate {
  const data = getData()
  const est = data.estimates.find(e => e.id === id)
  if (!est) throw new Error('Estimate not found')
  est.status = status
  if (status === 'sent') {
    est.sent_date = today()
    const validDays = est.valid_days || 30
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + validDays)
    est.expiry_date = expiry.toISOString().split('T')[0]
  } else if (status === 'accepted') {
    est.accepted_date = today()
  }
  saveData(data)
  return est
}

export function deleteEstimate(id: string): void {
  update(d => {
    d.estimates = d.estimates.filter(e => e.id !== id)
  })
}

// Dropbox Mappings
export function getDropboxMappings(): ProjectDropboxMapping[] {
  return getData().dropboxMappings
}

export function getDropboxMapping(projectId: string): ProjectDropboxMapping | undefined {
  return getData().dropboxMappings.find(m => m.project_id === projectId)
}

export function setDropboxMapping(projectId: string, folderPath: string): ProjectDropboxMapping {
  const data = getData()
  const existing = data.dropboxMappings.find(m => m.project_id === projectId)
  if (existing) {
    existing.dropbox_folder_path = folderPath
    existing.linked_at = today()
    saveData(data)
    return existing
  }
  const mapping: ProjectDropboxMapping = {
    project_id: projectId,
    dropbox_folder_path: folderPath,
    linked_at: today(),
  }
  data.dropboxMappings.push(mapping)
  saveData(data)
  return mapping
}

export function removeDropboxMapping(projectId: string): void {
  update(d => {
    d.dropboxMappings = d.dropboxMappings.filter(m => m.project_id !== projectId)
  })
}

// Reset to seed data
export function resetDemoData() {
  _cache = null
  localStorage.removeItem(STORAGE_KEY)
  getData() // re-seed
}
