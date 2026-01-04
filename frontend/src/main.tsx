import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { NavbarProvider } from './context/NavbarContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NavbarProvider>
          <App />
        </NavbarProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

