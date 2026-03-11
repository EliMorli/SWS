import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchInvoices } from '../lib/api'
import { formatCurrency, formatDate, statusColor } from '../lib/format'
import { ArrowLeft, FileText, Download, Send } from 'lucide-react'

const MOCK_INVOICES = Array.from({ length: 10 }, (_, i) => {
  const payAppData = [
    { inv: '7452', date: '2022-06-15', thisPeriod: 152250.00, total: 152250.00, paid: 137025.00, status: 'paid' },
    { inv: '7453', date: '2022-08-15', thisPeriod: 129750.00, total: 282000.00, paid: 116775.00, status: 'paid' },
    { inv: '7454', date: '2022-10-15', thisPeriod: 144000.00, total: 426000.00, paid: 129600.00, status: 'paid' },
    { inv: '7455', date: '2023-01-15', thisPeriod: 115000.00, total: 541000.00, paid: 103500.00, status: 'paid' },
    { inv: '7456', date: '2023-04-15', thisPeriod: 132000.00, total: 673000.00, paid: 118800.00, status: 'paid' },
    { inv: '7457', date: '2023-07-15', thisPeriod: 108000.00, total: 781000.00, paid: 97200.00, status: 'paid' },
    { inv: '7458', date: '2023-10-15', thisPeriod: 126000.00, total: 907000.00, paid: 113400.00, status: 'paid' },
    { inv: '7459', date: '2024-01-15', thisPeriod: 95000.00, total: 1002000.00, paid: 85500.00, status: 'paid' },
    { inv: '7460', date: '2024-05-15', thisPeriod: 126772.20, total: 1128772.20, paid: 114094.98, status: 'paid' },
    { inv: '7461', date: '2024-09-15', thisPeriod: 29193.00, total: 1157965.20, paid: 0, status: 'submitted' },
  ][i]

  return {
    id: String(i + 1),
    project_id: 'hartford-001',
    invoice_number: payAppData.inv,
    pay_app_number: i + 1,
    period_from: payAppData.date,
    period_to: payAppData.date,
    invoice_date: payAppData.date,
    original_contract: 865000.00,
    change_order_total: 268005.20,
    contract_total: 1133005.20,
    completed_previous: i > 0 ? [0, 152250, 282000, 426000, 541000, 673000, 781000, 907000, 1002000, 1128772.20][i] : 0,
    completed_this_period: payAppData.thisPeriod,
    materials_stored: 0,
    total_completed: payAppData.total,
    retention_held: payAppData.total * 0.10,
    total_earned_less_retention: payAppData.total * 0.90,
    less_previous_certificates: 0,
    current_payment_due: payAppData.thisPeriod * 0.90,
    amount_paid: payAppData.paid,
    paid_date: payAppData.status === 'paid' ? payAppData.date : null,
    check_number: payAppData.status === 'paid' ? `${10000 + i + 1}` : null,
    status: payAppData.status,
    days_outstanding: payAppData.status === 'submitted' ? 178 : 0,
    overdue: payAppData.status === 'submitted',
    submitted_at: payAppData.date,
    notes: null,
  }
})

export default function BillingPage() {
  const { id } = useParams<{ id: string }>()

  const { data } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoices(id!),
    enabled: !!id,
  })

  const invoices = data || MOCK_INVOICES

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.completed_this_period, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0)
  const totalRetention = invoices.length > 0 ? invoices[invoices.length - 1].retention_held : 0

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Billing & Pay Applications</h1>
            <p className="text-sm text-gray-500">495 Hartford Apartments - AIA G702/G703</p>
          </div>
          <button className="btn-gold flex items-center gap-2">
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
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Submit">
                          <Send size={14} />
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
    </div>
  )
}
