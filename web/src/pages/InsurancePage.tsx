import { useQuery } from '@tanstack/react-query'
import { fetchInsurancePolicies } from '../lib/api'
import { formatCurrency, formatDate, statusColor, policyTypeLabel } from '../lib/format'
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'

const MOCK_POLICIES = [
  { id: '1', company_name: 'Southwest Stucco, Inc.', policy_type: 'general_liability', policy_number: 'GL-2025-SWS-001', carrier: 'State Farm', effective_date: '2025-07-01', expiry_date: '2026-07-01', coverage_amount: 2000000, status: 'active', days_until_expiry: 112, expiring_soon: false },
  { id: '2', company_name: 'Southwest Stucco, Inc.', policy_type: 'workers_comp', policy_number: 'WC-2025-SWS-001', carrier: 'State Compensation Insurance Fund', effective_date: '2025-07-01', expiry_date: '2026-07-01', coverage_amount: 1000000, status: 'active', days_until_expiry: 112, expiring_soon: false },
  { id: '3', company_name: 'Southwest Stucco, Inc.', policy_type: 'auto', policy_number: 'AU-2025-SWS-001', carrier: 'Progressive Commercial', effective_date: '2025-09-01', expiry_date: '2026-09-01', coverage_amount: 1000000, status: 'active', days_until_expiry: 174, expiring_soon: false },
  { id: '4', company_name: 'Southwest Stucco, Inc.', policy_type: 'ocip', policy_number: 'OCIP-HTF-2022', carrier: 'Hartford / Intergulf OCIP', effective_date: '2022-03-01', expiry_date: '2026-12-31', coverage_amount: 5000000, status: 'active', days_until_expiry: 295, expiring_soon: false },
]

export default function InsurancePage() {
  const { data } = useQuery({
    queryKey: ['insurance'],
    queryFn: fetchInsurancePolicies,
  })

  const policies = data || MOCK_POLICIES
  const activeCount = policies.filter(p => p.status === 'active').length
  const expiringCount = policies.filter(p => p.expiring_soon).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sws-navy">Insurance & Compliance</h1>
          <p className="text-sm text-gray-500">Policy vault and COI management</p>
        </div>
        <button className="btn-gold flex items-center gap-2">
          <Shield size={16} /> Generate COI
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
    </div>
  )
}
