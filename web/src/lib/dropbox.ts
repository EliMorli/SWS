const STORAGE_KEY = 'sws_dropbox_connection'
const DEMO_MODE = !import.meta.env.VITE_API_URL || import.meta.env.VITE_DEMO === 'true'
const APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY || ''

export interface StoredDropboxConnection {
  access_token: string
  refresh_token: string
  account_id: string
  account_display_name: string
  connected_at: string
  expires_at: string
}

export function getDropboxConnection(): StoredDropboxConnection | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function isDropboxConnected(): boolean {
  return getDropboxConnection() !== null
}

export function disconnectDropbox(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function connectDropboxDemo(): void {
  const connection: StoredDropboxConnection = {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    account_id: 'demo-account',
    account_display_name: 'SWS Demo Dropbox',
    connected_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connection))
}

export function initiateDropboxOAuth(): void {
  if (DEMO_MODE || !APP_KEY) {
    connectDropboxDemo()
    window.location.reload()
    return
  }

  // Generate PKCE code verifier
  const codeVerifier = generateCodeVerifier()
  sessionStorage.setItem('dbx_code_verifier', codeVerifier)

  generateCodeChallenge(codeVerifier).then(codeChallenge => {
    const redirectUri = `${window.location.origin}/settings/dropbox`
    const params = new URLSearchParams({
      client_id: APP_KEY,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
      token_access_type: 'offline',
    })
    window.location.href = `https://www.dropbox.com/oauth2/authorize?${params}`
  })
}

export async function handleDropboxCallback(code: string): Promise<boolean> {
  const codeVerifier = sessionStorage.getItem('dbx_code_verifier')
  if (!codeVerifier) return false

  try {
    const redirectUri = `${window.location.origin}/settings/dropbox`
    const resp = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        client_id: APP_KEY,
        redirect_uri: redirectUri,
      }),
    })
    if (!resp.ok) return false

    const data = await resp.json()
    const connection: StoredDropboxConnection = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      account_id: data.account_id || 'unknown',
      account_display_name: data.account_id || 'Dropbox Account',
      connected_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (data.expires_in || 14400) * 1000).toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connection))
    sessionStorage.removeItem('dbx_code_verifier')

    // Clean URL
    window.history.replaceState({}, '', '/settings/dropbox')
    return true
  } catch {
    return false
  }
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 128)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
