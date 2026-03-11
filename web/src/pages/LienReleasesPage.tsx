import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchLienReleases, apiCreateLienRelease } from '../lib/api'
import { formatCurrency, formatDate, statusColor, releaseTypeLabel } from '../lib/format'
import { ArrowLeft, ScrollText, FileSignature, Download, AlertTriangle } from 'lucide-react'
import Modal from '../components/ui/Modal'

export default function LienReleasesPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data } = useQuery({
    queryKey: ['lien-releases', id],
    queryFn: () => fetchLienReleases(id!),
    enabled: !!id,
  })

  const releases = data || []
  const outgoing = releases.filter(r => r.direction === 'outgoing')
  const incoming = releases.filter(r => r.direction === 'incoming')

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof apiCreateLienRelease>[1]) =>
      apiCreateLienRelease(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lien-releases', id] })
      setShowNew(false)
    },
  })

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Lien Release Tracking</h1>
            <p className="text-sm text-gray-500">California Compliance</p>
          </div>
          <button className="btn-gold flex items-center gap-2" onClick={() => setShowNew(true)}>
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

      {/* New Release Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Generate Lien Release">
        <NewReleaseForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  )
}

function NewReleaseForm({ onSubmit, loading }: {
  onSubmit: (data: { release_type: string; direction: string; amount: number; invoice_number?: string; company_name?: string; through_date: string }) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    release_type: 'conditional_waiver',
    direction: 'outgoing',
    amount: '',
    invoice_number: '',
    company_name: '',
    through_date: new Date().toISOString().split('T')[0],
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit({
        release_type: form.release_type,
        direction: form.direction,
        amount: parseFloat(form.amount) || 0,
        invoice_number: form.invoice_number || undefined,
        company_name: form.direction === 'incoming' ? form.company_name : undefined,
        through_date: form.through_date,
      })
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select className="input" value={form.release_type}
            onChange={e => setForm(f => ({ ...f, release_type: e.target.value }))}>
            <option value="conditional_waiver">Conditional</option>
            <option value="unconditional_waiver">Unconditional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
          <select className="input" value={form.direction}
            onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}>
            <option value="outgoing">Outgoing (SWS to GC)</option>
            <option value="incoming">Incoming (Sub to SWS)</option>
          </select>
        </div>
      </div>
      {form.direction === 'incoming' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input type="text" required className="input" placeholder="e.g. L&W Supply"
            value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <input type="number" required step="0.01" min="0" className="input" placeholder="85000.00"
          value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice # (optional)</label>
          <input type="text" className="input" placeholder="7462"
            value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Through Date</label>
          <input type="date" required className="input"
            value={form.through_date} onChange={e => setForm(f => ({ ...f, through_date: e.target.value }))} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Generate Release'}
        </button>
      </div>
    </form>
  )
}
