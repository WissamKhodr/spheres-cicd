import { describe, it, expect } from 'vitest'

// hjälpfunktion för att formatera datum
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('sv-SE')
}

// räkna ut avstånd mellan två koordinater (haversine)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

describe('formatDate', () => {
  it('should format timestamp correctly', () => {
    // 1 jan 2024
    const timestamp = 1704067200000
    const result = formatDate(timestamp)
    expect(result).toBe('2024-01-01')
  })
})

describe('getDistance', () => {
  it('should return 0 for same location', () => {
    const dist = getDistance(59.3293, 18.0686, 59.3293, 18.0686)
    expect(dist).toBe(0)
  })

  it('should calculate distance between stockholm and gothenburg', () => {
    // stockholm -> göteborg ca 400km
    const dist = getDistance(59.3293, 18.0686, 57.7089, 11.9746)
    expect(dist).toBeGreaterThan(390)
    expect(dist).toBeLessThan(410)
  })

  it('should calculate distance between stockholm and malmö', () => {
    // stockholm -> malmö ca 500km
    const dist = getDistance(59.3293, 18.0686, 55.6050, 13.0038)
    expect(dist).toBeGreaterThan(500)
    expect(dist).toBeLessThan(550)
  })
})
