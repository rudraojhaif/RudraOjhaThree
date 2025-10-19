import { useEffect, useState } from 'react'
import { MouseState } from '@/types'

export const useMouse = () => {
  const [mouseState, setMouseState] = useState<MouseState>({
    isPressed: false,
    button: -1,
    prevX: 0,
    prevY: 0,
    currentX: 0,
    currentY: 0
  })

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Left mouse button (0), Middle mouse button (1), or Right mouse button (2)
      if (event.button === 0 || event.button === 1 || event.button === 2) {
        setMouseState(prev => ({
          ...prev,
          isPressed: true,
          button: event.button,
          prevX: event.clientX,
          prevY: event.clientY,
          currentX: event.clientX,
          currentY: event.clientY
        }))

        document.body.style.cursor = 'grabbing'
        event.preventDefault()
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      setMouseState(prev => ({
        ...prev,
        isPressed: false,
        button: -1
      }))

      document.body.style.cursor = 'default'
    }

    const handleMouseMove = (event: MouseEvent) => {
      setMouseState(prev => ({
        ...prev,
        currentX: event.clientX,
        currentY: event.clientY
      }))
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault() // Prevent right-click context menu
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  const getDelta = () => {
    return {
      deltaX: mouseState.currentX - mouseState.prevX,
      deltaY: mouseState.currentY - mouseState.prevY
    }
  }

  const updatePrevPosition = () => {
    setMouseState(prev => ({
      ...prev,
      prevX: prev.currentX,
      prevY: prev.currentY
    }))
  }

  return {
    mouseState,
    getDelta,
    updatePrevPosition
  }
}