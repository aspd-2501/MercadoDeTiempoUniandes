import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MiembroSesionProvider } from './contextos/MiembroSesionContext.tsx'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MiembroSesionProvider>
        <App />
      </MiembroSesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
