import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy | Salmaa',
  description: 'Privacy Policy for Salmaa premium content platform.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 2025</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to Salmaa ("we", "our", "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your
              information when you visit our website and use our premium subscription services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect the following information when you register or use our services:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Full name and email address</li>
              <li>Encrypted password (we never store plain-text passwords)</li>
              <li>Subscription plan and payment status</li>
              <li>Messages you send through our contact form</li>
              <li>IP address and browser/device information for security purposes</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To create and manage your account</li>
              <li>To process and manage your subscription</li>
              <li>To respond to your messages and enquiries</li>
              <li>To send important service-related notifications</li>
              <li>To maintain the security of our platform</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Confidentiality & Discretion</h2>
            <p>
              We understand the sensitive nature of our services. Your personal information, subscription
              details, and activity on this platform are kept strictly confidential. We do not share, sell,
              or disclose your data to any third parties except where required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. Cookies</h2>
            <p>
              We use HTTP-only cookies solely for authentication and session management. These cookies are
              essential for the platform to function and do not track your activity across other websites.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">6. Data Security</h2>
            <p>
              All passwords are hashed using bcrypt. Authentication is handled via secure JWT tokens stored
              in HTTP-only cookies to prevent XSS attacks. We take reasonable technical measures to protect
              your data from unauthorised access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">7. Age Restriction</h2>
            <p>
              This website contains adult content and is intended strictly for users aged 18 and over.
              By registering or subscribing, you confirm that you are at least 18 years of age. We do not
              knowingly collect data from anyone under 18.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent at any time by cancelling your subscription</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the details below.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page
              with an updated date. Continued use of the platform after changes constitutes acceptance of
              the updated policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Email: <a href="mailto:support@Salmaa.com" className="text-primary hover:underline">support@Salmaa.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/+447511808743" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+44 7511 808743</a></li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
