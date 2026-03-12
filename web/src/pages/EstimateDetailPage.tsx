import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchEstimate, fetchProjects, apiCreateEstimate, apiUpdateEstimate, apiUpdateEstimateStatus } from '../lib/api'
import { formatCurrency, estimateStatusColor } from '../lib/format'
import LineItemTable from '../components/estimates/LineItemTable'
import { ArrowLeft, Eye, Send, Check, XCircle, Save } from 'lucide-react'
import type { Estimate, EstimateLineItem } from '../types'

const DEFAULT_TERMS = `Payment: Net 30 from certified pay application
Retention: Per subcontract agreement (10%)
Price valid for 60 days from date of proposal
Work to be performed during normal business hours (7am-3:30pm M-F)
Any changes to scope require written change order approval
Southwest Stucco maintains all required insurance and licensing (CA License #702110)`

function nextEstimateNumber(): string {
  const year = new Date().getFullYear()
  return `EST-${year}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
}

export default function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existingEstimate } = useQuery({
    queryKey: ['estimate', id],
    queryFn: () => fetchEstimate(id!),
    enabled: !isNew && !!id,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const [title, setTitle] = useState('')
  const [estimateNumber, setEstimateNumber] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [scopeOfWork, setScopeOfWork] = useState('')
  const [exclusions, setExclusions] = useState('')
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([])
  const [markupPct, setMarkupPct] = useState(15)
  const [taxPct, setTaxPct] = useState(0)
  const [validDays, setValidDays] = useState(60)
  const [notes, setNotes] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (isNew && !initialized) {
      setEstimateNumber(nextEstimateNumber())
      setInitialized(true)
    } else if (existingEstimate && !initialized) {
      setTitle(existingEstimate.title)
      setEstimateNumber(existingEstimate.estimate_number)
      setClientName(existingEstimate.client_name)
      setClientAddress(existingEstimate.client_address)
      setProjectId(existingEstimate.project_id || '')
      setScopeOfWork(existingEstimate.scope_of_work)
      setExclusions(existingEstimate.exclusions)
      setTerms(existingEstimate.terms_and_conditions)
      setLineItems(existingEstimate.line_items)
      setMarkupPct(existingEstimate.markup_pct)
      setTaxPct(existingEstimate.tax_pct)
      setValidDays(existingEstimate.valid_days)
      setNotes(existingEstimate.notes || '')
      setInitialized(true)
    }
  }, [existingEstimate, isNew, initialized])

  const subtotal = useMemo(() => lineItems.reduce((s, li) => s + li.total, 0), [lineItems])
  const markupAmount = subtotal * (markupPct / 100)
  const taxAmount = (subtotal + markupAmount) * (taxPct / 100)
  const total = subtotal + markupAmount + taxAmount

  const createMutation = useMutation({
    mutationFn: (input: Omit<Estimate, 'id' | 'created_at'>) => apiCreateEstimate(input),
    onSuccess: (est) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      navigate(`/estimates/${est.id}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: Partial<Estimate>) => apiUpdateEstimate(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (status: Estimate['status']) => apiUpdateEstimateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
    },
  })

  const buildEstimateData = () => {
    const selectedProject = projects.find(p => p.id === projectId)
    return {
      project_id: projectId || null,
      project_name: selectedProject?.name,
      estimate_number: estimateNumber,
      title,
      client_name: clientName,
      client_address: clientAddress,
      scope_of_work: scopeOfWork,
      exclusions,
      terms_and_conditions: terms,
      line_items: lineItems,
      subtotal,
      markup_pct: markupPct,
      markup_amount: markupAmount,
      tax_pct: taxPct,
      tax_amount: taxAmount,
      total,
      status: (existingEstimate?.status || 'draft') as Estimate['status'],
      valid_days: validDays,
      sent_date: existingEstimate?.sent_date || null,
      accepted_date: existingEstimate?.accepted_date || null,
      expiry_date: existingEstimate?.expiry_date || null,
      notes: notes || null,
    }
  }

  const handleSave = () => {
    const data = buildEstimateData()
    if (isNew) {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const status = existingEstimate?.status || 'draft'

  return (
    <div>
      <div className="mb-6">
        <Link to="/estimates" className="flex items-center gap-1 text-sm text-gray-500 hover:text-sws-navy mb-3">
          <ArrowLeft size={16} /> Back to Estimates
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-sws-navy">
                {isNew ? 'New Estimate' : estimateNumber}
              </h1>
              {!isNew && (
                <span className={`badge ${estimateStatusColor(status)}`}>{status}</span>
              )}
            </div>
            {!isNew && title && (
              <p className="text-sm text-gray-500 mt-1">{title}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Link
                to={`/estimates/${id}/preview`}
                className="btn-primary flex items-center gap-1 text-sm"
              >
                <Eye size={14} /> Preview
              </Link>
            )}
            <button
              onClick={handleSave}
              className="btn-gold flex items-center gap-1 text-sm"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save size={14} /> {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estimate Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Estimate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input w-full"
                  placeholder="Estimate title"
                />
              </div>
              <div>
                <label className="label">Estimate Number</label>
                <input
                  type="text"
                  value={estimateNumber}
                  onChange={e => setEstimateNumber(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="input w-full"
                  placeholder="Client or GC name"
                />
              </div>
              <div>
                <label className="label">Client Address</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  className="input w-full"
                  placeholder="Client address"
                />
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Scope of Work</h2>
            <textarea
              value={scopeOfWork}
              onChange={e => setScopeOfWork(e.target.value)}
              className="input w-full h-40 resize-y"
              placeholder="Describe the scope of work..."
            />
          </div>

          {/* Line Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Line Items</h2>
            <LineItemTable items={lineItems} onChange={setLineItems} />
          </div>

          {/* Exclusions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Exclusions</h2>
            <textarea
              value={exclusions}
              onChange={e => setExclusions(e.target.value)}
              className="input w-full h-28 resize-y"
              placeholder="List exclusions..."
            />
          </div>

          {/* Terms */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Terms & Conditions</h2>
            <textarea
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="input w-full h-36 resize-y"
            />
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Pricing Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Markup</span>
                  <input
                    type="number"
                    value={markupPct}
                    onChange={e => setMarkupPct(parseFloat(e.target.value) || 0)}
                    className="input !py-0.5 !px-1 w-14 text-center text-xs"
                  />
                  <span className="text-gray-400">%</span>
                </div>
                <span className="font-semibold">{formatCurrency(markupAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Tax</span>
                  <input
                    type="number"
                    value={taxPct}
                    onChange={e => setTaxPct(parseFloat(e.target.value) || 0)}
                    className="input !py-0.5 !px-1 w-14 text-center text-xs"
                  />
                  <span className="text-gray-400">%</span>
                </div>
                <span className="font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold text-sws-navy">Total</span>
                <span className="text-lg font-bold text-sws-navy">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {!isNew && (
            <div className="card">
              <h2 className="text-lg font-semibold text-sws-navy mb-4">Status</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current</span>
                  <span className={`badge ${estimateStatusColor(status)}`}>{status}</span>
                </div>
                {existingEstimate?.sent_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sent</span>
                    <span>{existingEstimate.sent_date}</span>
                  </div>
                )}
                {existingEstimate?.accepted_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Accepted</span>
                    <span>{existingEstimate.accepted_date}</span>
                  </div>
                )}
                {existingEstimate?.expiry_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Valid Until</span>
                    <span>{existingEstimate.expiry_date}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {status === 'draft' && (
                  <button
                    onClick={() => statusMutation.mutate('sent')}
                    className="btn-primary w-full flex items-center justify-center gap-1 text-sm"
                  >
                    <Send size={14} /> Mark as Sent
                  </button>
                )}
                {status === 'sent' && (
                  <>
                    <button
                      onClick={() => statusMutation.mutate('accepted')}
                      className="btn-gold w-full flex items-center justify-center gap-1 text-sm"
                    >
                      <Check size={14} /> Mark as Accepted
                    </button>
                    <button
                      onClick={() => statusMutation.mutate('declined')}
                      className="w-full flex items-center justify-center gap-1 text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={14} /> Mark as Declined
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Linked Project */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Linked Project</h2>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="input w-full"
            >
              <option value="">Standalone (no project)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Validity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Proposal Validity</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={validDays}
                onChange={e => setValidDays(parseInt(e.target.value) || 30)}
                className="input w-20 text-center"
              />
              <span className="text-sm text-gray-500">days from sent date</span>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="text-lg font-semibold text-sws-navy mb-4">Internal Notes</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input w-full h-24 resize-y"
              placeholder="Internal notes (not shown on proposal)..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
