import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMouse } from './useMouse'
import { useKeyboard } from './useKeyboard'
import { CameraControls, ZoomState } from '@/types'
import {
  calculateCameraStartPosition,
  calculateCameraTarget,
  calculateRotationToScreen,
  MONITOR_CONFIG
} from '@/constants/monitorConfig'

export const useCameraControls = () => {
  const { camera } = useThree()
  const { mouseState, getDelta, updatePrevPosition } = useMouse()
  const keyboardState = useKeyboard()

  // Dynamically calculate initial camera position and rotation
  const initialPosition = calculateCameraStartPosition(2.5) // 2.5 meters from screen
  const initialTarget = calculateCameraTarget()
  const { rotationX: initialRotationX, rotationY: initialRotationY } =
    calculateRotationToScreen(initialPosition)

  const [cameraControls, setCameraControls] = useState<CameraControls>({
    position: initialPosition,
    target: initialTarget,
    rotationX: initialRotationX,
    rotationY: initialRotationY
  })

  // Calculate zoom position dynamically (closer to screen)
  const zoomedPosition = calculateCameraStartPosition(0.6) // 0.6 meters from screen (closer zoom)

  const [zoomState, setZoomState] = useState<ZoomState>({
    isZoomed: false,
    zoomedPosition,
    normalPosition: initialPosition.clone(),
    target: initialTarget.clone(),
    savedRotationX: initialRotationX,
    savedRotationY: initialRotationY
  })

  const animationRef = useRef<{
    isAnimating: boolean
    startTime: number
    duration: number
    startPosition: THREE.Vector3
    targetPosition: THREE.Vector3
    startTarget: THREE.Vector3
    targetTarget: THREE.Vector3
    startRotationX: number
    startRotationY: number
    targetRotationX: number
    targetRotationY: number
  } | null>(null)

  // Initialize camera position
  useEffect(() => {
    camera.position.copy(cameraControls.position)
    camera.lookAt(cameraControls.target)
  }, [])

  // Handle mouse controls
  useEffect(() => {
    if (mouseState.isPressed && !zoomState.isZoomed && !animationRef.current?.isAnimating) {
      const { deltaX, deltaY } = getDelta()

      if (mouseState.button === 2) { // Right mouse button - Rotation
        setCameraControls(prev => {
          const newRotationY = prev.rotationY - deltaX * 0.002
          const newRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.rotationX - deltaY * 0.002))

          return {
            ...prev,
            rotationX: newRotationX,
            rotationY: newRotationY
          }
        })

        updatePrevPosition()
      } else if (mouseState.button === 1) { // Middle mouse button - Panning
        const panSpeed = 0.003

        // Get camera's right and up vectors
        const right = new THREE.Vector3(1, 0, 0)
        const up = new THREE.Vector3(0, 1, 0)

        right.applyQuaternion(camera.quaternion)
        up.applyQuaternion(camera.quaternion)

        // Calculate pan offset
        const panX = right.clone().multiplyScalar(-deltaX * panSpeed)
        const panY = up.clone().multiplyScalar(deltaY * panSpeed)

        const newPosition = camera.position.clone().add(panX).add(panY)

        camera.position.copy(newPosition)

        updatePrevPosition()
      }
    }
  }, [mouseState.currentX, mouseState.currentY, mouseState.isPressed, zoomState.isZoomed, camera])

  // Handle scroll wheel (only when not zoomed - when zoomed, PDF scroll takes over)
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!zoomState.isZoomed && !animationRef.current?.isAnimating) {
        event.preventDefault()

        const forward = new THREE.Vector3(0, 0, -1)
        forward.applyQuaternion(camera.quaternion)

        const newPosition = camera.position.clone()
        if (event.deltaY < 0) {
          newPosition.addScaledVector(forward, 0.5)
        } else {
          newPosition.addScaledVector(forward, -0.5)
        }

        camera.position.copy(newPosition)
      }
      // When zoomed, don't prevent default - let PDF scroll handler take over
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [zoomState.isZoomed, camera])

  const animateCamera = (
    targetPosition: THREE.Vector3,
    targetTarget: THREE.Vector3,
    targetRotationX: number,
    targetRotationY: number
  ) => {
    const currentPosition = camera.position.clone()
    const currentTarget = cameraControls.target.clone()

    animationRef.current = {
      isAnimating: true,
      startTime: Date.now(),
      duration: 1000,
      startPosition: currentPosition,
      targetPosition: targetPosition.clone(),
      startTarget: currentTarget,
      targetTarget: targetTarget.clone(),
      startRotationX: cameraControls.rotationX,
      startRotationY: cameraControls.rotationY,
      targetRotationX,
      targetRotationY
    }
  }

  const toggleZoom = () => {
    const newZoomState = !zoomState.isZoomed

    if (newZoomState) {
      // Save current position and rotation before zooming in
      const savedPosition = camera.position.clone()
      const savedRotationX = cameraControls.rotationX
      const savedRotationY = cameraControls.rotationY

      // Calculate screen target dynamically
      const screenTarget = calculateCameraTarget()

      setZoomState(prev => ({
        ...prev,
        isZoomed: true,
        normalPosition: savedPosition,
        target: screenTarget,
        savedRotationX,
        savedRotationY
      }))

      // Zoom in - calculate rotation to look straight at monitor
      const { rotationX: zoomRotationX, rotationY: zoomRotationY } =
        calculateRotationToScreen(zoomState.zoomedPosition)

      animateCamera(
        zoomState.zoomedPosition,
        screenTarget,
        zoomRotationX,
        zoomRotationY
      )
    } else {
      // Restore saved position and rotation when zooming out
      setZoomState(prev => ({
        ...prev,
        isZoomed: false
      }))

      // Use the saved rotation values instead of recalculating
      animateCamera(
        zoomState.normalPosition,
        zoomState.target,
        zoomState.savedRotationX,
        zoomState.savedRotationY
      )
    }
  }

  // Animation and movement frame update
  useFrame(() => {
    // Handle camera animation
    if (animationRef.current?.isAnimating) {
      const elapsed = Date.now() - animationRef.current.startTime
      const progress = Math.min(elapsed / animationRef.current.duration, 1)

      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3)

      // Interpolate position
      const newPosition = new THREE.Vector3().lerpVectors(
        animationRef.current.startPosition,
        animationRef.current.targetPosition,
        eased
      )

      // Interpolate target
      const newTarget = new THREE.Vector3().lerpVectors(
        animationRef.current.startTarget,
        animationRef.current.targetTarget,
        eased
      )

      // Interpolate rotation
      const newRotationX = THREE.MathUtils.lerp(
        animationRef.current.startRotationX,
        animationRef.current.targetRotationX,
        eased
      )
      const newRotationY = THREE.MathUtils.lerp(
        animationRef.current.startRotationY,
        animationRef.current.targetRotationY,
        eased
      )

      camera.position.copy(newPosition)

      // Apply rotation instead of lookAt during animation
      camera.rotation.order = 'YXZ'
      camera.rotation.x = newRotationX
      camera.rotation.y = newRotationY

      setCameraControls(prev => ({
        ...prev,
        position: newPosition,
        target: newTarget,
        rotationX: newRotationX,
        rotationY: newRotationY
      }))

      if (progress >= 1) {
        animationRef.current.isAnimating = false
        animationRef.current = null
      }

      return // Skip normal movement during animation
    }

    // Handle keyboard movement
    if (!zoomState.isZoomed) {
      const speed = 0.1
      const direction = new THREE.Vector3()

      if (keyboardState.moveForward) direction.z += 1
      if (keyboardState.moveBackward) direction.z -= 1
      if (keyboardState.moveLeft) direction.x -= 1
      if (keyboardState.moveRight) direction.x += 1
      if (keyboardState.moveUp) direction.y += 1
      if (keyboardState.moveDown) direction.y -= 1

      if (direction.length() > 0) {
        direction.normalize()

        // Apply camera rotation to movement direction
        const forward = new THREE.Vector3(0, 0, -1)
        const right = new THREE.Vector3(1, 0, 0)
        const up = new THREE.Vector3(0, 1, 0)

        forward.applyQuaternion(camera.quaternion)
        right.applyQuaternion(camera.quaternion)

        const velocity = new THREE.Vector3()
        velocity.addScaledVector(right, direction.x * speed)
        velocity.addScaledVector(up, direction.y * speed)
        velocity.addScaledVector(forward, direction.z * speed)

        camera.position.add(velocity)
      }

      // Apply rotation
      camera.rotation.order = 'YXZ'
      camera.rotation.y = cameraControls.rotationY
      camera.rotation.x = cameraControls.rotationX
    }
  })

  return {
    cameraControls,
    zoomState,
    toggleZoom,
    isAnimating: animationRef.current?.isAnimating || false
  }
}