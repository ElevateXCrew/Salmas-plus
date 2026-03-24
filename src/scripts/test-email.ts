/**
 * Test script to verify email configuration
 * Run with: bun run src/scripts/test-email.ts
 */

import { verifySmtpConnection, sendPasswordResetEmail } from '@/lib/email'

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n')
  
  // Test 1: Verify SMTP connection
  console.log('Test 1: Checking SMTP connection...')
  const isConnected = await verifySmtpConnection()
  console.log(`SMTP Status: ${isConnected ? '✅ Connected' : '❌ Not connected'}\n`)
  
  // Test 2: Send test reset email
  console.log('Test 2: Sending test password reset email...')
  const testEmail = 'test@example.com'
  const testToken = 'test-token-12345'
  
  try {
    const result = await sendPasswordResetEmail(testEmail, testToken, 'Test User')
    console.log(`Email sent: ${result ? '✅ Success' : '❌ Failed (expected if SMTP not configured)'}\n`)
  } catch (error: any) {
    console.log(`Email error: ${error?.message || error}\n`)
  }
  
  console.log('✅ Email tests completed!')
}

testEmail().catch(console.error)
