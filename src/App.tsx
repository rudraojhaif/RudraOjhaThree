import { useState } from 'react'
import { Portfolio } from '@/pages/Portfolio'
import { MobileWarning, useIsMobile } from '@/components/MobileWarning'
import './App.css'

function App() {
  const isMobile = useIsMobile()
  const [hasAcceptedMobileWarning, setHasAcceptedMobileWarning] = useState(false)

  const handleContinue = () => {
    setHasAcceptedMobileWarning(true)
  }

  // Show warning if mobile and hasn't accepted yet
  if (isMobile && !hasAcceptedMobileWarning) {
    return <MobileWarning onContinue={handleContinue} />
  }

  return (
    <div className="App">
      <Portfolio />
    </div>
  )
}

export default App