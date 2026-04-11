import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanKey — Unlock the City",
  description: "Escape game urbain immersif. Découvrez les secrets cachés de Meknès.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UrbanKey",
  },
};

export const viewport: Viewport = {
  themeColor: "#081422",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${jakarta.variable} ${inter.variable} bg-background text-on-background font-body antialiased`}>
        <div className="max-w-md mx-auto min-h-dvh relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
