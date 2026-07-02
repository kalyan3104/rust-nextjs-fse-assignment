import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Certificate Inventory",
  description: "Live inventory of certificates tracked by cert-service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-base-bg">
          <header className="border-b border-base-border bg-base-panel">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-signal-accent/15 font-mono text-sm font-bold text-signal-accent">
                  C
                </span>
                <span className="font-mono text-sm font-semibold tracking-wide text-ink">
                  cert-inventory
                </span>
              </div>
              <nav className="text-xs text-ink-muted">
                backed by <span className="text-ink-muted">cert-service</span>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
