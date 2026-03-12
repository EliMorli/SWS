import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDropboxFiles } from '../../lib/api'
import { isDropboxConnected } from '../../lib/dropbox'
import { formatDate, formatFileSize } from '../../lib/format'
import {
  FolderOpen, Folder, FileText, Image, File,
  ChevronRight, ChevronDown, Download, Cloud
} from 'lucide-react'
import type { DropboxFileEntry } from '../../types'
import { Link } from 'react-router-dom'

function getFileIcon(entry: DropboxFileEntry) {
  if (entry.type === 'folder') return Folder
  if (entry.icon === 'pdf') return FileText
  if (entry.icon === 'image') return Image
  return File
}

function getFileIconColor(entry: DropboxFileEntry) {
  if (entry.type === 'folder') return 'text-sws-gold'
  if (entry.icon === 'pdf') return 'text-red-500'
  if (entry.icon === 'image') return 'text-blue-500'
  return 'text-gray-400'
}

function FolderNode({ entry }: { entry: DropboxFileEntry }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = expanded ? FolderOpen : Folder
  const Chevron = expanded ? ChevronDown : ChevronRight

  if (entry.type !== 'folder') {
    const FileIcon = getFileIcon(entry)
    return (
      <div className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded text-sm group">
        <div className="flex items-center gap-2 min-w-0">
          <FileIcon size={14} className={getFileIconColor(entry)} />
          <span className="truncate">{entry.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          {entry.size != null && <span>{formatFileSize(entry.size)}</span>}
          {entry.modified && <span>{formatDate(entry.modified)}</span>}
          <button
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-sws-navy transition-all"
            title="Download"
            onClick={() => alert('Download not available in demo mode')}
          >
            <Download size={12} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-1.5 px-2 w-full hover:bg-gray-50 rounded text-sm font-medium text-sws-navy"
      >
        <Chevron size={14} className="text-gray-400 shrink-0" />
        <Icon size={14} className="text-sws-gold shrink-0" />
        <span>{entry.name}</span>
        {entry.children && (
          <span className="text-xs text-gray-400 ml-1">({entry.children.length})</span>
        )}
      </button>
      {expanded && entry.children && (
        <div className="ml-5 border-l border-gray-100 pl-2">
          {entry.children.length === 0 ? (
            <p className="text-xs text-gray-400 py-1 px-2 italic">Empty folder</p>
          ) : (
            entry.children.map(child => (
              <FolderNode key={child.id} entry={child} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface DropboxFileBrowserProps {
  projectId: string
}

export default function DropboxFileBrowser({ projectId }: DropboxFileBrowserProps) {
  const connected = isDropboxConnected()

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['dropbox-files', projectId],
    queryFn: () => fetchDropboxFiles(projectId),
    enabled: connected,
  })

  if (!connected) {
    return (
      <div className="text-center py-8">
        <Cloud size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-400 mb-2">Dropbox not connected</p>
        <Link to="/settings/dropbox" className="text-sm text-sws-gold hover:underline">
          Connect in Settings
        </Link>
      </div>
    )
  }

  if (isLoading) return <p className="text-sm text-gray-400 py-4">Loading files...</p>

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-400">No files linked to this project</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {files.map(entry => (
        <FolderNode key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
