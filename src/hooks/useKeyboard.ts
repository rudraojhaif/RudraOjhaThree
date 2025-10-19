import { useEffect, useState } from 'react'
import { KeyboardState } from '@/types'

export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setKeyboardState(prev => ({ ...prev, moveForward: true }))
          break
        case 'KeyS':
          setKeyboardState(prev => ({ ...prev, moveBackward: true }))
          break
        case 'KeyA':
          setKeyboardState(prev => ({ ...prev, moveLeft: true }))
          break
        case 'KeyD':
          setKeyboardState(prev => ({ ...prev, moveRight: true }))
          break
        case 'KeyQ':
          setKeyboardState(prev => ({ ...prev, moveUp: true }))
          break
        case 'KeyE':
          setKeyboardState(prev => ({ ...prev, moveDown: true }))
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setKeyboardState(prev => ({ ...prev, moveForward: false }))
          break
        case 'KeyS':
          setKeyboardState(prev => ({ ...prev, moveBackward: false }))
          break
        case 'KeyA':
          setKeyboardState(prev => ({ ...prev, moveLeft: false }))
          break
        case 'KeyD':
          setKeyboardState(prev => ({ ...prev, moveRight: false }))
          break
        case 'KeyQ':
          setKeyboardState(prev => ({ ...prev, moveUp: false }))
          break
        case 'KeyE':
          setKeyboardState(prev => ({ ...prev, moveDown: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keyboardState
}