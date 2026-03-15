import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './i18n'
import { ThemeProvider } from './contexts/ThemeContext'
import { BackgroundVisibilityProvider } from '@toolbox/ui-kit'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-300">Loading...</div>}>
      <ThemeProvider>
        <BackgroundVisibilityProvider defaultVisible={true}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </BackgroundVisibilityProvider>
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>,
)
