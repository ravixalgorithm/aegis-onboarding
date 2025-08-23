import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aegis Onboarding - AI-Powered Client Automation',
  description: 'Streamline your client onboarding process with AI-powered automation using Portia\'s controllable agent framework.',
  keywords: 'onboarding, automation, AI, client management, freelance, agency',
  authors: [{ name: 'Aegis Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
  openGraph: {
    title: 'Aegis Onboarding - AI-Powered Client Automation',
    description: 'Streamline your client onboarding process with AI-powered automation',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aegis Onboarding - AI-Powered Client Automation',
    description: 'Streamline your client onboarding process with AI-powered automation',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-sans">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {/* Background Pattern */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10">
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold gradient-text">
                        Aegis Onboarding
                      </h1>
                      <p className="text-xs text-gray-500">
                        AI-Powered Client Automation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>AgentHack 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      © 2024 Aegis Onboarding. Built for AgentHack 2024.
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Powered by Portia AI</span>
                    <span>•</span>
                    <span>Made with ❤️ for freelancers & agencies</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}