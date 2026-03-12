export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'badge-green',
    complete: 'badge-blue',
    on_hold: 'badge-yellow',
    warranty: 'badge-gray',
    draft: 'badge-gray',
    submitted: 'badge-yellow',
    approved: 'badge-green',
    paid: 'badge-green',
    partial: 'badge-yellow',
    disputed: 'badge-red',
    rejected: 'badge-red',
    pending: 'badge-yellow',
    sent: 'badge-blue',
    signed: 'badge-green',
    received: 'badge-green',
    in_progress: 'badge-blue',
    expiring_soon: 'badge-yellow',
    expired: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export function releaseTypeLabel(type: string): string {
  return type === 'conditional_waiver' ? 'Conditional' : 'Unconditional'
}

export function policyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    general_liability: 'General Liability',
    workers_comp: 'Workers\' Comp',
    auto: 'Auto/Commercial',
    ocip: 'OCIP/CIP',
  }
  return map[type] || type
}

export function estimateStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'badge-gray',
    sent: 'badge-blue',
    accepted: 'badge-green',
    declined: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    material: 'Material',
    labor: 'Labor',
    equipment: 'Equipment',
    scaffolding: 'Scaffolding',
    subcontractor: 'Subcontractor',
    permits: 'Permits',
    overhead: 'Overhead',
    other: 'Other',
  }
  return map[category] || category
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
