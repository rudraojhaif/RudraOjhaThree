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
        color: '#00ff00',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        padding: '20px',
        zIndex: 10000,
        overflow: 'auto'
      }}
    >
      <div style={{ maxWidth: '600px' }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
{`Microsoft Windows [Version 10.0.19045.0]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\Guest> rudra_portfolio.exe

WARNING: Mobile Device Detected
--------------------------------

This website is optimized for desktop viewing and may not
function properly on mobile devices.

Features requiring mouse interaction:
  - 3D scene navigation (right-click to rotate)
  - PDF scrolling within monitor
  - Interactive table leg positioning
  - Printer animation and downloads

For the best experience, please visit this site on a PC.

Do you still want to continue? `}
        </pre>
        <span
          onClick={onContinue}
          style={{
            color: '#00ff00',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00ff00'
            e.currentTarget.style.backgroundColor = '#003300'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#00ff00'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          yes
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
