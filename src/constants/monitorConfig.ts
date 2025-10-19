import * as THREE from 'three'
import { MonitorConfig } from '@/types'

/**
 * Monitor configuration - defines the screen position and orientation
 * Screen is a plane geometry positioned at [0, 1.75, 0.501]
 * The plane faces in the positive Z direction (toward the viewer)
 * Camera should be placed at higher Z values looking back in -Z direction
 */
export const MONITOR_CONFIG: MonitorConfig = {
  // Screen center position (from CRTMonitor.tsx line 75)
  screenPosition: new THREE.Vector3(0, 1.75, 0.501),

  // Screen normal vector (points toward the viewer, same as screen facing direction)
  // Adding this vector to screen position moves camera in front of screen
  screenNormal: new THREE.Vector3(0, 0, 1),

  // Screen rotation (no rotation for a front-facing plane)
  screenRotation: new THREE.Euler(0, 0, 0)
}

/**
 * Calculate the camera starting position
 * Places camera at a distance in front of the screen
 * @param distanceFromScreen - Distance in meters to place camera from screen
 */
export const calculateCameraStartPosition = (distanceFromScreen: number = 2.5): THREE.Vector3 => {
  // Start from screen position
  const cameraPosition = MONITOR_CONFIG.screenPosition.clone()

  // Move along the screen's normal vector (outward from screen)
  // Since screen faces +Z, we need to go in +Z direction to be in front
  cameraPosition.addScaledVector(MONITOR_CONFIG.screenNormal, distanceFromScreen)

  return cameraPosition
}

/**
 * Calculate the camera target (what the camera should look at)
 */
export const calculateCameraTarget = (): THREE.Vector3 => {
  // Look at the center of the screen
  return MONITOR_CONFIG.screenPosition.clone()
}

/**
 * Calculate rotation angles to look at the screen
 * @param cameraPosition - Current camera position
 */
export const calculateRotationToScreen = (cameraPosition: THREE.Vector3) => {
  const target = calculateCameraTarget()
  const direction = new THREE.Vector3().subVectors(target, cameraPosition).normalize()

  // For Three.js camera rotation in YXZ order:
  // rotationY is horizontal rotation (around Y axis)
  // rotationX is vertical rotation (around X axis, tilting up/down)
  const rotationY = Math.atan2(-direction.x, -direction.z)
  const rotationX = Math.asin(direction.y)

  return { rotationX, rotationY }
}
