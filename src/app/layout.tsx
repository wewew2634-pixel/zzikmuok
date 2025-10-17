import React from 'react';
import { BannerProvider } from '../components/system/BannerProvider';
import '../styles/global.css';

export const metadata = {
  title: 'Qetta - Medical AI Platform',
  description: 'FDA-compliant medical AI cross-validation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <BannerProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary text-on-primary shadow-md">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                  <h1 className="text-xl font-bold">Qetta Medical AI</h1>
                  <div className="flex gap-4">
                    <a href="/" className="hover:underline">Home</a>
                    <a href="/missions" className="hover:underline">Missions</a>
                    <a href="/analytics" className="hover:underline">Analytics</a>
                    <button
                      onClick={() => {
                        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                        document.documentElement.dataset.theme = theme;
                      }}
                      className="px-3 py-1 bg-primary-container text-on-primary-container rounded hover:opacity-90"
                      aria-label="Toggle dark mode"
                    >
                      🌓
                    </button>
                  </div>
                </nav>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-surface-variant text-on-surface-variant py-6 mt-auto">
              <div className="container mx-auto px-4 text-center text-sm">
                <p>© 2025 Qetta Medical AI. FDA PCCP Compliant.</p>
                <p className="mt-2 text-xs">
                  Phase 1 Complete | Self-Healing Loop Active | Design Tokens Pipeline Integrated
                </p>
              </div>
            </footer>
          </div>
        </BannerProvider>
      </body>
    </html>
  );
}
