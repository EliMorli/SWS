import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { fetchEstimate, apiUpdateEstimateStatus } from '../lib/api'
import { formatCurrency, formatDate, categoryLabel, estimateStatusColor } from '../lib/format'
import { ArrowLeft, Send, Download, Check } from 'lucide-react'
import type { EstimateLineItem } from '../types'

function groupByCategory(items: EstimateLineItem[]): Record<string, EstimateLineItem[]> {
  const groups: Record<string, EstimateLineItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
}

export default function EstimatePreviewPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: estimate } = useQuery({
    queryKey: ['estimate', id],
    queryFn: () => fetchEstimate(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: 'sent' | 'accepted') => apiUpdateEstimateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
    },
  })

  if (!estimate) return <div className="text-center py-12 text-gray-400">Loading...</div>

  const grouped = groupByCategory(estimate.line_items)

  const handleDownloadPdf = async () => {
    try {
      const { generateEstimatePdf } = await import('../lib/pdf')
      generateEstimatePdf(estimate)
    } catch {
      alert('PDF generation requires jsPDF. Install with: npm install jspdf jspdf-autotable')
    }
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="sticky top-14 z-20 bg-white border-b border-gray-200 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 mb-6 flex items-center justify-between">
        <Link to={`/estimates/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy">
          <ArrowLeft size={16} /> Back to Editor
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <Download size={14} /> Download PDF
          </button>
          {estimate.status === 'draft' && (
            <button
              onClick={() => statusMutation.mutate('sent')}
              className="btn-gold flex items-center gap-1 text-sm"
            >
              <Send size={14} /> Mark as Sent
            </button>
          )}
          {estimate.status === 'sent' && (
            <button
              onClick={() => statusMutation.mutate('accepted')}
              className="btn-gold flex items-center gap-1 text-sm"
            >
              <Check size={14} /> Mark as Accepted
            </button>
          )}
          <span className={`badge ${estimateStatusColor(estimate.status)}`}>{estimate.status}</span>
        </div>
      </div>

      {/* Proposal Document */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 lg:p-12">
        {/* Company Header */}
        <div className="border-b-4 border-sws-gold pb-6 mb-8">
          <h1 className="text-3xl font-black text-sws-navy tracking-wide">Southwest Stucco, Inc.</h1>
          <div className="text-sm text-gray-500 mt-1 space-y-0.5">
            <p>Licensed Plastering Contractor — CA License #702110</p>
            <p>Los Angeles, California</p>
          </div>
        </div>

        {/* Proposal Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-sws-navy">PROPOSAL / ESTIMATE</h2>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-400 uppercase text-xs tracking-wider">Estimate Number</p>
              <p className="font-semibold">{estimate.estimate_number}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase text-xs tracking-wider">Date</p>
              <p className="font-semibold">{formatDate(estimate.created_at)}</p>
            </div>
            {estimate.expiry_date && (
              <div>
                <p className="text-gray-400 uppercase text-xs tracking-wider">Valid Until</p>
                <p className="font-semibold">{formatDate(estimate.expiry_date)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Block */}
        <div className="mb-8 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Prepared For</p>
          <p className="font-semibold text-sws-navy">{estimate.client_name}</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{estimate.client_address}</p>
        </div>

        {/* Scope of Work */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-sws-navy border-b border-gray-200 pb-2 mb-3">
            SCOPE OF WORK
          </h3>
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {estimate.scope_of_work}
          </div>
        </div>

        {/* Line Items by Category */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-sws-navy border-b border-gray-200 pb-2 mb-3">
            PRICING SCHEDULE
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2 text-right">Rate</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, items]) => (
                <tbody key={cat}>
                  <tr>
                    <td colSpan={5} className="pt-4 pb-1 font-bold text-sws-navy text-xs uppercase tracking-wider">
                      {categoryLabel(cat)}
                    </td>
                  </tr>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2 pl-4">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity.toLocaleString()}</td>
                      <td className="py-2 pl-2">{item.unit}</td>
                      <td className="py-2 text-right">{formatCurrency(item.unit_cost)}</td>
                      <td className="py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="mb-8 flex justify-end">
          <div className="w-72">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatCurrency(estimate.subtotal)}</span>
              </div>
              {estimate.markup_pct > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Overhead & Profit ({estimate.markup_pct}%)</span>
                  <span className="font-semibold">{formatCurrency(estimate.markup_amount)}</span>
                </div>
              )}
              {estimate.tax_pct > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({estimate.tax_pct}%)</span>
                  <span className="font-semibold">{formatCurrency(estimate.tax_amount)}</span>
                </div>
              )}
              <div className="border-t-2 border-sws-navy pt-2 flex justify-between">
                <span className="text-lg font-bold text-sws-navy">TOTAL</span>
                <span className="text-lg font-bold text-sws-navy">{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusions */}
        {estimate.exclusions && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-sws-navy border-b border-gray-200 pb-2 mb-3">
              EXCLUSIONS
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {estimate.exclusions}
            </div>
          </div>
        )}

        {/* Terms */}
        {estimate.terms_and_conditions && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-sws-navy border-b border-gray-200 pb-2 mb-3">
              TERMS & CONDITIONS
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {estimate.terms_and_conditions}
            </div>
          </div>
        )}

        {/* Signature Block */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-semibold text-sws-navy mb-8">Submitted By:</p>
              <div className="border-b border-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Southwest Stucco, Inc.</p>
              <p className="text-xs text-gray-400 mt-4">Date: _____________</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-sws-navy mb-8">Accepted By:</p>
              <div className="border-b border-gray-300 mb-1" />
              <p className="text-xs text-gray-400">{estimate.client_name}</p>
              <p className="text-xs text-gray-400 mt-4">Date: _____________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
