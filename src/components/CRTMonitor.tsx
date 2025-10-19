import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import * as THREE from 'three'
import { PDFRenderer } from '@/utils/pdfRenderer'

interface CRTMonitorProps {
  onClick?: () => void
  isZoomed?: boolean
}

export const CRTMonitor = ({ onClick, isZoomed = false }: CRTMonitorProps) => {
  const groupRef = useRef<Group>(null)
  const screenRef = useRef<Mesh>(null)
  const [screenMaterial, setScreenMaterial] = useState<THREE.ShaderMaterial | null>(null)
  const flickerTimeRef = useRef(0)
  const pdfRendererRef = useRef<PDFRenderer | null>(null)
  const { gl } = useThree()

  const monitorMaterial = { color: '#333333' }

  // Handle scroll when zoomed
  useEffect(() => {
    if (!isZoomed) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (pdfRendererRef.current) {
        pdfRendererRef.current.scroll(event.deltaY * 0.5)
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [isZoomed, gl])

  useEffect(() => {
    const loadPDF = async () => {
      const pdfRenderer = new PDFRenderer()
      pdfRendererRef.current = pdfRenderer

      try {
        const texture = await pdfRenderer.loadPDF('/RudraPublic.pdf')

        // Create shader material with flickering effect
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uTime: { value: 0 },
            uFlickerIntensity: { value: 0.15 }, // Increased flicker intensity for visibility
            uBrightness: { value: 1.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uFlickerIntensity;
            uniform float uBrightness;
            varying vec2 vUv;

            // Random function for flicker
            float random(float seed) {
              return fract(sin(seed * 12.9898) * 43758.5453);
            }

            void main() {
              vec4 texColor = texture2D(uTexture, vUv);

              // Create flickering effect with multiple frequency components
              float flicker1 = (random(floor(uTime * 10.0)) - 0.5) * uFlickerIntensity * 2.0;
              float flicker2 = (random(floor(uTime * 30.0)) - 0.5) * uFlickerIntensity;
              float flicker3 = sin(uTime * 60.0) * uFlickerIntensity * 0.5;

              // Occasional strong flicker
              float strongFlicker = random(floor(uTime * 2.0));
              if (strongFlicker > 0.95) {
                flicker1 *= 2.5;
              }

              float totalFlicker = 1.0 + flicker1 + flicker2 + flicker3;

              // Apply flicker and brightness
              vec3 finalColor = texColor.rgb * totalFlicker * uBrightness;

              gl_FragColor = vec4(finalColor, texColor.a);
            }
          `,
          transparent: false
        })

        setScreenMaterial(material)
      } catch (error) {
        console.error('Failed to load PDF:', error)

        // Fallback material
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 384
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#00ff00'
        ctx.font = '16px Courier New'
        ctx.textAlign = 'center'
        ctx.fillText('PDF Load Failed', canvas.width / 2, canvas.height / 2)

        const fallbackTexture = new THREE.CanvasTexture(canvas)

        // Create shader material for fallback too
        const fallbackMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: fallbackTexture },
            uTime: { value: 0 },
            uFlickerIntensity: { value: 0.15 },
            uBrightness: { value: 1.0 }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uTime;
            uniform float uFlickerIntensity;
            uniform float uBrightness;
            varying vec2 vUv;

            float random(float seed) {
              return fract(sin(seed * 12.9898) * 43758.5453);
            }

            void main() {
              vec4 texColor = texture2D(uTexture, vUv);

              float flicker1 = (random(floor(uTime * 10.0)) - 0.5) * uFlickerIntensity * 2.0;
              float flicker2 = (random(floor(uTime * 30.0)) - 0.5) * uFlickerIntensity;
              float flicker3 = sin(uTime * 60.0) * uFlickerIntensity * 0.5;

              float strongFlicker = random(floor(uTime * 2.0));
              if (strongFlicker > 0.95) {
                flicker1 *= 2.5;
              }

              float totalFlicker = 1.0 + flicker1 + flicker2 + flicker3;
              vec3 finalColor = texColor.rgb * totalFlicker * uBrightness;
              gl_FragColor = vec4(finalColor, texColor.a);
            }
          `,
          transparent: false
        })

        setScreenMaterial(fallbackMaterial)
      }
    }

    loadPDF()
  }, [])

  // Animate the flicker effect
  useFrame((state, delta) => {
    if (screenMaterial && screenMaterial.uniforms) {
      flickerTimeRef.current += delta
      screenMaterial.uniforms.uTime.value = flickerTimeRef.current
    }
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Monitor base */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshLambertMaterial {...monitorMaterial} />
      </mesh>

      {/* CRT Monitor body */}
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshLambertMaterial {...monitorMaterial} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 1.75, 0.501]}>
        <planeGeometry args={[1, 0.75]} />
        {screenMaterial ? (
          <primitive object={screenMaterial} />
        ) : (
          <meshBasicMaterial color="#000000" />
        )}
      </mesh>
    </group>
  )
}