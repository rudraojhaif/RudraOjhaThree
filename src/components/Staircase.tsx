import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { StaircaseParams } from '@/types/selection'

interface StaircaseProps {
  params: StaircaseParams
  isSelected: boolean
  onSelect: (e: any) => void
}

// Three.js: Y is up. All params used directly, no scaling.
export const buildStaircaseGroup = (params: StaircaseParams, isSelected = false): THREE.Group => {
  return createSpiralStaircase(params, isSelected)
}

const createSpiralStaircase = (params: StaircaseParams, isSelected: boolean): THREE.Group => {
  const group = new THREE.Group()

  const steps = Math.floor(params.steps)
  const rise = params.rise               // height per step (Y)
  const totalAngle = params.twist * (Math.PI / 180) // total spiral angle in radians
  const twistPerStep = totalAngle / steps
  const width = params.width             // radial extent of tread
  const depth = params.depth             // tangential extent of tread
  const colR = params.columnRadius       // column radius
  const thick = params.thickness         // tread slab thickness
  const railH = params.railHeight        // railing post height
  const railR = colR + width * 0.9       // handrail at outer edge of tread

  const totalHeight = steps * rise

  const mat = new THREE.MeshStandardMaterial({
    color: '#8898aa',
    metalness: 0.3,
    roughness: 0.6,
    emissive: isSelected ? '#00ffff' : '#000000',
    emissiveIntensity: isSelected ? 0.25 : 0,
  })

  // Central column — CylinderGeometry axis is Y (up) by default
  const colGeo = new THREE.CylinderGeometry(colR, colR, totalHeight + thick, 32)
  const column = new THREE.Mesh(colGeo, mat.clone())
  column.position.set(0, totalHeight / 2, 0)
  column.castShadow = true
  column.receiveShadow = true
  group.add(column)

  // Base disc at bottom
  const landGeo = new THREE.CylinderGeometry(colR + width, colR + width, thick, 32)
  const landing = new THREE.Mesh(landGeo, mat.clone())
  landing.position.set(0, thick / 2, 0)
  landing.castShadow = true
  landing.receiveShadow = true
  group.add(landing)

  // Spiral treads + railing posts
  for (let i = 0; i < steps; i++) {
    const angle = twistPerStep * i
    const yPos = rise * (i + 1)

    // Tread: flat horizontal slab
    // BoxGeometry(X, Y, Z) = (radial width, vertical thickness, tangential depth)
    const treadGeo = new THREE.BoxGeometry(width, thick, depth)
    const tread = new THREE.Mesh(treadGeo, mat.clone())

    // Position center of tread at the right radius and angle
    const r = colR + width / 2
    tread.position.set(
      Math.cos(angle) * r,
      yPos,
      Math.sin(angle) * r
    )
    // rotation.y = -angle makes local X axis point radially outward at this angle
    tread.rotation.y = -angle
    tread.castShadow = true
    tread.receiveShadow = true
    group.add(tread)

    // Railing post: thin vertical cylinder on outer edge of tread
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, railH, 8)
    const post = new THREE.Mesh(postGeo, mat.clone())
    post.position.set(
      Math.cos(angle) * railR,
      yPos + thick / 2 + railH / 2,
      Math.sin(angle) * railR
    )
    post.castShadow = true
    post.receiveShadow = true
    group.add(post)
  }

  // Handrail: helical tube connecting tops of all posts
  const handrailStartY = rise + thick / 2 + railH
  const handrailEndY = steps * rise + thick / 2 + railH

  const helixPts: THREE.Vector3[] = []
  const res = steps * 16
  for (let i = 0; i <= res; i++) {
    const t = i / res
    const a = totalAngle * t
    const y = handrailStartY + (handrailEndY - handrailStartY) * t
    helixPts.push(new THREE.Vector3(
      Math.cos(a) * railR,
      y,
      Math.sin(a) * railR
    ))
  }

  const helixCurve = new THREE.CatmullRomCurve3(helixPts, false)
  const handrailGeo = new THREE.TubeGeometry(helixCurve, res, 0.04, 8, false)
  const handrail = new THREE.Mesh(handrailGeo, mat.clone())
  handrail.castShadow = true
  group.add(handrail)

  // Ball endcaps at handrail start and end
  const ballGeo = new THREE.SphereGeometry(0.07, 12, 12)

  const startBall = new THREE.Mesh(ballGeo, mat.clone())
  startBall.position.set(railR, handrailStartY, 0)
  group.add(startBall)

  const endBall = new THREE.Mesh(ballGeo, mat.clone())
  endBall.position.set(
    Math.cos(totalAngle) * railR,
    handrailEndY,
    Math.sin(totalAngle) * railR
  )
  group.add(endBall)

  return group
}

export const Staircase = ({ params, isSelected, onSelect }: StaircaseProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [staircaseGroup, setStaircaseGroup] = useState<THREE.Group | null>(null)

  useEffect(() => {
    const staircase = createSpiralStaircase(params, isSelected)
    setStaircaseGroup(staircase)
  }, [params, isSelected])

  return (
    <group ref={groupRef} position={[0, 0, 0]} onClick={onSelect}>
      {staircaseGroup && <primitive object={staircaseGroup} />}
    </group>
  )
}
