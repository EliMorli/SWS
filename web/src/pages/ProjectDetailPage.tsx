import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchProjectDashboard } from '../lib/api'
import { formatCurrency, formatPercent, statusColor } from '../lib/format'
import {
  ArrowLeft, FileText, GitPullRequest, ScrollText,
  PieChart, Layers, Calculator, FolderOpen
} from 'lucide-react'
import DropboxFileBrowser from '../components/dropbox/DropboxFileBrowser'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FieldUpdatesFeed } from '../components/FieldUpdates'

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

  const { data: dash } = useQuery({
    queryKey: ['project-dashboard', id],
    queryFn: () => fetchProjectDashboard(id!),
    enabled: !!id,
  })

  if (!dash) return <div className="text-center py-12 text-gray-400">Loading...</div>

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
              {project.owner_name && <span>Owner: <strong className="text-gray-700">{project.owner_name}</strong></span>}
              {project.architect_name && <span>Architect: <strong className="text-gray-700">{project.architect_name}</strong></span>}
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
        <Link to={`/estimates?project=${id}`} className="btn-primary flex items-center gap-2 text-sm">
          <Calculator size={16} /> Estimates
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
          {project.total_area_sqyds && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
              <span className="text-sm text-gray-500">Total Area:</span>
              <span className="text-sm font-semibold">{project.total_area_sqyds?.toLocaleString()} sq yds</span>
              <span className="text-xs text-gray-400">({project.total_wall_sqyds?.toLocaleString()} walls + {project.total_ceiling_sqyds?.toLocaleString()} ceilings)</span>
            </div>
          )}
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
          {dash.recent_invoices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>
          ) : (
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
          )}
        </div>

        {/* Change Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Change Orders</h2>
            <Link to={`/projects/${id}/change-orders`} className="text-sm text-sws-gold hover:underline">View All</Link>
          </div>
          {dash.change_orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No change orders yet</p>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Project Files (Dropbox) */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={18} className="text-sws-gold" />
            <h2 className="text-lg font-semibold text-sws-navy">Project Files</h2>
          </div>
          <DropboxFileBrowser projectId={id!} />
        </div>
      </div>

      {/* Field Updates */}
      <div className="mt-6">
        <FieldUpdatesFeed projectId={id!} />
      </div>
    </div>
  )
}
