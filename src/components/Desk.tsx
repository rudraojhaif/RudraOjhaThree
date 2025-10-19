import { useRef } from 'react'
import { Group } from 'three'

interface LegPosition {
  x: number
  y: number
  id: string
}

interface DeskProps {
  legPositions?: LegPosition[]
}

export const Desk = ({ legPositions }: DeskProps) => {
  const groupRef = useRef<Group>(null)

  const deskMaterial = { color: '#8B4513' }

  // Desk dimensions
  const deskWidth = 3
  const deskDepth = 2

  // Convert parametric positions (0-1) to world positions
  const getWorldPosition = (leg: LegPosition): [number, number, number] => {
    // Origin at left-back corner
    // X: 0 = left edge (-1.5), 1 = right edge (1.5)
    // Y: 0 = back edge (-1), 1 = front edge (1)
    const worldX = (leg.x - 0.5) * deskWidth
    const worldZ = (leg.y - 0.5) * deskDepth
    return [worldX, 0, worldZ]
  }

  // Default leg positions if none provided
  const defaultLegs: LegPosition[] = [
    { x: 0.1, y: 0.1, id: '1' },
    { x: 0.9, y: 0.1, id: '2' },
    { x: 0.1, y: 0.9, id: '3' },
    { x: 0.9, y: 0.9, id: '4' }
  ]

  const legs = legPositions || defaultLegs

  return (
    <group ref={groupRef}>
      {/* Desk legs */}
      {legs.map((leg) => {
        const position = getWorldPosition(leg)
        return (
          <mesh key={leg.id} position={position} castShadow receiveShadow>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshLambertMaterial {...deskMaterial} />
          </mesh>
        )
      })}

      {/* Desk top */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskWidth, 0.1, deskDepth]} />
        <meshLambertMaterial {...deskMaterial} />
      </mesh>
    </group>
  )
}