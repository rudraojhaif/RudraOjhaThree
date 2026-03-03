import { useState, useEffect } from 'react'

interface MobileWarningProps {
  onContinue: () => void
}

export const MobileWarning = ({ onContinue }: MobileWarningProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03), rgba(0, 255, 0, 0.03) 1px, transparent 1px, transparent 2px)',
        color: '#00ff00',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        padding: '20px',
        zIndex: 10000,
        overflow: 'auto',
        textShadow: '0 0 10px rgba(0, 255, 0, 0.5)'
      }}
    >
      <div style={{ maxWidth: '600px' }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
{`SPACE ARCHITECT SYSTEM v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C:\\SPACE\\> rudra_portfolio.exe

INFO: Touch Device Detected
──────────────────────────

Great! This site works on mobile and tablets.
The Space CAD experience is fully touch-enabled.

TOUCH CONTROLS:
  • 1 Finger Drag: Rotate camera
  • 2 Finger Pinch: Zoom (follows cursor)
  • 2 Finger Drag: Pan camera
  • Tap Icons: Execute commands
  • Swipe HUD: Collapse/expand on small screens

For a larger screen experience, try on desktop.

Ready to explore? `}
        </pre>
        <span
          onClick={onContinue}
          style={{
            color: '#00ff00',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(0, 255, 0, 0.7)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00ff00'
            e.currentTarget.style.backgroundColor = '#003300'
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#00ff00'
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          enter
        </span>
      </div>
    </div>
  )
}

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      // Check user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))

      // Check screen size (mobile typically < 768px width)
      const isMobileScreen = window.innerWidth < 768

      // Check touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      // Consider it mobile if user agent matches OR (small screen AND touch capable)
      setIsMobile(isMobileUA || (isMobileScreen && isTouchDevice))
    }

    checkIfMobile()

    // Recheck on resize
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return isMobile
}
