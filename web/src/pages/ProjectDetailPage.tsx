import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchProjectDashboard } from '../lib/api'
import { formatCurrency, formatPercent, statusColor } from '../lib/format'
import {
  ArrowLeft, FileText, GitPullRequest, ScrollText, DollarSign,
  TrendingUp, PieChart, Layers
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MOCK_PROJECT_DASHBOARD = {
  project: {
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
  },
  phases: [
    { id: '1', name: 'Scaffold', billing_pct: 0, completion_pct: 100, status: 'complete' },
    { id: '2', name: 'Lath', billing_pct: 35, completion_pct: 100, status: 'complete' },
    { id: '3', name: 'Scratch', billing_pct: 20, completion_pct: 100, status: 'complete' },
    { id: '4', name: 'Brown', billing_pct: 25, completion_pct: 85, status: 'in_progress' },
    { id: '5', name: 'Color', billing_pct: 20, completion_pct: 40, status: 'in_progress' },
  ],
  billing_summary: {
    original_contract: 865000.00,
    approved_cos: 268005.20,
    revised_contract: 1133005.20,
    total_billed: 1157965.20,
    total_paid: 966182.81,
    outstanding: 191782.39,
    retention_held: 115796.52,
  },
  recent_invoices: [
    { id: '10', invoice_number: '7461', pay_app_number: 10, current_payment_due: 29193.75, status: 'submitted', invoice_date: '2024-09-15' },
    { id: '9', invoice_number: '7460', pay_app_number: 9, current_payment_due: 114094.98, status: 'paid', invoice_date: '2024-05-15' },
    { id: '8', invoice_number: '7459', pay_app_number: 8, current_payment_due: 85500.00, status: 'paid', invoice_date: '2024-01-15' },
  ],
  change_orders: Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    co_number: i + 1,
    title: [
      'Additional waterproofing at balconies', 'Extra lath at modified wall sections',
      'Added ceiling scope - Building B corridors', 'Revised scratch coat specification',
      'Extended scaffold rental - weather delays', 'Additional masking at storefront glazing',
      'XJ-15 additive scope increase', 'Drip edge at revised parapet details',
      'Color coat revision - Sherwin-Williams spec change', 'Additional brown coat at mechanical screen walls',
      'Elastomeric crack system upgrade', 'Final scope additions - rooftop amenity walls'
    ][i],
    amount: [24500, 18200, 42800, 15600, 31400, 12300, 19800, 8900, 28500, 22100, 26400, 17505.20][i],
    status: 'approved',
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
    budget: 1133005.20,
    margin: 82.2,
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  material: 'Material',
  labor_own: 'Labor (Own Crew)',
  labor_sub: 'Labor (Subs)',
  equipment: 'Equipment',
  scaffold: 'Scaffold',
  overhead: 'Overhead',
}

const COST_COLORS = ['#0d1b2a', '#1b3a5c', '#f0a500', '#2563eb', '#16a34a', '#6b7280']

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data } = useQuery({
    queryKey: ['project-dashboard', id],
    queryFn: () => fetchProjectDashboard(id!),
    enabled: !!id,
  })

  const dash = data || MOCK_PROJECT_DASHBOARD
  const project = dash.project
  const billing = dash.billing_summary

  const costChartData = Object.entries(dash.cost_summary.by_category).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value: value as number,
  }))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-sws-navy">{project.name}</h1>
              <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{project.address}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>GC: <strong className="text-gray-700">{project.gc_name}</strong></span>
              <span>Owner: <strong className="text-gray-700">{project.owner_name}</strong></span>
              <span>Architect: <strong className="text-gray-700">{project.architect_name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link to={`/projects/${id}/billing`} className="btn-primary flex items-center gap-2 text-sm">
          <FileText size={16} /> Billing & Pay Apps
        </Link>
        <Link to={`/projects/${id}/change-orders`} className="btn-primary flex items-center gap-2 text-sm">
          <GitPullRequest size={16} /> Change Orders
        </Link>
        <Link to={`/projects/${id}/lien-releases`} className="btn-primary flex items-center gap-2 text-sm">
          <ScrollText size={16} /> Lien Releases
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Original Contract', value: billing.original_contract, color: 'text-gray-700' },
          { label: 'Approved COs', value: billing.approved_cos, color: 'text-sws-gold' },
          { label: 'Revised Contract', value: billing.revised_contract, color: 'text-sws-navy' },
          { label: 'Total Billed', value: billing.total_billed, color: 'text-blue-600' },
          { label: 'Total Paid', value: billing.total_paid, color: 'text-green-600' },
          { label: 'Outstanding', value: billing.outstanding, color: 'text-amber-600' },
          { label: 'Retention Held', value: billing.retention_held, color: 'text-red-500' },
        ].map((item) => (
          <div key={item.label} className="card !p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className={`text-lg font-bold ${item.color} mt-1`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Phase Progress */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-sws-gold" />
            <h2 className="text-lg font-semibold text-sws-navy">Phase Progress</h2>
          </div>
          <div className="space-y-4">
            {dash.phases.map((phase) => (
              <div key={phase.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{phase.name}</span>
                    <span className={`badge text-xs ${statusColor(phase.status)}`}>{phase.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {phase.billing_pct > 0 && <span>{phase.billing_pct}% billing</span>}
                    <span className="font-semibold text-sws-navy">{formatPercent(phase.completion_pct)}</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      phase.completion_pct >= 100
                        ? 'bg-green-500'
                        : phase.completion_pct >= 50
                        ? 'bg-sws-gold'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${phase.completion_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <span className="text-sm text-gray-500">Total Area:</span>
            <span className="text-sm font-semibold">{project.total_area_sqyds?.toLocaleString()} sq yds</span>
            <span className="text-xs text-gray-400">({project.total_wall_sqyds?.toLocaleString()} walls + {project.total_ceiling_sqyds?.toLocaleString()} ceilings)</span>
          </div>
        </div>

        {/* Job Cost Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-sws-gold" />
              <h2 className="text-lg font-semibold text-sws-navy">Job Cost Summary</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Gross Margin</p>
              <p className="text-lg font-bold text-green-600">{dash.cost_summary.margin}%</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {costChartData.map((_, i) => (
                    <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total Costs to Date</span>
            <span className="font-bold text-sws-navy">{formatCurrency(dash.cost_summary.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pay Apps */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Recent Pay Applications</h2>
            <Link to={`/projects/${id}/billing`} className="text-sm text-sws-gold hover:underline">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">#</th>
                <th className="pb-2">Invoice</th>
                <th className="pb-2">Amount Due</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dash.recent_invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium">Pay App {inv.pay_app_number}</td>
                  <td className="py-2">#{inv.invoice_number}</td>
                  <td className="py-2 font-semibold">{formatCurrency(inv.current_payment_due)}</td>
                  <td className="py-2"><span className={`badge ${statusColor(inv.status)}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Change Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Change Orders</h2>
            <Link to={`/projects/${id}/change-orders`} className="text-sm text-sws-gold hover:underline">View All</Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dash.change_orders.map((co) => (
              <div key={co.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sws-gold">CO {co.co_number}</span>
                  <span className="text-sm">{co.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatCurrency(co.amount)}</span>
                  <span className={`badge ${statusColor(co.status)}`}>{co.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Total Change Orders</span>
            <span className="font-bold text-sws-gold">
              {formatCurrency(dash.change_orders.reduce((sum, co) => sum + co.amount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
