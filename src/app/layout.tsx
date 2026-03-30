import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriRent — Farm Equipment Marketplace",
  description: "Rent agricultural equipment near you. Tractors, harvesters, and more.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "AgriRent" },
};

export const viewport: Viewport = {
  themeColor: "#5c8252",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* <link rel="apple-touch-icon" href="/icon-192.png" /> */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body bg-cream text-bark antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#2c1810",
              color: "#fdfaf5",
              border: "none",
              borderRadius: "12px",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
