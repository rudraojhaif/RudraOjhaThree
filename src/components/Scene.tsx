import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { Desk } from './Desk'
import { CRTMonitor } from './CRTMonitor'
import { DesktopIcon } from './DesktopIcon'
import { DownloadIcon } from './DownloadIcon'
import { Printer } from './Printer'
import { ParaTableHUD } from './ParaTableHUD'
import { useCameraControls } from '@/hooks/useCameraControls'
import { calculateCameraStartPosition } from '@/constants/monitorConfig'

interface LegPosition {
  x: number
  y: number
  id: string
}

interface SceneContentProps {
  onMatrixExecute: () => void
  onDownloadExecute: () => void
  isPrinting: boolean
  onPrintComplete: () => void
  isZoomed: boolean
  tableLegPositions: LegPosition[]
}

const SceneContent = ({ onMatrixExecute, onDownloadExecute, isPrinting, onPrintComplete, tableLegPositions }: Omit<SceneContentProps, 'isZoomed'>) => {
  const { toggleZoom, zoomState } = useCameraControls()

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Objects */}
      <Desk legPositions={tableLegPositions} />
      <CRTMonitor onClick={toggleZoom} isZoomed={zoomState.isZoomed} />
      <Printer position={[0.8, 1.05, 0]} isPrinting={isPrinting} onPrintComplete={onPrintComplete} />

      {/* Desktop Icon - positioned on top-right of monitor screen */}
      <DesktopIcon
        position={[0.42, 2.15, 0.502]}
        onExecute={onMatrixExecute}
        isVisible={true}
      />

      {/* Download Icon - positioned on top-left of monitor screen */}
      <DownloadIcon
        position={[-0.42, 2.15, 0.502]}
        onExecute={onDownloadExecute}
        isVisible={true}
      />
    </>
  )
}

export const Scene = () => {
  // Dynamically calculate camera starting position
  const startPosition = calculateCameraStartPosition(2.5)

  const [isParaTableHUDOpen, setIsParaTableHUDOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [tableLegPositions, setTableLegPositions] = useState<LegPosition[]>([
    { x: 0.1, y: 0.1, id: '1' },
    { x: 0.9, y: 0.1, id: '2' },
    { x: 0.1, y: 0.9, id: '3' },
    { x: 0.9, y: 0.9, id: '4' }
  ])

  const handleMatrixExecute = () => {
    // Toggle HUD on/off
    setIsParaTableHUDOpen(prev => !prev)
  }

  const handleCloseHUD = () => {
    setIsParaTableHUDOpen(false)
  }

  const handleLegsUpdate = (newLegs: LegPosition[]) => {
    setTableLegPositions(newLegs)
  }

  const handleDownloadExecute = () => {
    // Don't allow printing if already printing
    if (isPrinting) return

    // Start printer animation
    setIsPrinting(true)
  }

  const handlePrintComplete = () => {
    // Download the PDF file after animation completes
    const link = document.createElement('a')
    link.href = '/Rudra_Resume.pdf'
    link.download = 'Rudra_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Reset printing state
    setIsPrinting(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [startPosition.x, startPosition.y, startPosition.z]
        }}
        shadows
        gl={{
          antialias: true,
          shadowMap: {
            enabled: true,
            type: 2 // PCFSoftShadowMap
          }
        }}
        style={{ background: '#ffffff' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            onMatrixExecute={handleMatrixExecute}
            onDownloadExecute={handleDownloadExecute}
            isPrinting={isPrinting}
            onPrintComplete={handlePrintComplete}
            tableLegPositions={tableLegPositions}
          />
        </Suspense>
      </Canvas>

      {/* ParaTable HUD Overlay */}
      <ParaTableHUD
        isVisible={isParaTableHUDOpen}
        onClose={handleCloseHUD}
        onLegsUpdate={handleLegsUpdate}
        initialLegs={tableLegPositions}
      />
    </div>
  )
}