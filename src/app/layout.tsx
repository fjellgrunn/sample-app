import type { Metadata } from 'next'
import { RootAdapters } from '@/client/providers/RootAdapters'
import { FjellErrorBoundary } from '@/client/components/ErrorBoundary'
import './globals.css'
import { ReferenceLoaders } from '@/client/providers/ReferenceLoaders'

export const metadata: Metadata = {
  title: 'Fjell Sample App',
  description: 'Widget Management System built with Fjell Framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <FjellErrorBoundary>
          <RootAdapters>
            <ReferenceLoaders>
              <div className="app">
                <header className="app-header">
                  <h1>Fjell Sample App</h1>
                  <p>Widget Management System</p>
                </header>

                <main className="app-main">
                  <FjellErrorBoundary>
                    {children}
                  </FjellErrorBoundary>
                </main>

                <footer className="app-footer">
                  <p>Built with Fjell Framework</p>
                </footer>
              </div>
            </ReferenceLoaders>
          </RootAdapters>
        </FjellErrorBoundary>
      </body>
    </html>
  )
}
