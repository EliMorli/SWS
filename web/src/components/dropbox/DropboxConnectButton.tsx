import { initiateDropboxOAuth, isDropboxConnected, disconnectDropbox, getDropboxConnection } from '../../lib/dropbox'
import { CloudOff, Cloud } from 'lucide-react'

interface DropboxConnectButtonProps {
  onConnectionChange?: () => void
}

export default function DropboxConnectButton({ onConnectionChange }: DropboxConnectButtonProps) {
  const connected = isDropboxConnected()
  const connection = getDropboxConnection()

  const handleConnect = () => {
    initiateDropboxOAuth()
    onConnectionChange?.()
  }

  const handleDisconnect = () => {
    disconnectDropbox()
    onConnectionChange?.()
    window.location.reload()
  }

  if (connected && connection) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-green-600">
          <Cloud size={18} />
          <span className="text-sm font-medium">{connection.account_display_name}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <CloudOff size={14} /> Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <Cloud size={16} /> Connect Dropbox
    </button>
  )
}
