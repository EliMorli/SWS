import exifr from 'exifr'

export interface GpsCoords {
  latitude: number
  longitude: number
}

export async function extractGpsFromPhoto(file: File): Promise<GpsCoords | null> {
  try {
    const exif = await exifr.parse(file, { gps: true })
    if (exif?.latitude && exif?.longitude) {
      return { latitude: exif.latitude, longitude: exif.longitude }
    }
    return null
  } catch {
    return null
  }
}

export async function reverseGeocode(coords: GpsCoords): Promise<string | null> {
  try {
    const { latitude, longitude } = coords
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      { headers: { 'User-Agent': 'SWS-Operations/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name || null
  } catch {
    return null
  }
}

export function matchProjectByAddress(
  geocodedAddress: string,
  projects: Array<{ id: string; name: string; address: string }>
): { id: string; name: string; confidence: number } | null {
  if (!geocodedAddress) return null

  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[,.\-#]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const geocoded = normalize(geocodedAddress)
  const geocodedTokens = geocoded.split(' ').filter(t => t.length > 1)

  let bestMatch: { id: string; name: string; confidence: number } | null = null

  for (const project of projects) {
    const projAddr = normalize(project.address)
    const projTokens = projAddr.split(' ').filter(t => t.length > 1)

    // Count how many project address tokens appear in the geocoded address
    const matchedTokens = projTokens.filter(token =>
      geocodedTokens.some(gt => gt === token || gt.includes(token) || token.includes(gt))
    )

    const confidence = projTokens.length > 0 ? matchedTokens.length / projTokens.length : 0

    // Also check if street number matches (strongest signal)
    const projStreetNum = projAddr.match(/^\d+/)
    const geoHasStreetNum = projStreetNum && geocoded.includes(projStreetNum[0])

    const adjustedConfidence = geoHasStreetNum ? Math.min(confidence + 0.2, 1) : confidence

    if (adjustedConfidence > 0.3 && (!bestMatch || adjustedConfidence > bestMatch.confidence)) {
      bestMatch = { id: project.id, name: project.name, confidence: adjustedConfidence }
    }
  }

  return bestMatch
}

export function matchProjectByCoords(
  coords: GpsCoords,
  projects: Array<{ id: string; name: string; address: string; lat?: number; lng?: number }>
): { id: string; name: string; distance: number } | null {
  // For projects that have stored coordinates, find the closest one
  const withCoords = projects.filter(p => p.lat && p.lng) as Array<{ id: string; name: string; lat: number; lng: number }>

  if (withCoords.length === 0) return null

  let closest: { id: string; name: string; distance: number } | null = null

  for (const project of withCoords) {
    const distance = haversineDistance(coords.latitude, coords.longitude, project.lat, project.lng)
    if (!closest || distance < closest.distance) {
      closest = { id: project.id, name: project.name, distance }
    }
  }

  // Only match if within 500 meters
  return closest && closest.distance < 0.5 ? closest : null
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return deg * Math.PI / 180
}

export function createPhotoThumbnail(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
