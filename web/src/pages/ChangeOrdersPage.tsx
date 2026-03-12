import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchChangeOrders, apiCreateChangeOrder, apiSubmitChangeOrder, apiApproveChangeOrder } from '../lib/api'
import { formatCurrency, formatDate, statusColor } from '../lib/format'
import { ArrowLeft, GitPullRequest, FileSignature, Send, CheckCircle2 } from 'lucide-react'
import Modal from '../components/ui/Modal'

export default function ChangeOrdersPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data } = useQuery({
    queryKey: ['change-orders', id],
    queryFn: () => fetchChangeOrders(id!),
    enabled: !!id,
  })

  const cos = data || []
  const totalApproved = cos.filter(co => co.status === 'approved').reduce((sum, co) => sum + co.amount, 0)

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['change-orders', id] })
    queryClient.invalidateQueries({ queryKey: ['project-dashboard', id] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: (input: { title: string; amount: number; description?: string }) =>
      apiCreateChangeOrder(id!, input),
    onSuccess: () => { invalidateAll(); setShowNew(false) },
  })

  const submitMutation = useMutation({
    mutationFn: apiSubmitChangeOrder,
    onSuccess: invalidateAll,
  })

  const approveMutation = useMutation({
    mutationFn: apiApproveChangeOrder,
    onSuccess: invalidateAll,
  })

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Change Orders</h1>
            <p className="text-sm text-gray-500">Track and manage project scope changes</p>
          </div>
          <button className="btn-gold flex items-center gap-2" onClick={() => setShowNew(true)}>
            <GitPullRequest size={16} /> New Change Order
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Total COs</p>
          <p className="text-2xl font-bold text-sws-navy mt-1">{cos.length}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Approved Amount</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalApproved)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Original + COs</p>
          <p className="text-2xl font-bold text-sws-gold mt-1">{formatCurrency(865000 + totalApproved)}</p>
        </div>
      </div>

      {/* CO List */}
      <div className="card overflow-hidden !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sws-navy text-white text-left text-xs uppercase tracking-wider">
              <th className="px-4 py-3">CO #</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Approved By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cos.map((co) => (
              <tr key={co.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sws-gold/10 text-sws-gold font-bold text-sm">
                    {co.co_number}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium max-w-xs">{co.title}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(co.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(co.submitted_date)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(co.approved_date)}</td>
                <td className="px-4 py-3 text-gray-500">{co.approved_by || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusColor(co.status)}`}>{co.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {co.status === 'draft' && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                        title="Submit to GC"
                        onClick={() => submitMutation.mutate(co.id)}
                      >
                        <Send size={14} />
                      </button>
                    )}
                    {co.status === 'submitted' && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                        title="Mark Approved"
                        onClick={() => approveMutation.mutate(co.id)}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    {co.status === 'approved' && (
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="DocuSign">
                        <FileSignature size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-right text-sws-gold">{formatCurrency(totalApproved)}</td>
              <td colSpan={5}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* New CO Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Change Order">
        <NewCOForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  )
}

function NewCOForm({ onSubmit, loading }: {
  onSubmit: (data: { title: string; amount: number; description?: string }) => void
  loading: boolean
}) {
  const [form, setForm] = useState({ title: '', amount: '', description: '' })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit({ title: form.title, amount: parseFloat(form.amount) || 0, description: form.description || undefined })
    }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input type="text" required className="input" placeholder="e.g. Additional waterproofing at balconies"
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <input type="number" required step="0.01" min="0" className="input" placeholder="24500.00"
          value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea className="input" rows={3} placeholder="Scope details..."
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Change Order'}
        </button>
      </div>
    </form>
  )
}
