import type { Metadata, Viewport } from "next";
import "./globals.css";
import LayoutShell from "../components/LayoutShell";

export const metadata: Metadata = {
  title: "Yaperz | Premium Streetwear E-Commerce",
  description: "Premium gender-neutral streetwear clothing brand from India. High quality oversized hoodies, t-shirts, varsity jackets, caps, and accessories.",
  keywords: "streetwear India, premium streetwear, unisex streetwear, Gen Z clothing brand India, oversized t-shirts, luxury streetwear",
  authors: [{ name: "Yaperz Team" }],
  metadataBase: new URL("https://yaperz.com"),
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
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
