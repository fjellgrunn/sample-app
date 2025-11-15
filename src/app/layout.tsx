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
                <header className="app-header py-6">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h1 className="text-2xl font-bold">Fjell Sample App</h1>
                        <p className="text-gray-600 mt-1">Widget Management System</p>
                      </div>
                    </div>
                    <nav className="flex space-x-12 justify-center pt-4 border-t border-gray-200">
                      <a href="/" className="text-blue-600 hover:text-blue-800 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 text-lg">Home</a>
                      <a href="/cache-demo" className="text-blue-600 hover:text-blue-800 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 text-lg">Cache Demo</a>
                      <a href="/api" className="text-blue-600 hover:text-blue-800 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 text-lg" target="_blank">API Info</a>
                    </nav>
                  </div>
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
