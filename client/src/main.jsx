import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import './index.css'
import App from './App.jsx'

// Provider order matters:
// - <BrowserRouter> must wrap anything that uses routing (Navbar's <Link>, etc.)
// - <AuthProvider> makes auth state available app-wide via useAuth()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <SettingsProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </SettingsProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
