import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import * as THREE from 'three'

interface PrinterProps {
  position: [number, number, number]
  isPrinting: boolean
  onPrintComplete: () => void
}

interface SmokeParticle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
}

export const Printer = ({ position, isPrinting, onPrintComplete }: PrinterProps) => {
  const groupRef = useRef<Group>(null)
  const animationStartTime = useRef<number | null>(null)
  const originalY = useRef(position[1])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([])

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/assets/laserjet.wav')
  }, [])

  useEffect(() => {
    if (isPrinting) {
      animationStartTime.current = Date.now()

      // Play printer sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(err => console.log('Audio play failed:', err))
      }
    } else {
      // Clear all smoke particles when printing stops
      setSmokeParticles([])
    }
  }, [isPrinting])

  useFrame(() => {
    if (!groupRef.current || !isPrinting || animationStartTime.current === null) return

    const elapsed = (Date.now() - animationStartTime.current) / 1000 // seconds
    const duration = 5 // 5 seconds

    if (elapsed < duration) {
      // Cartoonish shake and bounce animation
      const shake = Math.sin(elapsed * 30) * 0.02 * (1 - elapsed / duration)
      const bounce = Math.abs(Math.sin(elapsed * 8)) * 0.05 * (1 - elapsed / duration)

      groupRef.current.position.x = position[0] + shake
      groupRef.current.position.y = originalY.current + bounce
      groupRef.current.rotation.z = shake * 0.5

      // Generate smoke particles periodically
      if (Math.random() < 0.3) { // 30% chance each frame
        // Get current printer position (including animation offset)
        const currentX = groupRef.current.position.x
        const currentY = groupRef.current.position.y
        const currentZ = groupRef.current.position.z

        const newParticle: SmokeParticle = {
          position: new THREE.Vector3(
            currentX + (Math.random() - 0.5) * 0.2,
            currentY + 0.35,
            currentZ + (Math.random() - 0.5) * 0.2
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            0.02 + Math.random() * 0.01,
            (Math.random() - 0.5) * 0.01
          ),
          life: 1,
          maxLife: 1,
          size: 0.02 + Math.random() * 0.03
        }
        setSmokeParticles(prev => [...prev, newParticle])
      }
    } else {
      // Reset position
      groupRef.current.position.set(position[0], position[1], position[2])
      groupRef.current.rotation.z = 0
      animationStartTime.current = null
      onPrintComplete()
    }

    // Update smoke particles
    setSmokeParticles(prev =>
      prev
        .map(particle => ({
          ...particle,
          position: particle.position.clone().add(particle.velocity),
          life: particle.life - 0.02,
          size: particle.size + 0.001 // Grow slightly
        }))
        .filter(particle => particle.life > 0) // Remove dead particles
    )
  })

  const printerMaterial = { color: '#404040' }
  const screenMaterial = { color: '#1a1a1a' }
  const buttonMaterial = { color: '#00aa00' }

  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <meshLambertMaterial {...printerMaterial} />
      </mesh>

      {/* Top scanner/lid */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.04, 0.35]} />
        <meshLambertMaterial color="#505050" />
      </mesh>

      {/* Front panel */}
      <mesh position={[0, 0.15, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.15, 0.01]} />
        <meshLambertMaterial {...screenMaterial} />
      </mesh>

      {/* Small display screen */}
      <mesh position={[0.1, 0.2, 0.185]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.04, 0.005]} />
        <meshLambertMaterial color={isPrinting ? '#00ff00' : '#003300'} />
      </mesh>

      {/* Button */}
      <mesh position={[-0.1, 0.2, 0.185]} castShadow receiveShadow>
        <boxGeometry args={[0.03, 0.03, 0.005]} />
        <meshLambertMaterial {...buttonMaterial} />
      </mesh>

      {/* Paper tray */}
      <mesh position={[0, 0.02, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.02, 0.15]} />
        <meshLambertMaterial color="#e0e0e0" />
      </mesh>

      {/* Paper output tray */}
      <mesh position={[0, 0.05, 0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.01, 0.08]} />
        <meshLambertMaterial color="#d0d0d0" />
      </mesh>

      {/* Paper coming out (only when printing) */}
      {isPrinting && animationStartTime.current !== null && (
        <mesh position={[0, 0.06, 0.26]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.01, 0.05]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Smoke particles - positioned relative to parent group */}
      {smokeParticles.map((particle, index) => {
        const opacity = particle.life / particle.maxLife
        // Calculate position relative to printer's base position
        const relativePos = new THREE.Vector3(
          particle.position.x - position[0],
          particle.position.y - position[1],
          particle.position.z - position[2]
        )
        return (
          <mesh key={index} position={relativePos}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshBasicMaterial
              color="#888888"
              transparent
              opacity={opacity * 0.5}
            />
          </mesh>
        )
      })}
    </group>
  )
}
