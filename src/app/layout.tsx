import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutShell from "../components/LayoutShell";
import PWAProvider from "../components/PWAProvider";

export const metadata: Metadata = {
  title: "Yaperz | Premium Streetwear E-Commerce",
  description: "Premium gender-neutral streetwear clothing brand from India. High quality oversized hoodies, t-shirts, varsity jackets, caps, and accessories.",
  keywords: "streetwear India, premium streetwear, unisex streetwear, Gen Z clothing brand India, oversized t-shirts, luxury streetwear",
  authors: [{ name: "Yaperz Team" }],
  metadataBase: new URL("https://yaperz.com"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Yaperz",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Yaperz | Premium Streetwear E-Commerce",
    description: "Premium gender-neutral streetwear clothing brand from India. High quality oversized hoodies, t-shirts, varsity jackets, caps, and accessories.",
    url: "https://yaperz.com",
    siteName: "Yaperz",
    images: [
      {
        url: "/images/hero-desktop.png",
        width: 1200,
        height: 630,
        alt: "Yaperz Streetwear",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaperz | Premium Streetwear E-Commerce",
    description: "Premium gender-neutral streetwear clothing brand from India. High quality oversized hoodies, t-shirts, varsity jackets, caps, and accessories.",
    images: ["/images/hero-desktop.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PWAProvider>
          <LayoutShell>{children}</LayoutShell>
        </PWAProvider>
      </body>
    </html>
  );
}

