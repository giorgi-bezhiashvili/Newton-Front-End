import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newton",
  description: "ინოვაციური პლატფორმა ფიზიკის შესასწავლად.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: "Newton",
    title: "Newton - ფიზიკის შესასწავლი პლატფორმა",
    description: "ინოვაციური პლატფორმა ფიზიკის შესასწავლად.",
    type: "website",
    url: "https://newton181.vercel.app/",
    images: [
      {
        url: "https://newton181.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://newton181.vercel.app/og-image.jpg"], // Matched with your og-image file type
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}