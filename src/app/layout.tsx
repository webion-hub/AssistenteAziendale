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
  // Default to the anthracite dark theme: `dark` is applied statically so the
  // server-rendered HTML and the first client render match (no flash, no
  // hydration mismatch). A stored "light" preference is applied after mount.
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
