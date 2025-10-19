import { useState, useEffect } from 'react'
import { loadingMessages } from '@/utils/loadingMessages'
import './LoadingScreen.css'

interface LoadingScreenProps {
  onComplete: () => void
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(false)

  useEffect(() => {
    if (currentIndex < loadingMessages.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, loadingMessages[currentIndex].text])
        setCurrentIndex(prev => prev + 1)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      // Show cursor and complete after delay
      const cursorTimer = setTimeout(() => {
        setShowCursor(true)
        const completeTimer = setTimeout(() => {
          onComplete()
        }, 2000)

        return () => clearTimeout(completeTimer)
      }, 1000)

      return () => clearTimeout(cursorTimer)
    }
  }, [currentIndex, onComplete])

  return (
    <div className="loading-screen">
      <div className="terminal">
        {displayedMessages.map((message, index) => (
          <div key={index} className="terminal-line">
            {message}
          </div>
        ))}
        {showCursor && <span className="cursor"></span>}
      </div>
    </div>
  )
}