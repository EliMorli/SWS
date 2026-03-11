import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchInvoices, apiCreateInvoice, apiSubmitInvoice, apiRecordPayment } from '../lib/api'
import { formatCurrency, formatDate, statusColor } from '../lib/format'
import { ArrowLeft, FileText, Download, Send, DollarSign } from 'lucide-react'
import Modal from '../components/ui/Modal'

export default function BillingPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoices(id!),
    enabled: !!id,
  })

  const invoices = data || []

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    queryClient.invalidateQueries({ queryKey: ['project-dashboard', id] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: (input: { completed_this_period: number; invoice_date: string }) =>
      apiCreateInvoice(id!, input),
    onSuccess: () => { invalidateAll(); setShowNewInvoice(false) },
  })

  const submitMutation = useMutation({
    mutationFn: apiSubmitInvoice,
    onSuccess: invalidateAll,
  })

  const paymentMutation = useMutation({
    mutationFn: ({ invoiceId, ...input }: { invoiceId: string; amount: number; check_number: string }) =>
      apiRecordPayment(invoiceId, input),
    onSuccess: () => { invalidateAll(); setPaymentInvoice(null) },
  })

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.completed_this_period, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0)
  const totalRetention = invoices.length > 0 ? invoices[invoices.length - 1].retention_held : 0

  const payInv = paymentInvoice ? invoices.find(i => i.id === paymentInvoice) : null

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Billing & Pay Applications</h1>
            <p className="text-sm text-gray-500">AIA G702/G703</p>
          </div>
          <button className="btn-gold flex items-center gap-2" onClick={() => setShowNewInvoice(true)}>
            <FileText size={16} /> New Pay Application
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Total Billed</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalBilled)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Total Paid</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Retention Held</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{formatCurrency(totalRetention)}</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-gray-400 uppercase">Pay Apps</p>
          <p className="text-xl font-bold text-sws-navy mt-1">{invoices.length}</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sws-navy text-white text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Pay App #</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">This Period</th>
                <th className="px-4 py-3 text-right">Total Completed</th>
                <th className="px-4 py-3 text-right">Retention</th>
                <th className="px-4 py-3 text-right">Payment Due</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...invoices].reverse().map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-sws-navy">#{inv.pay_app_number}</td>
                  <td className="px-4 py-3">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.invoice_date)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(inv.completed_this_period)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total_completed)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(inv.retention_held)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.current_payment_due)}</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {inv.amount_paid > 0 ? formatCurrency(inv.amount_paid) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor(inv.status)}`}>{inv.status}</span>
                    {inv.overdue && <span className="badge badge-red ml-1">overdue</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-sws-navy rounded" title="Download PDF">
                        <Download size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                          title="Submit"
                          onClick={() => submitMutation.mutate(inv.id)}
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {(inv.status === 'submitted' || inv.status === 'approved') && inv.amount_paid === 0 && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                          title="Record Payment"
                          onClick={() => setPaymentInvoice(inv.id)}
                        >
                          <DollarSign size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Pay App Modal */}
      <Modal open={showNewInvoice} onClose={() => setShowNewInvoice(false)} title="New Pay Application">
        <NewInvoiceForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={!!paymentInvoice} onClose={() => setPaymentInvoice(null)} title="Record Payment">
        {payInv && (
          <RecordPaymentForm
            invoice={payInv}
            onSubmit={(data) => paymentMutation.mutate({ invoiceId: payInv.id, ...data })}
            loading={paymentMutation.isPending}
          />
        )}
      </Modal>
    </div>
  )
}

function NewInvoiceForm({ onSubmit, loading }: {
  onSubmit: (data: { completed_this_period: number; invoice_date: string }) => void
  loading: boolean
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ completed_this_period: parseFloat(amount) || 0, invoice_date: date }) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Completed This Period ($)</label>
        <input type="number" required step="0.01" min="0" className="input" placeholder="50000.00"
          value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
        <input type="date" required className="input" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Pay App'}
        </button>
      </div>
    </form>
  )
}

function RecordPaymentForm({ invoice, onSubmit, loading }: {
  invoice: { current_payment_due: number; invoice_number: string }
  onSubmit: (data: { amount: number; check_number: string }) => void
  loading: boolean
}) {
  const [amount, setAmount] = useState(String(invoice.current_payment_due))
  const [checkNumber, setCheckNumber] = useState('')

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ amount: parseFloat(amount) || 0, check_number: checkNumber }) }} className="space-y-4">
      <p className="text-sm text-gray-500">Recording payment for Invoice #{invoice.invoice_number}</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount ($)</label>
        <input type="number" required step="0.01" min="0" className="input"
          value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Check / Reference Number</label>
        <input type="text" required className="input" placeholder="e.g. 10042"
          value={checkNumber} onChange={e => setCheckNumber(e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}
