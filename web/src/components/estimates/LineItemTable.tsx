import { Plus, Trash2 } from 'lucide-react'
import type { EstimateLineItem, EstimateLineItemCategory } from '../../types'
import { formatCurrency, categoryLabel } from '../../lib/format'

const CATEGORIES: EstimateLineItemCategory[] = [
  'material', 'labor', 'equipment', 'scaffolding',
  'subcontractor', 'permits', 'overhead', 'other',
]

const UNITS = ['sq yd', 'ea', 'lf', 'hr', 'ls', 'mo', 'sf', 'cf']

const CATEGORY_BORDER: Record<string, string> = {
  material: 'border-l-blue-500',
  labor: 'border-l-amber-500',
  equipment: 'border-l-green-500',
  scaffolding: 'border-l-purple-500',
  subcontractor: 'border-l-red-500',
  permits: 'border-l-gray-500',
  overhead: 'border-l-gray-400',
  other: 'border-l-gray-300',
}

interface LineItemTableProps {
  items: EstimateLineItem[]
  onChange: (items: EstimateLineItem[]) => void
  readOnly?: boolean
}

function genItemId() {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function LineItemTable({ items, onChange, readOnly }: LineItemTableProps) {
  const updateItem = (index: number, field: keyof EstimateLineItem, value: string | number) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }
    if (field === 'quantity' || field === 'unit_cost') {
      item.total = Number(item.quantity) * Number(item.unit_cost)
    }
    updated[index] = item
    onChange(updated)
  }

  const addItem = () => {
    onChange([
      ...items,
      { id: genItemId(), description: '', category: 'material', quantity: 0, unit: 'sq yd', unit_cost: 0, total: 0 },
    ])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((s, li) => s + li.total, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase border-b">
            <th className="pb-2 pl-3 w-28">Category</th>
            <th className="pb-2">Description</th>
            <th className="pb-2 w-20 text-right">Qty</th>
            <th className="pb-2 w-20">Unit</th>
            <th className="pb-2 w-28 text-right">Unit Cost</th>
            <th className="pb-2 w-28 text-right">Total</th>
            {!readOnly && <th className="pb-2 w-10" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className={`border-b border-gray-50 border-l-4 ${CATEGORY_BORDER[item.category] || 'border-l-gray-300'}`}
            >
              <td className="py-2 pl-2">
                {readOnly ? (
                  <span className="text-xs font-medium">{categoryLabel(item.category)}</span>
                ) : (
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(i, 'category', e.target.value)}
                    className="input !py-1 !px-1 text-xs w-full"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{categoryLabel(c)}</option>
                    ))}
                  </select>
                )}
              </td>
              <td className="py-2 px-1">
                {readOnly ? (
                  <span>{item.description}</span>
                ) : (
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    className="input !py-1 w-full"
                    placeholder="Description"
                  />
                )}
              </td>
              <td className="py-2 px-1 text-right">
                {readOnly ? (
                  <span>{item.quantity.toLocaleString()}</span>
                ) : (
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input !py-1 w-full text-right"
                  />
                )}
              </td>
              <td className="py-2 px-1">
                {readOnly ? (
                  <span>{item.unit}</span>
                ) : (
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(i, 'unit', e.target.value)}
                    className="input !py-1 !px-1 text-xs w-full"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                )}
              </td>
              <td className="py-2 px-1 text-right">
                {readOnly ? (
                  <span>{formatCurrency(item.unit_cost)}</span>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_cost || ''}
                    onChange={(e) => updateItem(i, 'unit_cost', parseFloat(e.target.value) || 0)}
                    className="input !py-1 w-full text-right"
                  />
                )}
              </td>
              <td className="py-2 px-1 text-right font-semibold">
                {formatCurrency(item.total)}
              </td>
              {!readOnly && (
                <td className="py-2 px-1">
                  <button
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td colSpan={readOnly ? 5 : 5} className="py-3 text-right font-semibold text-gray-600">
              Subtotal
            </td>
            <td className="py-3 px-1 text-right font-bold text-sws-navy text-base">
              {formatCurrency(subtotal)}
            </td>
            {!readOnly && <td />}
          </tr>
        </tfoot>
      </table>
      {!readOnly && (
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-sm text-sws-gold hover:text-sws-navy mt-2 transition-colors"
        >
          <Plus size={14} /> Add Line Item
        </button>
      )}
    </div>
  )
}
