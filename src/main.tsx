import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import './i18n'  // PRP-050: Initialize i18n
import { AppRouter } from './router.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './providers/ThemeProvider'
import { KeyboardSkinProvider } from './providers/KeyboardSkinProvider'
import { PowerUpProvider } from './providers/PowerUpProvider'
import { KeyboardLayoutProvider } from './providers/KeyboardLayoutProvider'
import { ColorModeProvider } from './providers/ColorModeProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { initializeGoogleTags } from './lib/gtag'

// Initialize Google Analytics & Ads (for visitor tracking and retargeting)
initializeGoogleTags()

// Initialize Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Wrapper component for providers
function Providers({ children }: { children: React.ReactNode }) {
  // If Convex/Clerk not configured, render without auth
  if (!convex || !clerkPubKey) {
    console.warn('Convex or Clerk not configured. Running in local-only mode.')
    return <>{children}</>
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthProvider>
          <ThemeProvider>
            <KeyboardSkinProvider>
              <KeyboardLayoutProvider>
                <PowerUpProvider>
                  {children}
                </PowerUpProvider>
              </KeyboardLayoutProvider>
            </KeyboardSkinProvider>
          </ThemeProvider>
        </AuthProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <ColorModeProvider>
          <BrowserRouter>
            <Providers>
              <AppRouter />
            </Providers>
          </BrowserRouter>
        </ColorModeProvider>
      </LanguageProvider>
    </HelmetProvider>
  </StrictMode>,
)
