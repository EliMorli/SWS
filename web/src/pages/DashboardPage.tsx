import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchDashboard, apiResetDemoData } from '../lib/api'
import { formatCurrency, statusColor } from '../lib/format'
import {
  DollarSign, FileText, AlertTriangle, Shield, TrendingUp,
  Clock, ArrowRight, RotateCcw
} from 'lucide-react'

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
  const queryClient = useQueryClient()

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  if (!dash) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const handleReset = () => {
    if (confirm('Reset all demo data to original seed data? This cannot be undone.')) {
      apiResetDemoData()
      queryClient.invalidateQueries()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Dashboard</h1>
          <p className="text-sm text-gray-500">Southwest Stucco Operations Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            title="Reset demo data"
          >
            <RotateCcw size={14} /> Reset Demo
          </button>
          <Link to="/projects" className="btn-primary flex items-center gap-2">
            View Projects <ArrowRight size={16} />
          </Link>
        </div>
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
          sub={dash.summary.total_contract_value > 0 ? `${((dash.summary.total_billed / dash.summary.total_contract_value) * 100).toFixed(1)}% of contract` : undefined}
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(dash.summary.total_paid)}
          icon={TrendingUp}
          color="text-green-600"
          sub={dash.summary.total_billed > 0 ? `${((dash.summary.total_paid / dash.summary.total_billed) * 100).toFixed(1)}% collection rate` : undefined}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(dash.summary.total_outstanding)}
          icon={AlertTriangle}
          color="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sws-navy">Recent Pay Applications</h2>
            <FileText size={18} className="text-gray-400" />
          </div>
          {dash.recent_invoices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No pay applications yet</p>
          ) : (
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
          )}
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
            </div>
          ) : (
            <div className="space-y-3">
              {dash.pending_change_orders.map((co) => (
                <div key={co.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-sm">CO #{co.co_number}: {co.title}</p>
                    <p className="text-xs text-gray-500">{co.project_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(co.amount)}</p>
                    <span className={`badge ${statusColor(co.status)}`}>{co.status}</span>
                  </div>
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
            {dash.expiring_insurance.length > 0 ? (
              dash.expiring_insurance.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-amber-500" />
                    <span className="text-sm font-medium">{p.policy_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-yellow">expiring</span>
                    <p className="text-xs text-gray-400 mt-0.5">{p.days_until_expiry} days left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Shield size={24} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All policies current</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
