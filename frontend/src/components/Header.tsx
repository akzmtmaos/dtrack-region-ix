import React from 'react'
import logo from '../assets/doh-logo.png'

const Header: React.FC = () => {
  return (
    <header 
      className="w-full shadow-md"
      style={{ backgroundColor: 'rgba(100, 154, 70)' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Department of Health Logo" 
                className="w-12 h-12 object-contain"
              />
            <div>
              <h1 className="text-xl font-bold text-white">
                DEPARTMENT OF HEALTH - ZPCHD DOCUMENT TRACKING 4.0
              </h1>
              <p className="text-sm text-white/90">
                ONLINE DOCUMENT TRACKING INFORMATION SYSTEM
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-white/80 transition-colors">
              header
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

