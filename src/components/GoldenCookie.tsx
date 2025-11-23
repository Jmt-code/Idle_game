import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import './GoldenCookie.css'

interface GoldenCookieProps {
  onGoldenClick: (bonus: number, x: number, y: number) => void
}

function GoldenCookie({ onGoldenClick }: GoldenCookieProps) {
  const { clickGoldenCookie } = useGameStore()
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      if (!visible && Math.random() < 0.05) { // 5% chance every second
        const x = Math.random() * (window.innerWidth - 100)
        const y = Math.random() * (window.innerHeight - 100)
        setPosition({ x, y })
        setVisible(true)
        
        // Disappear after 13 seconds
        setTimeout(() => {
          setVisible(false)
        }, 13000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [visible])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const bonus = clickGoldenCookie()
    setVisible(false)
    
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top
    
    onGoldenClick(bonus, x, y)
  }

  if (!visible) return null

  return (
    <div 
      className="golden-cookie"
      style={{ left: position.x, top: position.y }}
      onClick={handleClick}
    >
      🍪
    </div>
  )
}

export default GoldenCookie
