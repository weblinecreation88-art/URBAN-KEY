import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  themeColor: "#fff9ed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${jakarta.variable} ${notoSerif.variable} bg-background text-on-background font-body antialiased`}>
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-dvh relative overflow-x-hidden">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
