import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFieldUpdates, apiCreateFieldUpdate, fetchProjects } from '../lib/api'
import { extractGpsFromPhoto, reverseGeocode, matchProjectByAddress, createPhotoThumbnail } from '../lib/geo'
import type { FieldUpdate } from '../types'
import {
  Camera, MapPin, Send, Image, Loader2, CheckCircle2,
  MessageCircle, Smartphone, Globe, Clock, AlertTriangle
} from 'lucide-react'
import Modal from './ui/Modal'

const SOURCE_ICONS: Record<string, typeof MessageCircle> = {
  telegram: Send,
  whatsapp: MessageCircle,
  sms: Smartphone,
  web: Globe,
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function FieldUpdatesFeed({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const [showUpload, setShowUpload] = useState(false)

  const { data: updates } = useQuery({
    queryKey: ['field-updates', projectId],
    queryFn: () => fetchFieldUpdates(projectId),
  })

  const fieldUpdates = updates || []

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-sws-gold" />
          <h2 className="text-lg font-semibold text-sws-navy">Field Updates</h2>
          {fieldUpdates.length > 0 && (
            <span className="badge badge-blue">{fieldUpdates.length}</span>
          )}
        </div>
        <button
          className="btn-gold flex items-center gap-2 text-sm !py-1.5 !px-3"
          onClick={() => setShowUpload(true)}
        >
          <Camera size={14} /> Send Update
        </button>
      </div>

      {fieldUpdates.length === 0 ? (
        <div className="text-center py-8">
          <Camera size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No field updates yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload a photo or send one via Telegram</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {fieldUpdates.map((fu) => (
            <FieldUpdateCard key={fu.id} update={fu} />
          ))}
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Send Field Update">
        <FieldUpdateForm
          projectId={projectId}
          onSuccess={() => {
            setShowUpload(false)
            queryClient.invalidateQueries({ queryKey: ['field-updates', projectId] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          }}
        />
      </Modal>
    </div>
  )
}

function FieldUpdateCard({ update }: { update: FieldUpdate }) {
  const SourceIcon = SOURCE_ICONS[update.source] || Globe

  return (
    <div className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-sws-navy/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-sws-navy">
            {update.sender_name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-sws-navy">{update.sender_name}</span>
            <span className="text-xs text-gray-400">{update.sender_role}</span>
            <span className="text-xs text-gray-300">|</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <SourceIcon size={10} />
              <span>{update.source}</span>
            </div>
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <Clock size={10} /> {timeAgo(update.created_at)}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 mt-1">{update.message}</p>

          {/* Photo */}
          {update.photo_thumbnail && (
            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-sm">
              <img
                src={update.photo_thumbnail}
                alt="Field photo"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Location badge */}
          {update.geocoded_address && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin size={10} />
              <span>{update.geocoded_address}</span>
              {update.auto_matched && (
                <span className="badge badge-green !text-[10px] !px-1.5 !py-0 ml-1">auto-matched</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldUpdateForm({ projectId, onSuccess }: { projectId: string; onSuccess: () => void }) {
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderRole, setSenderRole] = useState('Field Super')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'reading' | 'found' | 'not-found'>('idle')
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null)
  const [matchedProject, setMatchedProject] = useState<{ name: string; confidence: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const createMutation = useMutation({
    mutationFn: apiCreateFieldUpdate,
    onSuccess,
  })

  const processPhoto = useCallback(async (file: File) => {
    setPhotoFile(file)
    setGpsStatus('reading')

    // Create thumbnail preview
    const thumbnail = await createPhotoThumbnail(file)
    setPhotoPreview(thumbnail)

    // Extract GPS
    const coords = await extractGpsFromPhoto(file)
    if (coords) {
      setGpsCoords(coords)
      setGpsStatus('found')

      // Reverse geocode
      const address = await reverseGeocode(coords)
      if (address) {
        setGeocodedAddress(address)

        // Try to match to a project
        const projects = await fetchProjects()
        const match = matchProjectByAddress(address, projects)
        if (match) {
          setMatchedProject({ name: match.name, confidence: match.confidence })
        }
      }
    } else {
      setGpsStatus('not-found')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      processPhoto(file)
    }
  }, [processPhoto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      project_id: projectId,
      sender_name: senderName || 'Demo User',
      sender_role: senderRole,
      message,
      photo_thumbnail: photoPreview,
      latitude: gpsCoords?.latitude || null,
      longitude: gpsCoords?.longitude || null,
      geocoded_address: geocodedAddress,
      source: 'web',
      auto_matched: !!matchedProject,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-sws-gold bg-sws-gold/5' :
          photoPreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-sws-gold'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processPhoto(file)
          }}
        />

        {photoPreview ? (
          <div>
            <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-2" />
            <p className="text-xs text-gray-400">Click or drop to replace</p>
          </div>
        ) : (
          <div>
            <Image size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Drop a photo here or tap to upload</p>
            <p className="text-xs text-gray-400 mt-1">GPS location will be extracted automatically</p>
          </div>
        )}
      </div>

      {/* GPS Status */}
      {gpsStatus !== 'idle' && (
        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
          gpsStatus === 'reading' ? 'bg-blue-50 text-blue-700' :
          gpsStatus === 'found' ? 'bg-green-50 text-green-700' :
          'bg-amber-50 text-amber-700'
        }`}>
          {gpsStatus === 'reading' && <><Loader2 size={14} className="animate-spin" /> Reading GPS data...</>}
          {gpsStatus === 'found' && (
            <div className="w-full">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>GPS Found: {gpsCoords?.latitude.toFixed(4)}, {gpsCoords?.longitude.toFixed(4)}</span>
              </div>
              {geocodedAddress && (
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <MapPin size={10} />
                  <span className="truncate">{geocodedAddress}</span>
                </div>
              )}
              {matchedProject && (
                <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                  <CheckCircle2 size={10} />
                  Auto-matched to: {matchedProject.name} ({Math.round(matchedProject.confidence * 100)}% confidence)
                </div>
              )}
            </div>
          )}
          {gpsStatus === 'not-found' && (
            <><AlertTriangle size={14} /> No GPS data in photo. Location tagging unavailable.</>
          )}
        </div>
      )}

      {/* Sender Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input type="text" className="input" placeholder="e.g. Marco R."
            value={senderName} onChange={e => setSenderName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select className="input" value={senderRole} onChange={e => setSenderRole(e.target.value)}>
            <option>Field Super</option>
            <option>PM</option>
            <option>Foreman</option>
            <option>Owner</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Update Message</label>
        <textarea
          required
          className="input"
          rows={3}
          placeholder="What's happening on site? e.g. Brown coat on Building A complete, moving to east side..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
          {createMutation.isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Sending...</>
          ) : (
            <><Send size={14} /> Send Update</>
          )}
        </button>
      </div>
    </form>
  )
}

// Simulated "incoming message" component for demo purposes
export function SimulateIncomingMessage({ onSimulate }: {
  onSimulate: (update: { project_id: string; sender_name: string; sender_role: string; message: string; source: 'telegram' | 'whatsapp' | 'sms' }) => void
}) {
  const [open, setOpen] = useState(false)

  const presets = [
    { sender: 'Marco R.', role: 'Field Super', msg: 'Scaffold crew arrived. Starting setup on north elevation. Weather looks good for the week.', source: 'telegram' as const },
    { sender: 'Jose M.', role: 'Foreman', msg: 'Material delivery from L&W Supply received. 45 bags of scratch coat. Need 20 more by Friday.', source: 'whatsapp' as const },
    { sender: 'Aaron S.', role: 'PM', msg: 'Just finished walk-through with Fassberg. They want color coat samples by end of week.', source: 'sms' as const },
    { sender: 'Marco R.', role: 'Field Super', msg: 'Found moisture behind lath on 3rd floor corridor. Sending photos. May need waterproofing CO.', source: 'telegram' as const },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-sws-gold transition-colors flex items-center gap-1"
      >
        <MessageCircle size={12} /> Simulate incoming message
      </button>
      {open && (
        <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Click to simulate a field message arriving:</p>
          {presets.map((preset, i) => (
            <button
              key={i}
              className="w-full text-left p-2 rounded border border-gray-200 bg-white hover:border-sws-gold hover:bg-sws-gold/5 transition-colors text-xs"
              onClick={() => {
                onSimulate({
                  project_id: 'hartford-001',
                  sender_name: preset.sender,
                  sender_role: preset.role,
                  message: preset.msg,
                  source: preset.source,
                })
                setOpen(false)
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-semibold">{preset.sender}</span>
                <span className="text-gray-400">via {preset.source}</span>
              </div>
              <p className="text-gray-600 line-clamp-1">{preset.msg}</p>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
