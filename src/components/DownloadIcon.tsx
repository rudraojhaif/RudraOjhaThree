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
          backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          border: isHovered ? '1px solid #d0d0d0' : '1px solid transparent',
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
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#ffffff',
            border: '2px solid #cccccc',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#333333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            boxShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          🖨
        </div>
        {/* Label */}
        <div
          style={{
            marginTop: '6px',
            fontSize: '11px',
            color: '#333333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: '500'
          }}
        >
          print.exe
        </div>
      </div>
    </Html>
  )
}
