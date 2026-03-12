import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDropboxMappings, fetchProjects, apiSetDropboxMapping, apiRemoveDropboxMapping } from '../lib/api'
import { isDropboxConnected, getDropboxConnection, handleDropboxCallback } from '../lib/dropbox'
import { formatDate } from '../lib/format'
import DropboxConnectButton from '../components/dropbox/DropboxConnectButton'
import DropboxFolderPicker from '../components/dropbox/DropboxFolderPicker'
import { Settings, Cloud, FolderOpen, Trash2, Link2 } from 'lucide-react'

export default function DropboxSettingsPage() {
  const queryClient = useQueryClient()
  const [showPicker, setShowPicker] = useState<string | null>(null)
  const connected = isDropboxConnected()
  const connection = getDropboxConnection()

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      handleDropboxCallback(code).then(() => {
        window.location.reload()
      })
    }
  }, [])

  const { data: mappings = [] } = useQuery({
    queryKey: ['dropbox-mappings'],
    queryFn: fetchDropboxMappings,
    enabled: connected,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const linkMutation = useMutation({
    mutationFn: ({ projectId, path }: { projectId: string; path: string }) =>
      apiSetDropboxMapping(projectId, path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dropbox-mappings'] }),
  })

  const unlinkMutation = useMutation({
    mutationFn: apiRemoveDropboxMapping,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dropbox-mappings'] }),
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-sws-gold" />
        <h1 className="text-2xl font-bold text-sws-navy">Dropbox Integration</h1>
      </div>

      {/* Demo Mode Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-700">
        Demo Mode — showing simulated Dropbox files. Connect a real Dropbox account by setting
        VITE_DROPBOX_APP_KEY in your environment.
      </div>

      {/* Connection Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Cloud size={18} className="text-sws-gold" />
          <h2 className="text-lg font-semibold text-sws-navy">Connection</h2>
        </div>

        {connected && connection ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase">Account</p>
                <p className="font-medium">{connection.account_display_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase">Connected</p>
                <p className="font-medium">{formatDate(connection.connected_at)}</p>
              </div>
            </div>
            <DropboxConnectButton />
          </div>
        ) : (
          <div className="text-center py-6">
            <Cloud size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-4">
              Connect your Dropbox account to browse project files directly from SWS.
            </p>
            <DropboxConnectButton />
          </div>
        )}
      </div>

      {/* Project Folder Mappings */}
      {connected && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={18} className="text-sws-gold" />
            <h2 className="text-lg font-semibold text-sws-navy">Project Folder Mappings</h2>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Project</th>
                <th className="pb-2">Linked Folder</th>
                <th className="pb-2">Linked</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const mapping = mappings.find(m => m.project_id === project.id)
                return (
                  <tr key={project.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-sws-navy">{project.name}</td>
                    <td className="py-3 text-gray-600">
                      {mapping ? (
                        <span className="flex items-center gap-1">
                          <FolderOpen size={12} className="text-sws-gold" />
                          {mapping.dropbox_folder_path}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not linked</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">
                      {mapping ? formatDate(mapping.linked_at) : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowPicker(project.id)}
                          className="text-gray-400 hover:text-sws-navy transition-colors"
                          title={mapping ? 'Change folder' : 'Link folder'}
                        >
                          <Link2 size={14} />
                        </button>
                        {mapping && (
                          <button
                            onClick={() => unlinkMutation.mutate(project.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Unlink"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Folder Picker Modal */}
      {showPicker && (
        <DropboxFolderPicker
          currentPath={mappings.find(m => m.project_id === showPicker)?.dropbox_folder_path}
          onSelect={(path) => {
            linkMutation.mutate({ projectId: showPicker, path })
            setShowPicker(null)
          }}
          onCancel={() => setShowPicker(null)}
        />
      )}
    </div>
  )
}
