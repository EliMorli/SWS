import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchLienReleases } from '../lib/api'
import { formatCurrency, formatDate, statusColor, releaseTypeLabel } from '../lib/format'
import { ArrowLeft, ScrollText, FileSignature, Download, AlertTriangle } from 'lucide-react'

const MOCK_RELEASES = (() => {
  const releases = []
  // 9 paid invoices = 18 SWS releases (conditional + unconditional each)
  for (let i = 1; i <= 9; i++) {
    releases.push({
      id: `cond-${i}`,
      project_id: 'h',
      invoice_number: `745${i + 1}`,
      company_name: 'Southwest Stucco, Inc.',
      release_type: 'conditional_waiver',
      direction: 'outgoing',
      amount: [137025, 116775, 129600, 103500, 118800, 97200, 113400, 85500, 114094.98][i - 1],
      through_date: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 4) % 12 + 1).padStart(2, '0')}-28`,
      status: 'signed',
      signed_date: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 4) % 12 + 1).padStart(2, '0')}-15`,
      notes: null,
      created_at: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 4) % 12 + 1).padStart(2, '0')}-15`,
    })
    releases.push({
      id: `uncond-${i}`,
      project_id: 'h',
      invoice_number: `745${i + 1}`,
      company_name: 'Southwest Stucco, Inc.',
      release_type: 'unconditional_waiver',
      direction: 'outgoing',
      amount: [137025, 116775, 129600, 103500, 118800, 97200, 113400, 85500, 114094.98][i - 1],
      through_date: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 5) % 12 + 1).padStart(2, '0')}-20`,
      status: 'signed',
      signed_date: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 5) % 12 + 1).padStart(2, '0')}-23`,
      notes: null,
      created_at: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 5) % 12 + 1).padStart(2, '0')}-20`,
    })
  }
  // 6 L&W Supply incoming releases
  for (let i = 1; i <= 6; i++) {
    releases.push({
      id: `lw-${i}`,
      project_id: 'h',
      invoice_number: `745${i + 1}`,
      company_name: 'L&W Supply',
      release_type: 'conditional_waiver',
      direction: 'incoming',
      amount: [47959, 40871, 45360, 36225, 41580, 34020][i - 1],
      through_date: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 4) % 12 + 1).padStart(2, '0')}-28`,
      status: 'received',
      signed_date: null,
      notes: null,
      created_at: `202${i <= 4 ? '2' : '3'}-${String((i * 2 + 4) % 12 + 1).padStart(2, '0')}-15`,
    })
  }
  return releases
})()

export default function LienReleasesPage() {
  const { id } = useParams<{ id: string }>()

  const { data } = useQuery({
    queryKey: ['lien-releases', id],
    queryFn: () => fetchLienReleases(id!),
    enabled: !!id,
  })

  const releases = data || MOCK_RELEASES
  const outgoing = releases.filter(r => r.direction === 'outgoing')
  const incoming = releases.filter(r => r.direction === 'incoming')

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Lien Release Tracking</h1>
            <p className="text-sm text-gray-500">495 Hartford Apartments - California Compliance</p>
          </div>
          <button className="btn-gold flex items-center gap-2">
            <ScrollText size={16} /> Generate Release
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Total Releases</p>
          <p className="text-2xl font-bold text-sws-navy mt-1">{releases.length}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">SWS Outgoing</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{outgoing.length}</p>
          <p className="text-xs text-gray-400">{outgoing.filter(r => r.status === 'signed').length} signed</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Incoming (Subs/Vendors)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{incoming.length}</p>
          <p className="text-xs text-gray-400">{incoming.filter(r => r.status === 'received').length} received</p>
        </div>
        <div className="card !p-4 border-l-4 border-amber-400">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs text-gray-400 uppercase">CA Compliance</p>
          </div>
          <p className="text-lg font-bold text-green-600 mt-1">Current</p>
          <p className="text-xs text-gray-400">90-day mechanics lien deadline tracked</p>
        </div>
      </div>

      {/* SWS Outgoing Releases */}
      <div className="card overflow-hidden !p-0 mb-6">
        <div className="bg-sws-navy px-4 py-3">
          <h2 className="text-white font-semibold">SWS Releases to GC (Outgoing)</h2>
          <p className="text-gray-400 text-xs">Conditional sent with pay app / Unconditional after payment clears</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50">
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Through Date</th>
                <th className="px-4 py-2">Signed Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outgoing.map((lr) => (
                <tr key={lr.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2 font-medium">#{lr.invoice_number}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${lr.release_type === 'conditional_waiver' ? 'badge-yellow' : 'badge-green'}`}>
                      {releaseTypeLabel(lr.release_type)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(lr.amount)}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(lr.through_date)}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(lr.signed_date)}</td>
                  <td className="px-4 py-2"><span className={`badge ${statusColor(lr.status)}`}>{lr.status}</span></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600" title="DocuSign"><FileSignature size={14} /></button>
                      <button className="p-1 text-gray-400 hover:text-sws-navy" title="Download PDF"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Releases */}
      <div className="card overflow-hidden !p-0">
        <div className="bg-sws-blue px-4 py-3">
          <h2 className="text-white font-semibold">Sub/Vendor Releases to SWS (Incoming)</h2>
          <p className="text-gray-300 text-xs">Releases required before payment to subs/vendors</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50">
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Through Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {incoming.map((lr) => (
                <tr key={lr.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2 font-medium">{lr.company_name}</td>
                  <td className="px-4 py-2">#{lr.invoice_number}</td>
                  <td className="px-4 py-2">
                    <span className="badge badge-yellow">{releaseTypeLabel(lr.release_type)}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(lr.amount)}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(lr.through_date)}</td>
                  <td className="px-4 py-2"><span className={`badge ${statusColor(lr.status)}`}>{lr.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
