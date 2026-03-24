import nodemailer from 'nodemailer'

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.faheema.uk',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'support@faheema.uk',
    pass: process.env.SMTP_PASSWORD || '',
  },
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    ...SMTP_CONFIG,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  })
}

// Verify SMTP connection
export const verifySmtpConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    return true
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    return false
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  userName?: string
): Promise<boolean> => {
  try {
    // Check if SMTP password is configured
    if (!SMTP_CONFIG.auth.pass || SMTP_CONFIG.auth.pass === '') {
      console.warn('⚠️ SMTP password not configured. Email sending disabled.')
      console.log(`📧 Reset token for ${to}: ${resetToken}`)
      return false
    }

    const transporter = createTransporter()
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Faheema</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Password Reset Request</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                        Hello ${userName ? userName : 'there'}!
                      </h2>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        We received a request to reset your password for your Faheema account. 
                        Don't worry, we're here to help you get back on track.
                      </p>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                        Click the button below to reset your password. This link will expire in 1 hour for security reasons.
                      </p>
                      
                      <!-- Reset Button -->
                      <table role="presentation" style="margin: 30px 0; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${resetUrl}" 
                               style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; border: 2px solid transparent;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                      </p>
                      
                      <p style="color: #667eea; word-break: break-all; margin: 0 0 30px 0; font-size: 14px; font-family: monospace; background-color: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 3px solid #667eea;">
                        ${resetUrl}
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                      
                      <p style="color: #999999; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
                        <strong>Security Tips:</strong>
                      </p>
                      <ul style="color: #999999; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; padding-left: 20px;">
                        <li>This link expires in 1 hour</li>
                        <li>Never share your password with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                        Need help? Contact our support team
                      </p>
                      <p style="color: #667eea; margin: 0 0 20px 0; font-size: 14px;">
                        <a href="mailto:support@faheema.uk" style="color: #667eea; text-decoration: none;">support@faheema.uk</a>
                      </p>
                      <p style="color: #cccccc; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Faheema. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
    
    // Plain text version
    const textContent = `
      Password Reset Request
      
      Hello ${userName ? userName : 'there'}!
      
      We received a request to reset your password for your Faheema account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      ---
      Faheema Support Team
      support@faheema.uk
    `
    
    // Send email
    const info = await transporter.sendMail({
      from: `"Faheema Support" <${SMTP_CONFIG.auth.user}>`,
      to: to,
      subject: 'Password Reset Request - Faheema',
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
      },
    })
    
    console.log('✅ Password reset email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

// Send welcome email
export const sendWelcomeEmail = async (
  to: string,
  userName?: string
): Promise<boolean> => {
  try {
    // Check if SMTP password is configured
    if (!SMTP_CONFIG.auth.pass || SMTP_CONFIG.auth.pass === '') {
      console.warn('⚠️ SMTP password not configured. Email sending disabled.')
      return false
    }

    const transporter = createTransporter()
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Faheema!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Faheema!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName ? userName : 'there'}!</h2>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Thank you for joining Faheema. We're excited to have you on board!
                      </p>
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                        You can now access our premium gallery, exclusive content, and many more features.
                      </p>
                      <table role="presentation" style="margin: 30px 0; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                               style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                              Go to Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center;">
                      <p style="color: #999999; margin: 0; font-size: 14px;">
                        © ${new Date().getFullYear()} Faheema. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
    
    await transporter.sendMail({
      from: `"Faheema Support" <${SMTP_CONFIG.auth.user}>`,
      to: to,
      subject: 'Welcome to Faheema! 🎉',
      html: htmlContent,
    })
    
    console.log('✅ Welcome email sent:', to)
    return true
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    return false
  }
}
