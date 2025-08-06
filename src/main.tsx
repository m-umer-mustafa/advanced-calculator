import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'globalthis';
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeProvider'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="calculator-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
