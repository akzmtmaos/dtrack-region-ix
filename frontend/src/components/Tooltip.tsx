import React, { useRef, useState, useEffect } from 'react'

interface TooltipProps {
  text: string
  isMinimized: boolean
  children: React.ReactNode
  verticalOffset?: number // Adjust vertical position (positive = down, negative = up)
}

const Tooltip: React.FC<TooltipProps> = ({ text, isMinimized, children, verticalOffset = -10 }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (containerRef.current && isMinimized) {
      const rect = containerRef.current.getBoundingClientRect()
      // Center the tooltip vertically with the icon, with optional offset adjustment
      setPosition({
        top: rect.top + rect.height / 2 + verticalOffset,
        left: rect.right + 8
      })
    }
  }

  useEffect(() => {
    if (isHovered) {
      updatePosition()
      const interval = setInterval(updatePosition, 100)
      return () => clearInterval(interval)
    }
  }, [isHovered, isMinimized])

  if (!isMinimized) {
    return <>{children}</>
  }

  return (
    <>
      <div 
        ref={containerRef}
        className="relative"
        onMouseEnter={() => {
          setIsHovered(true)
          updatePosition()
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
      {isHovered && (
        <div 
          className="fixed px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[9999] shadow-lg pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {text}
          {/* Arrow pointing left */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
        </div>
      )}
    </>
  )
}

export default Tooltip

