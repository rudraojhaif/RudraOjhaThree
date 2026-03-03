import { useState } from 'react'
import { Html } from '@react-three/drei'

interface DownloadIconProps {
  position: [number, number, number]
  onExecute: () => void
  isVisible: boolean
}

export const DownloadIcon = ({ position, onExecute, isVisible }: DownloadIconProps) => {
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
          backgroundColor: isHovered ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
          border: isHovered ? '1px solid #ff6b35' : '1px solid transparent',
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
        {/* Icon with orange neon glow pulse */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#331a0a',
            border: '2px solid #ff6b35',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#ff6b35',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: isHovered
              ? '0 0 15px rgba(255, 107, 53, 0.8), 0 0 25px rgba(255, 107, 53, 0.5)'
              : '0 0 10px rgba(255, 107, 53, 0.4), 0 0 15px rgba(255, 107, 53, 0.2)'
          }}
        >
          🖨
        </div>
        {/* Label */}
        <div
          style={{
            marginTop: '6px',
            fontSize: '10px',
            color: '#ff6b35',
            fontFamily: '"Courier New", monospace',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: '500',
            textShadow: '0 0 8px rgba(255, 107, 53, 0.5)'
          }}
        >
          print.exe
        </div>
        {/* Click tooltip */}
        {isHovered && (
          <div
            style={{
              marginTop: '4px',
              fontSize: '9px',
              color: '#ff6b35',
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
