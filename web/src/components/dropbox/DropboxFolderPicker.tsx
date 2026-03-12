import { useState } from 'react'
import { FolderOpen, Check, X } from 'lucide-react'

interface DropboxFolderPickerProps {
  currentPath?: string
  onSelect: (path: string) => void
  onCancel: () => void
}

const DEMO_FOLDERS = [
  '/SWS Projects/495 Hartford Apartments',
  '/SWS Projects/New Project Folder',
  '/SWS Projects/Estimates',
  '/SWS Projects/Archive',
]

export default function DropboxFolderPicker({ currentPath, onSelect, onCancel }: DropboxFolderPickerProps) {
  const [selected, setSelected] = useState(currentPath || '')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-sws-navy">Select Dropbox Folder</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1 max-h-64 overflow-y-auto">
          {DEMO_FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => setSelected(folder)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                selected === folder
                  ? 'bg-sws-gold/10 text-sws-navy font-medium'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <FolderOpen size={16} className={selected === folder ? 'text-sws-gold' : 'text-gray-400'} />
              <span className="truncate">{folder}</span>
              {selected === folder && <Check size={14} className="ml-auto text-sws-gold" />}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="btn-gold text-sm"
          >
            Link Folder
          </button>
        </div>
      </div>
    </div>
  )
}
