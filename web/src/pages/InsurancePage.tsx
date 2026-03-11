import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInsurancePolicies, apiCreateInsurancePolicy } from '../lib/api'
import { formatCurrency, formatDate, statusColor, policyTypeLabel } from '../lib/format'
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Modal from '../components/ui/Modal'

export default function InsurancePage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data } = useQuery({
    queryKey: ['insurance'],
    queryFn: fetchInsurancePolicies,
  })

  const policies = data || []
  const activeCount = policies.filter(p => p.status === 'active').length
  const expiringCount = policies.filter(p => p.expiring_soon || p.status === 'expiring_soon').length

  const createMutation = useMutation({
    mutationFn: apiCreateInsurancePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowNew(false)
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Insurance & Compliance</h1>
          <p className="text-sm text-gray-500">Policy vault and COI management</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => setShowNew(true)}>
          <Shield size={16} /> Add Policy
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle2 size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-gray-500">Active Policies</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
            <p className="text-sm text-gray-500">Expiring Soon</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(policies.reduce((sum, p) => sum + p.coverage_amount, 0))}</p>
            <p className="text-sm text-gray-500">Total Coverage</p>
          </div>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="grid gap-4">
        {policies.map((policy) => (
          <div key={policy.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  policy.status === 'expired' ? 'bg-red-50' :
                  policy.expiring_soon ? 'bg-amber-50' : 'bg-green-50'
                }`}>
                  <Shield size={24} className={
                    policy.status === 'expired' ? 'text-red-500' :
                    policy.expiring_soon ? 'text-amber-500' : 'text-green-600'
                  } />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-sws-navy">{policyTypeLabel(policy.policy_type)}</h3>
                    <span className={`badge ${statusColor(policy.status)}`}>{policy.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{policy.carrier}</p>
                  <p className="text-xs text-gray-400 mt-1">Policy # {policy.policy_number}</p>

                  <div className="flex gap-6 mt-3 text-sm">
                    <div>
                      <span className="text-gray-400">Effective:</span>
                      <span className="ml-1 font-medium">{formatDate(policy.effective_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expiry:</span>
                      <span className="ml-1 font-medium">{formatDate(policy.expiry_date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Coverage:</span>
                      <span className="ml-1 font-semibold text-sws-navy">{formatCurrency(policy.coverage_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {policy.days_until_expiry > 0 ? (
                  <div>
                    <p className={`text-2xl font-bold ${policy.days_until_expiry <= 30 ? 'text-red-600' : policy.days_until_expiry <= 60 ? 'text-amber-600' : 'text-green-600'}`}>
                      {policy.days_until_expiry}
                    </p>
                    <p className="text-xs text-gray-400">days remaining</p>
                  </div>
                ) : (
                  <span className="badge badge-red">Expired</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Notes */}
      <div className="mt-6 card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2">California Compliance Notes</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>CSLB License #702110 - Renewal tracked automatically</li>
          <li>All subcontractor COIs must be current before payment release</li>
          <li>OCIP enrollment active for Hartford project through Intergulf</li>
          <li>Auto-alerts at 60, 30, and 15 days before expiry</li>
        </ul>
      </div>

      {/* Add Policy Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Insurance Policy">
        <NewPolicyForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  )
}

function NewPolicyForm({ onSubmit, loading }: {
  onSubmit: (data: { policy_type: string; policy_number: string; carrier: string; effective_date: string; expiry_date: string; coverage_amount: number }) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    policy_type: 'general_liability',
    policy_number: '',
    carrier: '',
    effective_date: '',
    expiry_date: '',
    coverage_amount: '',
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit({ ...form, coverage_amount: parseFloat(form.coverage_amount) || 0 })
    }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
        <select className="input" value={form.policy_type}
          onChange={e => setForm(f => ({ ...f, policy_type: e.target.value }))}>
          <option value="general_liability">General Liability</option>
          <option value="workers_comp">Workers' Comp</option>
          <option value="auto">Auto/Commercial</option>
          <option value="ocip">OCIP/CIP</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
          <input type="text" required className="input" placeholder="GL-2025-001"
            value={form.policy_number} onChange={e => setForm(f => ({ ...f, policy_number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
          <input type="text" required className="input" placeholder="State Farm"
            value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
          <input type="date" required className="input"
            value={form.effective_date} onChange={e => setForm(f => ({ ...f, effective_date: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" required className="input"
            value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount ($)</label>
        <input type="number" required step="1" min="0" className="input" placeholder="2000000"
          value={form.coverage_amount} onChange={e => setForm(f => ({ ...f, coverage_amount: e.target.value }))} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Policy'}
        </button>
      </div>
    </form>
  )
}
