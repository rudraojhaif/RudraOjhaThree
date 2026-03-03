import { useState } from 'react'
import { Html } from '@react-three/drei'

interface DesktopIconProps {
  position: [number, number, number]
  onExecute: () => void
  isVisible: boolean
}

export const DesktopIcon = ({ position, onExecute, isVisible }: DesktopIconProps) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!isVisible) return null

  return (
    <Html
      position={position}
      center
      distanceFactor={0.3}
      transform
      occlude
      style={{
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px',
          backgroundColor: isHovered ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
          border: isHovered ? '1px solid #00ffff' : '1px solid transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onExecute()
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          onExecute()
        }}
      >
        {/* Icon with neon glow pulse */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#001a33',
            border: '2px solid #00ffff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#00ffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: isHovered
              ? '0 0 15px rgba(0, 255, 255, 0.8), 0 0 25px rgba(0, 255, 255, 0.5)'
              : '0 0 10px rgba(0, 255, 255, 0.4), 0 0 15px rgba(0, 255, 255, 0.2)',
            animation: 'none'
          }}
        >
          M
        </div>
        {/* Label */}
        <div
          style={{
            marginTop: '6px',
            fontSize: '10px',
            color: '#00ffff',
            fontFamily: '"Courier New", monospace',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: '500',
            textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
          }}
        >
          matrix.exe
        </div>
        {/* Click tooltip */}
        {isHovered && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '9px',
              color: '#00ffff',
              fontFamily: '"Courier New", monospace',
              opacity: 0.7
            }}
          >
            ↑ CLICK
          </div>
        )}
      </div>
    </Html>
  )
}
