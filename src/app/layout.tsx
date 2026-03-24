import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./red-effects.css";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { VisitTracker } from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salmas - Premium Content & Exclusive Experiences",
  description: "Discover exclusive premium content and elevate your creative journey with our curated collection. Join our community of discerning members today.",
  keywords: ["premium content", "exclusive access", "creative resources", "subscription", "membership", "gallery", "premium images"],
  authors: [{ name: "Salmas Team" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Salmas- Premium Content & Exclusive Experiences",
    description: "Discover exclusive premium content and elevate your creative journey with our curated collection.",
    url: "https://salmas.com",
    siteName: "Salmas",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salmas - Premium Content",
    description: "Discover exclusive premium content and elevate your creative journey.",
    images: ["/images/hero-bg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/hero-bg.png" type="image/png" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var devMode = (typeof sessionStorage !== 'undefined') && sessionStorage.getItem('__devmode') === '1';

            // Ctrl+X => toggle developer mode
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
                e.preventDefault();
                devMode = !devMode;
                if (devMode) {
                  sessionStorage.setItem('__devmode', '1');
                  console.clear();
                  console.log('%c✅ Developer Mode ON', 'color: #00ff88; font-size: 16px; font-weight: bold;');
                } else {
                  sessionStorage.removeItem('__devmode');
                  console.log('%c🔒 Developer Mode OFF', 'color: #ff4444; font-size: 16px;');
                }
                return;
              }

              if (devMode) return; // allow all shortcuts in dev mode

              // Block shortcuts for normal users
              if (e.key === 'F12') { e.preventDefault(); return false; }
              if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return false; }
              if ((e.ctrlKey || e.metaKey) && ['U','u','S','s','A','a'].includes(e.key)) { e.preventDefault(); return false; }
            });

            // Disable right click (skip in dev mode)
            document.addEventListener('contextmenu', function(e) {
              if (!devMode) e.preventDefault();
            });

            // Disable text selection & drag (skip in dev mode)
            document.addEventListener('selectstart', function(e) { if (!devMode) e.preventDefault(); });
            document.addEventListener('dragstart', function(e) { if (!devMode) e.preventDefault(); });

            // DevTools detection (skip in dev mode)
            var devtools = { open: false };
            setInterval(function() {
              if (devMode) { devtools.open = false; return; }
              if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                if (!devtools.open) {
                  devtools.open = true;
                  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-size:24px;font-family:sans-serif;">⛔ Access Denied</div>';
                }
              } else {
                devtools.open = false;
              }
            }, 500);
          })();
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <VisitTracker />
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  );
}
