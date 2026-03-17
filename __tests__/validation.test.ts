import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// validering för pins, samma som vi använder i appen
const pinSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  emoji: z.string().min(1).max(10),
  body: z.string().min(1).max(500),
})

describe('pin validation', () => {
  it('should accept valid pin data', () => {
    const validPin = {
      lat: 59.3293,
      lng: 18.0686,
      emoji: '📍',
      body: 'test pin',
    }
    
    const result = pinSchema.safeParse(validPin)
    expect(result.success).toBe(true)
  })

  it('should reject invalid latitude', () => {
    const invalidPin = {
      lat: 999, // ogiltig
      lng: 18.0686,
      emoji: '📍',
      body: 'test',
    }
    
    const result = pinSchema.safeParse(invalidPin)
    expect(result.success).toBe(false)
  })

  it('should reject empty body', () => {
    const invalidPin = {
      lat: 59.3293,
      lng: 18.0686,
      emoji: '📍',
      body: '',
    }
    
    const result = pinSchema.safeParse(invalidPin)
    expect(result.success).toBe(false)
  })

  it('should reject too long body', () => {
    const invalidPin = {
      lat: 59.3293,
      lng: 18.0686,
      emoji: '📍',
      body: 'a'.repeat(501),
    }
    
    const result = pinSchema.safeParse(invalidPin)
    expect(result.success).toBe(false)
  })
})

// sphere invite code validation
const inviteCodeSchema = z.string().length(8).regex(/^[A-Z0-9]+$/)

describe('invite code validation', () => {
  it('should accept valid invite code', () => {
    const result = inviteCodeSchema.safeParse('ABC12345')
    expect(result.success).toBe(true)
  })

  it('should reject too short code', () => {
    const result = inviteCodeSchema.safeParse('ABC')
    expect(result.success).toBe(false)
  })

  it('should reject lowercase', () => {
    const result = inviteCodeSchema.safeParse('abc12345')
    expect(result.success).toBe(false)
  })
})
