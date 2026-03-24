import { randomBytes } from 'crypto'

// Generate a secure random token for password reset
export const generateResetToken = (): string => {
  return randomBytes(32).toString('hex')
}

// Generate a hash of the token for storage (optional security layer)
export const hashResetToken = (token: string): string => {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Verify if a token matches a stored hash
export const verifyResetToken = (token: string, hashedToken: string): boolean => {
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return hash === hashedToken
}
