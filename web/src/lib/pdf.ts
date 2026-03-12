import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Estimate } from '../types'

const SWS_NAVY = [13, 27, 42] as const
const SWS_GOLD = [240, 165, 0] as const

function formatCurrencyPlain(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)
}

export function generateEstimatePdf(estimate: Estimate): void {
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ─── Company Header ────────────────────────────────────────────────
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text('Southwest Stucco, Inc.', margin, y)
  y += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('Licensed Plastering Contractor — CA License #702110', margin, y)
  y += 4
  doc.text('Los Angeles, California', margin, y)
  y += 4

  // Gold divider
  doc.setDrawColor(...SWS_GOLD)
  doc.setLineWidth(1.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ─── Proposal Title ────────────────────────────────────────────────
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text('PROPOSAL / ESTIMATE', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`Estimate #: ${estimate.estimate_number}`, margin, y)
  doc.text(`Date: ${estimate.created_at}`, margin + 80, y)
  y += 5
  if (estimate.expiry_date) {
    doc.text(`Valid Until: ${estimate.expiry_date}`, margin, y)
    y += 5
  }
  y += 5

  // ─── Client Block ──────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F')
  y += 5
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('PREPARED FOR', margin + 4, y)
  y += 4
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text(estimate.client_name, margin + 4, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(estimate.client_address, margin + 4, y)
  y += 12

  // ─── Scope of Work ─────────────────────────────────────────────────
  y = addSection(doc, 'SCOPE OF WORK', estimate.scope_of_work, y, margin, contentWidth)

  // ─── Line Items Table ──────────────────────────────────────────────
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text('PRICING SCHEDULE', margin, y)
  y += 2

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 4

  const tableBody: (string | number)[][] = estimate.line_items.map(item => [
    item.description,
    item.quantity.toLocaleString(),
    item.unit,
    formatCurrencyPlain(item.unit_cost),
    formatCurrencyPlain(item.total),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Qty', 'Unit', 'Rate', 'Amount']],
    body: tableBody,
    foot: [['', '', '', 'Subtotal', formatCurrencyPlain(estimate.subtotal)]],
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [SWS_NAVY[0], SWS_NAVY[1], SWS_NAVY[2]] as [number, number, number], textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' },
    footStyles: { fillColor: [245, 245, 245] as [number, number, number], textColor: [SWS_NAVY[0], SWS_NAVY[1], SWS_NAVY[2]] as [number, number, number], fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    theme: 'grid',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8

  // ─── Pricing Summary ───────────────────────────────────────────────
  const summaryX = pageWidth - margin - 70
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)

  doc.text('Subtotal', summaryX, y)
  doc.text(formatCurrencyPlain(estimate.subtotal), pageWidth - margin, y, { align: 'right' })
  y += 5

  if (estimate.markup_pct > 0) {
    doc.text(`Overhead & Profit (${estimate.markup_pct}%)`, summaryX, y)
    doc.text(formatCurrencyPlain(estimate.markup_amount), pageWidth - margin, y, { align: 'right' })
    y += 5
  }

  if (estimate.tax_pct > 0) {
    doc.text(`Tax (${estimate.tax_pct}%)`, summaryX, y)
    doc.text(formatCurrencyPlain(estimate.tax_amount), pageWidth - margin, y, { align: 'right' })
    y += 5
  }

  doc.setDrawColor(...SWS_NAVY)
  doc.setLineWidth(1)
  doc.line(summaryX, y, pageWidth - margin, y)
  y += 6
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text('TOTAL', summaryX, y)
  doc.text(formatCurrencyPlain(estimate.total), pageWidth - margin, y, { align: 'right' })
  y += 12

  // Check page space
  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage()
    y = margin
  }

  // ─── Exclusions ────────────────────────────────────────────────────
  if (estimate.exclusions) {
    y = addSection(doc, 'EXCLUSIONS', estimate.exclusions, y, margin, contentWidth)
  }

  // ─── Terms ─────────────────────────────────────────────────────────
  if (estimate.terms_and_conditions) {
    y = addSection(doc, 'TERMS & CONDITIONS', estimate.terms_and_conditions, y, margin, contentWidth)
  }

  // Check page space for signature
  if (y > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage()
    y = margin
  }

  // ─── Signature Block ───────────────────────────────────────────────
  y += 10
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)

  const halfWidth = contentWidth / 2 - 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...SWS_NAVY)
  doc.text('Submitted By:', margin, y)
  doc.text('Accepted By:', margin + halfWidth + 20, y)
  y += 15

  doc.line(margin, y, margin + halfWidth, y)
  doc.line(margin + halfWidth + 20, y, pageWidth - margin, y)
  y += 4

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('Southwest Stucco, Inc.', margin, y)
  doc.text(estimate.client_name, margin + halfWidth + 20, y)
  y += 6
  doc.text('Date: _____________', margin, y)
  doc.text('Date: _____________', margin + halfWidth + 20, y)

  // Save
  const filename = `${estimate.estimate_number}-Proposal.pdf`
  doc.save(filename)
}

function addSection(doc: jsPDF, title: string, content: string, y: number, margin: number, contentWidth: number): number {
  const pageHeight = doc.internal.pageSize.getHeight()

  if (y > pageHeight - 40) {
    doc.addPage()
    y = margin
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 27, 42)
  doc.text(title, margin, y)
  y += 2

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.5)
  doc.line(margin, y, margin + contentWidth, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  const lines = doc.splitTextToSize(content, contentWidth)
  for (const line of lines) {
    if (y > pageHeight - 20) {
      doc.addPage()
      y = margin
    }
    doc.text(line, margin, y)
    y += 4
  }
  y += 8

  return y
}
