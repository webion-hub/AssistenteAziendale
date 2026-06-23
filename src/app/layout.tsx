import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "Corpass — Conoscenza e linee guida aziendali",
  description:
    "Assistente interno che risponde su sapere aziendale, linee guida e standard di programmazione.",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
