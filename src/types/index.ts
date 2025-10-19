import * as THREE from 'three'

export interface CameraControls {
  position: THREE.Vector3
  target: THREE.Vector3
  rotationX: number
  rotationY: number
}

export interface MouseState {
  isPressed: boolean
  button: number
  prevX: number
  prevY: number
  currentX: number
  currentY: number
}

export interface KeyboardState {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  moveUp: boolean
  moveDown: boolean
}

export interface ZoomState {
  isZoomed: boolean
  zoomedPosition: THREE.Vector3
  normalPosition: THREE.Vector3
  target: THREE.Vector3
  savedRotationX: number
  savedRotationY: number
}

export interface LoadingMessage {
  text: string
  delay?: number
}

export interface MonitorConfig {
  screenPosition: THREE.Vector3
  screenNormal: THREE.Vector3  // Front-facing direction
  screenRotation: THREE.Euler
}