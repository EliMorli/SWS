import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchChangeOrders } from '../lib/api'
import { formatCurrency, formatDate, statusColor } from '../lib/format'
import { ArrowLeft, GitPullRequest, FileSignature } from 'lucide-react'

const MOCK_COS = [
  { id: '1', project_id: 'h', co_number: 1, title: 'Additional waterproofing at balconies', description: null, scope_of_work: null, amount: 24500, amount_cents: 2450000, status: 'approved', submitted_date: '2022-08-01', approved_date: '2022-08-15', approved_by: 'Fassberg Construction', notes: null, created_at: '2022-07-28' },
  { id: '2', project_id: 'h', co_number: 2, title: 'Extra lath at modified wall sections', description: null, scope_of_work: null, amount: 18200, amount_cents: 1820000, status: 'approved', submitted_date: '2022-09-08', approved_date: '2022-09-22', approved_by: 'Fassberg Construction', notes: null, created_at: '2022-09-05' },
  { id: '3', project_id: 'h', co_number: 3, title: 'Added ceiling scope - Building B corridors', description: null, scope_of_work: null, amount: 42800, amount_cents: 4280000, status: 'approved', submitted_date: '2022-10-27', approved_date: '2022-11-10', approved_by: 'Fassberg Construction', notes: null, created_at: '2022-10-24' },
  { id: '4', project_id: 'h', co_number: 4, title: 'Revised scratch coat specification', description: null, scope_of_work: null, amount: 15600, amount_cents: 1560000, status: 'approved', submitted_date: '2023-01-04', approved_date: '2023-01-18', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-01-01' },
  { id: '5', project_id: 'h', co_number: 5, title: 'Extended scaffold rental - weather delays', description: null, scope_of_work: null, amount: 31400, amount_cents: 3140000, status: 'approved', submitted_date: '2023-02-19', approved_date: '2023-03-05', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-02-16' },
  { id: '6', project_id: 'h', co_number: 6, title: 'Additional masking at storefront glazing', description: null, scope_of_work: null, amount: 12300, amount_cents: 1230000, status: 'approved', submitted_date: '2023-04-28', approved_date: '2023-05-12', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-04-25' },
  { id: '7', project_id: 'h', co_number: 7, title: 'XJ-15 additive scope increase', description: null, scope_of_work: null, amount: 19800, amount_cents: 1980000, status: 'approved', submitted_date: '2023-07-06', approved_date: '2023-07-20', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-07-03' },
  { id: '8', project_id: 'h', co_number: 8, title: 'Drip edge at revised parapet details', description: null, scope_of_work: null, amount: 8900, amount_cents: 890000, status: 'approved', submitted_date: '2023-08-25', approved_date: '2023-09-08', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-08-22' },
  { id: '9', project_id: 'h', co_number: 9, title: 'Color coat revision - Sherwin-Williams spec change', description: null, scope_of_work: null, amount: 28500, amount_cents: 2850000, status: 'approved', submitted_date: '2023-11-01', approved_date: '2023-11-15', approved_by: 'Fassberg Construction', notes: null, created_at: '2023-10-29' },
  { id: '10', project_id: 'h', co_number: 10, title: 'Additional brown coat at mechanical screen walls', description: null, scope_of_work: null, amount: 22100, amount_cents: 2210000, status: 'approved', submitted_date: '2024-01-18', approved_date: '2024-02-01', approved_by: 'Fassberg Construction', notes: null, created_at: '2024-01-15' },
  { id: '11', project_id: 'h', co_number: 11, title: 'Elastomeric crack system upgrade', description: null, scope_of_work: null, amount: 26400, amount_cents: 2640000, status: 'approved', submitted_date: '2024-04-04', approved_date: '2024-04-18', approved_by: 'Fassberg Construction', notes: null, created_at: '2024-04-01' },
  { id: '12', project_id: 'h', co_number: 12, title: 'Final scope additions - rooftop amenity walls', description: null, scope_of_work: null, amount: 17505.20, amount_cents: 1750520, status: 'approved', submitted_date: '2024-06-26', approved_date: '2024-07-10', approved_by: 'Fassberg Construction', notes: null, created_at: '2024-06-23' },
]

export default function ChangeOrdersPage() {
  const { id } = useParams<{ id: string }>()

  const { data } = useQuery({
    queryKey: ['change-orders', id],
    queryFn: () => fetchChangeOrders(id!),
    enabled: !!id,
  })

  const cos = data || MOCK_COS
  const totalApproved = cos.filter(co => co.status === 'approved').reduce((sum, co) => sum + co.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Project
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sws-navy">Change Orders</h1>
            <p className="text-sm text-gray-500">495 Hartford Apartments</p>
          </div>
          <button className="btn-gold flex items-center gap-2">
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
              <th className="px-4 py-3">DocuSign</th>
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
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="DocuSign">
                    <FileSignature size={14} />
                  </button>
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
    </div>
  )
}
