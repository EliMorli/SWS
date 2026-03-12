import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { fetchEstimates, apiDeleteEstimate } from '../lib/api'
import { formatCurrency, formatDate, estimateStatusColor } from '../lib/format'
import { Plus, Eye, Pencil, Trash2, FileText, Calculator } from 'lucide-react'
import type { EstimateStatus } from '../types'

const STATUS_TABS: { label: string; value: EstimateStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
]

export default function EstimatesPage() {
  const [statusFilter, setStatusFilter] = useState<EstimateStatus | 'all'>('all')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: estimates = [] } = useQuery({
    queryKey: ['estimates'],
    queryFn: fetchEstimates,
  })

  const deleteMutation = useMutation({
    mutationFn: apiDeleteEstimate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estimates'] }),
  })

  const filtered = statusFilter === 'all'
    ? estimates
    : estimates.filter(e => e.status === statusFilter)

  const draftCount = estimates.filter(e => e.status === 'draft').length
  const sentValue = estimates.filter(e => e.status === 'sent').reduce((s, e) => s + e.total, 0)
  const acceptedValue = estimates.filter(e => e.status === 'accepted').reduce((s, e) => s + e.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator size={24} className="text-sws-gold" />
          <h1 className="text-2xl font-bold text-sws-navy">Estimates & Proposals</h1>
        </div>
        <Link to="/estimates/new" className="btn-gold flex items-center gap-2">
          <Plus size={16} /> New Estimate
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Estimates</p>
          <p className="text-2xl font-bold text-sws-navy mt-1">{estimates.length}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Drafts</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{draftCount}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Sent Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(sentValue)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Accepted Value</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(acceptedValue)}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-sws-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>No estimates found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Est #</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Client / Project</th>
                <th className="pb-2 text-center">Items</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(est => (
                <tr
                  key={est.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/estimates/${est.id}`)}
                >
                  <td className="py-3 font-semibold text-sws-gold">{est.estimate_number}</td>
                  <td className="py-3 font-medium text-sws-navy">{est.title}</td>
                  <td className="py-3">
                    <div>{est.client_name}</div>
                    {est.project_name && (
                      <div className="text-xs text-gray-400">{est.project_name}</div>
                    )}
                  </td>
                  <td className="py-3 text-center">{est.line_items.length}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(est.total)}</td>
                  <td className="py-3">
                    <span className={`badge ${estimateStatusColor(est.status)}`}>{est.status}</span>
                  </td>
                  <td className="py-3 text-gray-500">{formatDate(est.created_at)}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/estimates/${est.id}`}
                        className="text-gray-400 hover:text-sws-navy transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <Link
                        to={`/estimates/${est.id}/preview`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </Link>
                      {est.status === 'draft' && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this estimate?')) {
                              deleteMutation.mutate(est.id)
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
