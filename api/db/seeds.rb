puts "Seeding SWS Operations Platform with Hartford project data..."

# ============================================================
# USERS
# ============================================================
aaron = User.find_or_create_by!(email: "aaron@swsstucco.com") do |u|
  u.first_name = "Aaron"
  u.last_name = "Secharia"
  u.password = "password123!"
  u.role = "owner"
  u.phone = "(818) 888-8554"
  u.jti = SecureRandom.uuid
end

pm = User.find_or_create_by!(email: "pm@swsstucco.com") do |u|
  u.first_name = "Maria"
  u.last_name = "Rodriguez"
  u.password = "password123!"
  u.role = "pm"
  u.phone = "(818) 555-0102"
  u.jti = SecureRandom.uuid
end

field_super = User.find_or_create_by!(email: "field@swsstucco.com") do |u|
  u.first_name = "Carlos"
  u.last_name = "Mendez"
  u.password = "password123!"
  u.role = "field_super"
  u.phone = "(818) 555-0103"
  u.jti = SecureRandom.uuid
end

puts "  Created #{User.count} users"

# ============================================================
# COMPANIES
# ============================================================
sws = Company.find_or_create_by!(name: "Southwest Stucco, Inc.") do |c|
  c.company_type = "self"
  c.license_number = "702110"
  c.phone = "(818) 888-8554"
  c.city = "Los Angeles"
  c.state = "CA"
end

fassberg = Company.find_or_create_by!(name: "Fassberg Construction Company") do |c|
  c.company_type = "gc"
  c.city = "Los Angeles"
  c.state = "CA"
end

intergulf = Company.find_or_create_by!(name: "Intergulf Development") do |c|
  c.company_type = "owner"
  c.city = "Los Angeles"
  c.state = "CA"
end

ibi = Company.find_or_create_by!(name: "IBI Group") do |c|
  c.company_type = "architect"
  c.city = "Los Angeles"
  c.state = "CA"
end

lw_supply = Company.find_or_create_by!(name: "L&W Supply") do |c|
  c.company_type = "vendor"
  c.notes = "Primary material supplier (formerly USG Distribution)"
  c.city = "Los Angeles"
  c.state = "CA"
end

# Sub crews
scaffold_co = Company.find_or_create_by!(name: "Pacific Scaffold Services") do |c|
  c.company_type = "subcontractor"
  c.notes = "Erect, maintain, dismantle scaffold system"
  c.state = "CA"
end

lath_co = Company.find_or_create_by!(name: "LA Lath Specialists") do |c|
  c.company_type = "subcontractor"
  c.notes = "Install metal lath system on all surfaces"
  c.state = "CA"
end

masking_co = Company.find_or_create_by!(name: "Premier Masking & Protection") do |c|
  c.company_type = "subcontractor"
  c.notes = "Protect windows, doors, adjacent surfaces"
  c.state = "CA"
end

scratch_brown_co = Company.find_or_create_by!(name: "SoCal Plaster Pros") do |c|
  c.company_type = "subcontractor"
  c.notes = "Apply scratch and brown coat plaster"
  c.state = "CA"
end

color_co = Company.find_or_create_by!(name: "Elite Finish Coatings") do |c|
  c.company_type = "subcontractor"
  c.notes = "Apply finish color coat + elastomeric crack system"
  c.state = "CA"
end

puts "  Created #{Company.count} companies"

# ============================================================
# CONTACTS
# ============================================================
Contact.find_or_create_by!(company: fassberg, first_name: "David", last_name: "Fassberg") do |c|
  c.title = "Project Manager"
  c.email = "david@fassbergconstruction.com"
  c.primary = true
end

Contact.find_or_create_by!(company: intergulf, first_name: "James", last_name: "Chen") do |c|
  c.title = "Development Director"
  c.email = "jchen@intergulf.com"
  c.primary = true
end

Contact.find_or_create_by!(company: ibi, first_name: "Sarah", last_name: "Kim") do |c|
  c.title = "Project Architect"
  c.email = "skim@ibigroup.com"
  c.primary = true
end

Contact.find_or_create_by!(company: lw_supply, first_name: "Robert", last_name: "Torres") do |c|
  c.title = "Account Manager"
  c.email = "rtorres@lwsupply.com"
  c.primary = true
end

puts "  Created #{Contact.count} contacts"

# ============================================================
# HARTFORD PROJECT
# ============================================================
hartford = Project.find_or_create_by!(name: "495 Hartford Apartments") do |p|
  p.project_number = "HTF-2022-001"
  p.address = "1441 W. 5th Street"
  p.city = "Los Angeles"
  p.state = "CA"
  p.zip = "90017"
  p.description = "Multi-family residential stucco systems. 495-unit apartment complex with full lath and plaster scope including walls and ceilings."
  p.trade = "CSI 09-200 Lath & Plaster"
  p.gc_company = fassberg
  p.owner_company = intergulf
  p.architect_company = ibi
  p.original_contract_cents = 86_500_000  # $865,000.00
  p.revised_contract_cents = 113_300_520  # $1,133,005.20
  p.retention_pct = 10.0
  p.total_billed_cents = 115_796_520     # $1,157,965.20
  p.total_paid_cents = 96_618_281        # $966,182.81
  p.total_wall_sqyds = 13_827.78
  p.total_ceiling_sqyds = 1_863.00
  p.status = "active"
  p.start_date = Date.new(2022, 3, 15)
end

puts "  Created Hartford project"

# ============================================================
# PROJECT PHASES
# ============================================================
phases = [
  { name: "Scaffold", sort_order: 0, billing_pct: 0, completion_pct: 100, status: "complete" },
  { name: "Lath", sort_order: 1, billing_pct: 35.0, completion_pct: 100, status: "complete" },
  { name: "Scratch", sort_order: 2, billing_pct: 20.0, completion_pct: 100, status: "complete" },
  { name: "Brown", sort_order: 3, billing_pct: 25.0, completion_pct: 85, status: "in_progress" },
  { name: "Color", sort_order: 4, billing_pct: 20.0, completion_pct: 40, status: "in_progress" }
]

phases.each do |phase_data|
  ProjectPhase.find_or_create_by!(project: hartford, name: phase_data[:name]) do |ph|
    ph.sort_order = phase_data[:sort_order]
    ph.billing_pct = phase_data[:billing_pct]
    ph.completion_pct = phase_data[:completion_pct]
    ph.status = phase_data[:status]
  end
end

puts "  Created #{ProjectPhase.count} project phases"

# ============================================================
# CHANGE ORDERS (12 approved COs totaling $268,005.20)
# ============================================================
change_orders = [
  { co_number: 1, title: "Additional waterproofing at balconies", amount_cents: 24_500_00, approved_date: Date.new(2022, 8, 15) },
  { co_number: 2, title: "Extra lath at modified wall sections", amount_cents: 18_200_00, approved_date: Date.new(2022, 9, 22) },
  { co_number: 3, title: "Added ceiling scope - Building B corridors", amount_cents: 42_800_00, approved_date: Date.new(2022, 11, 10) },
  { co_number: 4, title: "Revised scratch coat specification", amount_cents: 15_600_00, approved_date: Date.new(2023, 1, 18) },
  { co_number: 5, title: "Extended scaffold rental - weather delays", amount_cents: 31_400_00, approved_date: Date.new(2023, 3, 5) },
  { co_number: 6, title: "Additional masking at storefront glazing", amount_cents: 12_300_00, approved_date: Date.new(2023, 5, 12) },
  { co_number: 7, title: "XJ-15 additive scope increase", amount_cents: 19_800_00, approved_date: Date.new(2023, 7, 20) },
  { co_number: 8, title: "Drip edge at revised parapet details", amount_cents: 8_900_00, approved_date: Date.new(2023, 9, 8) },
  { co_number: 9, title: "Color coat revision - Sherwin-Williams spec change", amount_cents: 28_500_00, approved_date: Date.new(2023, 11, 15) },
  { co_number: 10, title: "Additional brown coat at mechanical screen walls", amount_cents: 22_100_00, approved_date: Date.new(2024, 2, 1) },
  { co_number: 11, title: "Elastomeric crack system upgrade", amount_cents: 26_400_00, approved_date: Date.new(2024, 4, 18) },
  { co_number: 12, title: "Final scope additions - rooftop amenity walls", amount_cents: 17_505_20, approved_date: Date.new(2024, 7, 10) }
]

change_orders.each do |co_data|
  ChangeOrder.find_or_create_by!(project: hartford, co_number: co_data[:co_number]) do |co|
    co.title = co_data[:title]
    co.amount_cents = co_data[:amount_cents]
    co.status = "approved"
    co.approved_date = co_data[:approved_date]
    co.approved_by = "Fassberg Construction"
    co.submitted_date = co_data[:approved_date] - 14.days
  end
end

puts "  Created #{ChangeOrder.count} change orders (total: $#{ChangeOrder.sum(:amount_cents) / 100.0})"

# ============================================================
# INVOICES / PAY APPLICATIONS (10 pay apps)
# ============================================================
invoices_data = [
  { pay_app: 1, inv: "7452", date: "2022-06-15", this_period: 15_225_000, total: 15_225_000, paid: 13_702_500 },
  { pay_app: 2, inv: "7453", date: "2022-08-15", this_period: 12_975_000, total: 28_200_000, paid: 11_677_500 },
  { pay_app: 3, inv: "7454", date: "2022-10-15", this_period: 14_400_000, total: 42_600_000, paid: 12_960_000 },
  { pay_app: 4, inv: "7455", date: "2023-01-15", this_period: 11_500_000, total: 54_100_000, paid: 10_350_000 },
  { pay_app: 5, inv: "7456", date: "2023-04-15", this_period: 13_200_000, total: 67_300_000, paid: 11_880_000 },
  { pay_app: 6, inv: "7457", date: "2023-07-15", this_period: 10_800_000, total: 78_100_000, paid: 9_720_000 },
  { pay_app: 7, inv: "7458", date: "2023-10-15", this_period: 12_600_000, total: 90_700_000, paid: 11_340_000 },
  { pay_app: 8, inv: "7459", date: "2024-01-15", this_period: 9_500_000, total: 100_200_000, paid: 8_550_000 },
  { pay_app: 9, inv: "7460", date: "2024-05-15", this_period: 12_677_220, total: 112_877_220, paid: 11_409_498 },
  { pay_app: 10, inv: "7461", date: "2024-09-15", this_period: 2_919_300, total: 115_796_520, paid: 2_919_300 }
]

previous_certs = 0
invoices_data.each do |inv_data|
  Invoice.find_or_create_by!(project: hartford, pay_app_number: inv_data[:pay_app]) do |inv|
    inv.invoice_number = inv_data[:inv]
    inv.invoice_date = Date.parse(inv_data[:date])
    inv.period_from = Date.parse(inv_data[:date]).beginning_of_month
    inv.period_to = Date.parse(inv_data[:date]).end_of_month
    inv.original_contract_cents = 86_500_000
    inv.change_order_total_cents = hartford.change_orders.where("approved_date <= ?", Date.parse(inv_data[:date])).sum(:amount_cents)
    inv.contract_total_cents = inv.original_contract_cents + inv.change_order_total_cents
    inv.completed_previous_cents = previous_certs
    inv.completed_this_period_cents = inv_data[:this_period]
    inv.total_completed_cents = inv_data[:total]
    inv.retention_held_cents = (inv_data[:total] * 0.10).round
    inv.total_earned_less_retention_cents = inv_data[:total] - inv.retention_held_cents
    inv.less_previous_certificates_cents = previous_certs > 0 ? (previous_certs - (previous_certs * 0.10).round) : 0
    inv.current_payment_due_cents = inv.total_earned_less_retention_cents - inv.less_previous_certificates_cents
    inv.amount_paid_cents = inv_data[:paid]
    inv.paid_date = Date.parse(inv_data[:date]) + 35.days
    inv.check_number = "#{10000 + inv_data[:pay_app]}"
    inv.status = inv_data[:pay_app] == 10 ? "submitted" : "paid"
    inv.submitted_at = Date.parse(inv_data[:date])
  end
  previous_certs = inv_data[:total]
end

puts "  Created #{Invoice.count} invoices/pay applications"

# ============================================================
# LIEN RELEASES
# ============================================================
Invoice.where(status: "paid").find_each do |inv|
  # SWS Conditional - sent with pay app
  LienRelease.find_or_create_by!(project: hartford, invoice: inv, release_type: "conditional_waiver", direction: "outgoing") do |lr|
    lr.company = sws
    lr.amount_cents = inv.current_payment_due_cents
    lr.through_date = inv.period_to
    lr.status = "signed"
    lr.signed_date = inv.invoice_date
  end

  # SWS Unconditional - after payment received
  LienRelease.find_or_create_by!(project: hartford, invoice: inv, release_type: "unconditional_waiver", direction: "outgoing") do |lr|
    lr.company = sws
    lr.amount_cents = inv.amount_paid_cents
    lr.through_date = inv.paid_date
    lr.status = "signed"
    lr.signed_date = inv.paid_date + 3.days
  end
end

# L&W Supply releases (incoming from vendor)
6.times do |i|
  inv = Invoice.find_by(pay_app_number: i + 1)
  next unless inv

  LienRelease.find_or_create_by!(project: hartford, invoice: inv, release_type: "conditional_waiver", direction: "incoming", company: lw_supply) do |lr|
    lr.amount_cents = (inv.current_payment_due_cents * 0.35).round  # ~35% material cost
    lr.through_date = inv.period_to
    lr.status = "received"
  end
end

puts "  Created #{LienRelease.count} lien releases"

# ============================================================
# INSURANCE POLICIES
# ============================================================
[
  { type: "general_liability", carrier: "State Farm", number: "GL-2025-SWS-001", effective: "2025-07-01", expiry: "2026-07-01", amount: 200_000_000 },
  { type: "workers_comp", carrier: "State Compensation Insurance Fund", number: "WC-2025-SWS-001", effective: "2025-07-01", expiry: "2026-07-01", amount: 100_000_000 },
  { type: "auto", carrier: "Progressive Commercial", number: "AU-2025-SWS-001", effective: "2025-09-01", expiry: "2026-09-01", amount: 100_000_000 },
  { type: "ocip", carrier: "Hartford / Intergulf OCIP", number: "OCIP-HTF-2022", effective: "2022-03-01", expiry: "2026-12-31", amount: 500_000_000 }
].each do |policy|
  InsurancePolicy.find_or_create_by!(company: sws, policy_type: policy[:type]) do |p|
    p.carrier = policy[:carrier]
    p.policy_number = policy[:number]
    p.effective_date = Date.parse(policy[:effective])
    p.expiry_date = Date.parse(policy[:expiry])
    p.coverage_amount_cents = policy[:amount]
    p.status = Date.parse(policy[:expiry]) > Date.current ? "active" : "expired"
  end
end

puts "  Created #{InsurancePolicy.count} insurance policies"

# ============================================================
# COST ENTRIES (sample data for job cost module)
# ============================================================
cost_data = [
  { category: "material", desc: "Lath & accessories - L&W Supply", amount: 18_500_000, date: "2022-06-01" },
  { category: "material", desc: "Stucco mix & brown coat material", amount: 14_200_000, date: "2022-09-01" },
  { category: "material", desc: "Color coat - Sherwin-Williams", amount: 8_800_000, date: "2023-06-01" },
  { category: "material", desc: "XJ-15 Additive", amount: 9_310_680, date: "2023-03-01" },
  { category: "labor_own", desc: "Foremen & journeymen - Q1-Q2 2022", amount: 22_000_000, date: "2022-06-30" },
  { category: "labor_own", desc: "Foremen & journeymen - Q3-Q4 2022", amount: 24_500_000, date: "2022-12-31" },
  { category: "labor_own", desc: "Foremen & journeymen - 2023", amount: 38_000_000, date: "2023-12-31" },
  { category: "labor_own", desc: "Foremen & journeymen - 2024 YTD", amount: 18_000_000, date: "2024-09-30" },
  { category: "labor_sub", desc: "Pacific Scaffold Services", amount: 12_800_000, date: "2023-06-30" },
  { category: "labor_sub", desc: "Masking crew", amount: 4_500_000, date: "2023-03-31" },
  { category: "equipment", desc: "Spray rigs, mixers, tools", amount: 6_200_000, date: "2022-12-31" },
  { category: "scaffold", desc: "Scaffold rental 2022-2024", amount: 15_800_000, date: "2024-06-30" },
  { category: "overhead", desc: "Insurance, vehicle, office allocation", amount: 9_500_000, date: "2024-09-30" }
]

cost_data.each do |cd|
  CostEntry.find_or_create_by!(project: hartford, description: cd[:desc]) do |ce|
    ce.category = cd[:category]
    ce.amount_cents = cd[:amount]
    ce.entry_date = Date.parse(cd[:date])
  end
end

puts "  Created #{CostEntry.count} cost entries"

# ============================================================
# SUMMARY
# ============================================================
puts ""
puts "=== SEED COMPLETE ==="
puts "  Users: #{User.count}"
puts "  Companies: #{Company.count}"
puts "  Contacts: #{Contact.count}"
puts "  Projects: #{Project.count}"
puts "  Project Phases: #{ProjectPhase.count}"
puts "  Invoices: #{Invoice.count}"
puts "  Change Orders: #{ChangeOrder.count}"
puts "  Lien Releases: #{LienRelease.count}"
puts "  Insurance Policies: #{InsurancePolicy.count}"
puts "  Cost Entries: #{CostEntry.count}"
puts ""
puts "  Demo Login: aaron@swsstucco.com / password123!"
puts "  PM Login:   pm@swsstucco.com / password123!"
