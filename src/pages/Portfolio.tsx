import { useState } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Scene } from '@/components/Scene'

export const Portfolio = () => {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {!isLoading && <Scene />}
    </>
  )
}