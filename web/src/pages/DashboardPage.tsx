import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../lib/api'
import { formatCurrency, formatDate, statusColor } from '../lib/format'
import {
  DollarSign, FileText, AlertTriangle, Shield, TrendingUp,
  Clock, ArrowRight
} from 'lucide-react'

// For the MVP demo, use mock data that matches Hartford project
const MOCK_DASHBOARD = {
  summary: {
    total_projects: 1,
    active_projects: 1,
    total_contract_value: 1133005.20,
    total_billed: 1157965.20,
    total_paid: 966182.81,
    total_outstanding: 191782.39,
  },
  recent_invoices: [
    { id: '1', invoice_number: '7461', project_name: '495 Hartford Apartments', current_payment_due: 29193.75, status: 'submitted', days_outstanding: 178, invoice_date: '2024-09-15' },
    { id: '2', invoice_number: '7460', project_name: '495 Hartford Apartments', current_payment_due: 114094.98, status: 'paid', days_outstanding: 0, invoice_date: '2024-05-15' },
    { id: '3', invoice_number: '7459', project_name: '495 Hartford Apartments', current_payment_due: 85500.00, status: 'paid', days_outstanding: 0, invoice_date: '2024-01-15' },
  ],
  pending_change_orders: [],
  expiring_insurance: [
    { id: '1', company_name: 'Southwest Stucco, Inc.', policy_type: 'general_liability', expiry_date: '2026-07-01', days_until_expiry: 112, expiring_soon: false, policy_number: 'GL-2025', carrier: 'State Farm', effective_date: '2025-07-01', coverage_amount: 2000000, status: 'active' },
  ],
  overdue_invoices: [
    { id: '1', invoice_number: '7461', project_name: '495 Hartford Apartments', current_payment_due: 29193.75, status: 'submitted', days_outstanding: 178 },
  ],
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: typeof DollarSign; color: string; sub?: string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  const dash = data || MOCK_DASHBOARD

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Dashboard</h1>
          <p className="text-sm text-gray-500">Southwest Stucco Operations Overview</p>
        </div>
        <Link to="/projects" className="btn-primary flex items-center gap-2">
          View Projects <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Contract Value"
          value={formatCurrency(dash.summary.total_contract_value)}
          icon={DollarSign}
          color="text-sws-navy"
          sub={`${dash.summary.active_projects} active project${dash.summary.active_projects !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Total Billed"
          value={formatCurrency(dash.summary.total_billed)}
          icon={FileText}
          color="text-blue-600"
          sub={`${((dash.summary.total_billed / dash.summary.total_contract_value) * 100).toFixed(1)}% of contract`}
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(dash.summary.total_paid)}
          icon={TrendingUp}
          color="text-green-600"
          sub={`${((dash.summary.total_paid / dash.summary.total_billed) * 100).toFixed(1)}% collection rate`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(dash.summary.total_outstanding)}
          icon={AlertTriangle}
          color="text-amber-600"
          sub="Includes ~$110K retention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Recent Pay Applications</h2>
            <FileText size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {dash.recent_invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">Invoice #{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500">{inv.project_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(inv.current_payment_due)}</p>
                  <span className={`badge ${statusColor(inv.status)}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-red-600">Overdue Invoices</h2>
            <Clock size={18} className="text-red-400" />
          </div>
          {dash.overdue_invoices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No overdue invoices</p>
          ) : (
            <div className="space-y-3">
              {dash.overdue_invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm">Invoice #{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.project_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-red-600">{formatCurrency(inv.current_payment_due)}</p>
                    <p className="text-xs text-red-500">{inv.days_outstanding} days overdue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Change Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Pending Change Orders</h2>
          </div>
          {dash.pending_change_orders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">All change orders approved</p>
              <p className="text-xs text-gray-400 mt-1">12 COs totaling $268,005.20</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dash.pending_change_orders.map((co) => (
                <div key={co.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-sm">CO #{co.co_number}: {co.title}</p>
                    <p className="text-xs text-gray-500">{co.project_name}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(co.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Insurance Status</h2>
            <Link to="/insurance" className="text-sm text-sws-gold hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {[
              { type: 'General Liability', status: 'Active', expiry: 'Jul 2026', color: 'text-green-600' },
              { type: 'Workers\' Comp', status: 'Active', expiry: 'Jul 2026', color: 'text-green-600' },
              { type: 'Auto/Commercial', status: 'Active', expiry: 'Sep 2026', color: 'text-green-600' },
              { type: 'OCIP (Hartford)', status: 'Active', expiry: 'Dec 2026', color: 'text-green-600' },
            ].map((p) => (
              <div key={p.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Shield size={14} className={p.color} />
                  <span className="text-sm font-medium">{p.type}</span>
                </div>
                <div className="text-right">
                  <span className={`badge badge-green`}>{p.status}</span>
                  <p className="text-xs text-gray-400 mt-0.5">Exp: {p.expiry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
