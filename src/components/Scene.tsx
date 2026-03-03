import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useState, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import { CRTMonitor } from './CRTMonitor'
import { Printer } from './Printer'
import { Staircase, buildStaircaseGroup } from './Staircase'
import { HDRIEnvironment } from './HDRIEnvironment'
import { PropertiesPanel } from './PropertiesPanel'
import { SelectedObjectType, StaircaseParams, DEFAULT_STAIRCASE_PARAMS } from '@/types/selection'

interface SceneContentProps {
  selectedObject: SelectedObjectType
  onSelectObject: (obj: SelectedObjectType) => void
  isPrinting: boolean
  onPrintStart: () => void
  onPrintComplete: () => void
  staircaseParams: StaircaseParams
  onStaircaseParamChange: (key: keyof StaircaseParams, value: number) => void
}

const SceneContent = ({
  selectedObject,
  onSelectObject,
  isPrinting,
  onPrintStart,
  onPrintComplete,
  staircaseParams,
}: SceneContentProps) => {
  const { camera } = useThree()
  const orbitControlsRef = useRef<any>(null)
  const monitorRef = useRef<THREE.Group>(null)
  const printerRef = useRef<THREE.Group>(null)
  const printerAnimationRef = useRef<{ elapsed: number; duration: number } | null>(null)
  const zoomAnimationRef = useRef<{ progress: number; targetPos: THREE.Vector3; startPos: THREE.Vector3; targetObject: THREE.Vector3 } | null>(null)
  const [collisionActive, setCollisionActive] = useState(false)
  const collisionTimeRef = useRef(0)

  // Staircase: Y is up, no scaling, params used directly.
  const staircaseTopY = staircaseParams.steps * staircaseParams.rise
  const staircaseOuterRadius = staircaseParams.columnRadius + staircaseParams.width
  // Top of the railing posts is the actual highest geometry
  const geometryTop = staircaseTopY + staircaseParams.thickness / 2 + staircaseParams.railHeight

  // Lift monitor and printer just above the railing
  const MONITOR_POS = new THREE.Vector3(staircaseOuterRadius + 0.5, geometryTop + 0.5, 0)
  const PRINTER_BASE_POS = new THREE.Vector3(-(staircaseOuterRadius + 0.3), geometryTop + 0.3, 0.3)

  // Keep refs so useFrame always has latest values (avoids stale closure)
  const monitorPosRef = useRef(MONITOR_POS)
  monitorPosRef.current = MONITOR_POS
  const printerBasePosRef = useRef(PRINTER_BASE_POS)
  printerBasePosRef.current = PRINTER_BASE_POS

  const ZOOM_DISTANCE = 6

  useFrame(() => {
    // Monitor looks at camera — screen faces +Z by default, so rotate around Y only
    if (monitorRef.current && camera) {
      const mp = monitorPosRef.current
      const dx = camera.position.x - mp.x
      const dz = camera.position.z - mp.z
      if (Math.abs(dx) + Math.abs(dz) > 0.001) {
        const angle = Math.atan2(dx, dz) // Y-rotation so +Z points toward camera
        const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
        monitorRef.current.quaternion.slerp(targetQuat, 0.05)
      }
    }

    // Printer wobble
    if (printerRef.current) {
      const t = Date.now() * 0.001
      const base = printerBasePosRef.current
      printerRef.current.position.set(
        base.x + Math.sin(t * 2) * 0.15,
        base.y + Math.cos(t * 3) * 0.1,
        base.z + Math.sin(t * 1.5) * 0.1
      )
      printerRef.current.rotation.y += 0.01
      printerRef.current.rotation.x = Math.sin(t) * 0.2
    }

    // Printer animation timer
    if (printerAnimationRef.current) {
      printerAnimationRef.current.elapsed += 1 / 60
      if (printerAnimationRef.current.elapsed >= printerAnimationRef.current.duration) {
        onPrintComplete()
        printerAnimationRef.current = null
      }
    }

    // Smooth zoom to selected object
    if (zoomAnimationRef.current) {
      zoomAnimationRef.current.progress += 0.05
      if (zoomAnimationRef.current.progress >= 1) {
        zoomAnimationRef.current = null
      } else {
        const eased = 1 - Math.pow(1 - zoomAnimationRef.current.progress, 3)
        camera.position.lerpVectors(zoomAnimationRef.current.startPos, zoomAnimationRef.current.targetPos, eased)
        camera.lookAt(zoomAnimationRef.current.targetObject)
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.lerpVectors(
            orbitControlsRef.current.target,
            zoomAnimationRef.current.targetObject,
            eased
          )
          orbitControlsRef.current.update()
        }
      }
    }

    // Collision detection between monitor and printer
    if (monitorRef.current && printerRef.current) {
      const dist = monitorRef.current.position.distanceTo(printerRef.current.position)
      if (dist < 0.8) {
        if (!collisionActive) {
          setCollisionActive(true)
          collisionTimeRef.current = 0
        }
      } else {
        setCollisionActive(false)
      }
      if (collisionActive) {
        collisionTimeRef.current += 1 / 60
        if (collisionTimeRef.current > 0.5) setCollisionActive(false)
      }
    }
  })

  const triggerZoomAnimation = (targetObjectPos: THREE.Vector3) => {
    const direction = new THREE.Vector3().subVectors(camera.position, targetObjectPos).normalize()
    const targetPos = targetObjectPos.clone().addScaledVector(direction, ZOOM_DISTANCE)
    zoomAnimationRef.current = {
      progress: 0,
      startPos: camera.position.clone(),
      targetPos,
      targetObject: targetObjectPos.clone()
    }
  }

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        zoomToCursor
        enablePan
        enableRotate
        enableZoom
        minDistance={0.5}
        maxDistance={80}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        makeDefault
      />

      <HDRIEnvironment hdriPath={`${import.meta.env.BASE_URL}earthlike_planet.hdr`} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      {/* Parametric Staircase */}
      <Staircase
        params={staircaseParams}
        isSelected={selectedObject === 'staircase'}
        onSelect={(e: any) => { e.stopPropagation(); onSelectObject('staircase') }}
      />

      {/* Monitor — positioned at top of staircase, screen faces +Z, rotated in useFrame to face camera */}
      <group
        ref={monitorRef}
        position={[MONITOR_POS.x, MONITOR_POS.y, MONITOR_POS.z]}
      >
        <CRTMonitor
          isZoomed={false}
          isSelected={selectedObject === 'monitor'}
          onClick={() => { onSelectObject('monitor'); triggerZoomAnimation(MONITOR_POS) }}
        />
      </group>

      {/* Printer — position driven by useFrame */}
      <group
        ref={printerRef}
        onClick={(e) => { e.stopPropagation(); onSelectObject('printer'); triggerZoomAnimation(PRINTER_BASE_POS) }}
      >
        <Printer position={[0, 0, 0]} isPrinting={isPrinting} onPrintComplete={onPrintComplete} isSelected={selectedObject === 'printer'} onClick={() => {}} />
      </group>

      {/* Collision BANG effect */}
      {collisionActive && (
        <mesh position={[0, staircaseTopY + 1, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}BANGComic.jpg`)} transparent />
        </mesh>
      )}
    </>
  )
}

const PARAMS_CACHE_KEY = 'rudra_staircase_params'

const loadCachedParams = (): StaircaseParams => {
  try {
    const stored = localStorage.getItem(PARAMS_CACHE_KEY)
    if (stored) return { ...DEFAULT_STAIRCASE_PARAMS, ...JSON.parse(stored) }
  } catch {}
  return DEFAULT_STAIRCASE_PARAMS
}

export const Scene = () => {
  const [selectedObject, setSelectedObject] = useState<SelectedObjectType>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [staircaseParams, setStaircaseParams] = useState<StaircaseParams>(loadCachedParams)
  const [showPDF, setShowPDF] = useState(false)

  const handlePrintComplete = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}RudraPublic.pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'Rudra_Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
    setIsPrinting(false)
  }

  const handleExportOBJ = () => {
    const group = buildStaircaseGroup(staircaseParams)
    group.updateMatrixWorld(true) // bake all local positions/rotations into matrixWorld
    const exporter = new OBJExporter()
    const objString = exporter.parse(group)
    const blob = new Blob([objString], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'staircase.obj'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    // Dispose geometries
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
    })
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{
          fov: 60,
          near: 0.1,
          far: 2000,
          position: [8, 10, 20]
        }}
        shadows
        gl={{ antialias: true }}
        style={{ background: '#000000' }}
        onPointerMissed={() => setSelectedObject(null)}
      >
        <Suspense fallback={null}>
          <SceneContent
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            isPrinting={isPrinting}
            onPrintStart={() => setIsPrinting(true)}
            onPrintComplete={handlePrintComplete}
            staircaseParams={staircaseParams}
            onStaircaseParamChange={(key, value) => setStaircaseParams(prev => {
              const next = { ...prev, [key]: value }
              try { localStorage.setItem(PARAMS_CACHE_KEY, JSON.stringify(next)) } catch {}
              return next
            })}
          />
        </Suspense>
      </Canvas>

      <PropertiesPanel
        selectedObject={selectedObject}
        staircaseParams={staircaseParams}
        onStaircaseParamChange={(key, value) => setStaircaseParams(prev => {
          const next = { ...prev, [key]: value }
          try { localStorage.setItem(PARAMS_CACHE_KEY, JSON.stringify(next)) } catch {}
          return next
        })}
        onPrintDocument={() => setIsPrinting(true)}
        onExportOBJ={handleExportOBJ}
        onViewPDF={() => setShowPDF(true)}
      />

      {/* PDF Overlay */}
      {showPDF && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '80vw', height: '90vh' }}>
            <button
              onClick={() => setShowPDF(false)}
              style={{
                position: 'absolute', top: -38, right: 0,
                background: '#303040', border: '1px solid #505060',
                color: '#fff', padding: '6px 16px',
                fontFamily: '"Courier New", monospace',
                fontSize: '12px', cursor: 'pointer', borderRadius: '4px'
              }}
            >
              ✕ CLOSE
            </button>
            <iframe
              src={`${import.meta.env.BASE_URL}RudraPublic.pdf`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
              title="Resume PDF"
            />
          </div>
        </div>
      )}
    </div>
  )
}
