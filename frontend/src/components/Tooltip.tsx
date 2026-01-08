import React, { useRef, useState, useEffect, useCallback } from 'react'

interface TooltipProps {
  text: string
  isMinimized: boolean
  children: React.ReactNode
  verticalOffset?: number // Adjust vertical position (positive = down, negative = up)
}

const Tooltip: React.FC<TooltipProps> = ({ text, isMinimized, children, verticalOffset = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (wrapperRef.current && isMinimized) {
      // Get the actual child element (Link or button) inside the wrapper
      const childElement = wrapperRef.current.firstElementChild as HTMLElement
      if (childElement) {
        const rect = childElement.getBoundingClientRect()
        // Center the tooltip vertically with the button/Link element
        // The getBoundingClientRect gives us the exact position including padding
        const centerY = rect.top + (rect.height / 2)
        const rightX = rect.right + 8
        setPosition({
          top: centerY,
          left: rightX
        })
      }
    }
  }, [isMinimized])

  useEffect(() => {
    if (isHovered && isMinimized) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        updatePosition()
      })
      // Update on scroll
      const handleScroll = () => updatePosition()
      window.addEventListener('scroll', handleScroll, true)
      // Also update periodically in case of other layout changes
      const interval = setInterval(updatePosition, 100)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        clearInterval(interval)
      }
    }
  }, [isHovered, isMinimized, updatePosition])

  if (!isMinimized) {
    return <>{children}</>
  }

  return (
    <>
      <div 
        ref={wrapperRef}
        className="relative w-full"
        style={{ display: 'block' }}
        onMouseEnter={() => {
          setIsHovered(true)
          // Use double requestAnimationFrame to ensure DOM is fully rendered and measured
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              updatePosition()
            })
          })
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
      {isHovered && position.top > 0 && (
        <div 
          className="fixed px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[9999] shadow-lg pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: `translateY(calc(-50% + ${verticalOffset}px))`
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

