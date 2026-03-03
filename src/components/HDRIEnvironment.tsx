import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import * as THREE from 'three'

interface HDRIEnvironmentProps {
  hdriPath: string
}

export const HDRIEnvironment = ({ hdriPath }: HDRIEnvironmentProps) => {
  const { scene, gl } = useThree()

  useEffect(() => {
    let pmremGenerator: THREE.PMREMGenerator | null = null

    const loader = new HDRLoader()

    loader.load(
      hdriPath,
      (texture) => {
        try {
          // Create PMREMGenerator with proper renderer
          pmremGenerator = new THREE.PMREMGenerator(gl)
          const envMap = pmremGenerator.fromEquirectangular(texture).texture

          // Apply to scene
          scene.background = envMap
          scene.environment = envMap

          // Clean up
          texture.dispose()
          pmremGenerator.dispose()
        } catch (err) {
          console.error('Error processing HDRI:', err)
        }
      },
      undefined,
      (error) => {
        console.error('Failed to load HDRI:', error)
      }
    )

    return () => {
      if (pmremGenerator) {
        pmremGenerator.dispose()
      }
    }
  }, [hdriPath, scene, gl])

  return null
}
