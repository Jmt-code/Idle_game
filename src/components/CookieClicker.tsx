import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import GoldenCookie from './GoldenCookie'
import './CookieClicker.css'

interface ClickEffect {
  id: number
  x: number
  y: number
  value: string
  isGolden?: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
}

function CookieClicker() {
  const { 
    cookies, 
    totalCookiesEarned,
    cookiesPerSecond, 
    click, 
    update, 
    recalculateCPS 
  } = useGameStore()

  const cookieRef = useRef<HTMLDivElement>(null)
  const [clicks, setClicks] = useState<ClickEffect[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [milestoneMessage, setMilestoneMessage] = useState('')

  useEffect(() => {
    // Inicializar CPS
    recalculateCPS()

    // Update loop cada 100ms
    const interval = setInterval(() => {
      update()
    }, 100)

    // Auto-save cada 10 segundos
    const saveInterval = setInterval(() => {
      // El guardado automático se hace mediante Zustand persist
      console.log('Auto-guardado...')
    }, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(saveInterval)
    }
  }, [update, recalculateCPS])

  // Achievement/milestone effect
  useEffect(() => {
    const milestones = [
      { value: 100, message: 'First hundred! 🎉' },
      { value: 1000, message: 'One thousand cookies! 🎊' },
      { value: 10000, message: '10,000 cookies! 🌟' },
      { value: 100000, message: '100K cookies! 💫' },
      { value: 1000000, message: 'ONE MILLION! 🏆' },
      { value: 10000000, message: '10 MILLION! 👑' },
    ]

    const milestone = milestones.find(m => 
      totalCookiesEarned >= m.value && 
      totalCookiesEarned < m.value + 100
    )

    if (milestone) {
      setMilestoneMessage(milestone.message)
      setTimeout(() => setMilestoneMessage(''), 3000)
    }
  }, [totalCookiesEarned])

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K'
    return Math.floor(num).toLocaleString()
  }

  const handleGoldenCookieClick = (bonus: number, x: number, y: number) => {
    const clickEffect: ClickEffect = {
      id: Date.now(),
      x,
      y,
      value: `+${formatNumber(bonus)}!`,
      isGolden: true
    }
    
    setClicks(prev => [...prev, clickEffect])
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== clickEffect.id))
    }, 2000)
  }

  const handleCookieClick = (e: React.MouseEvent) => {
    click()
    
    // Click animation
    if (cookieRef.current) {
      cookieRef.current.classList.remove('cookie-clicked')
      void cookieRef.current.offsetWidth // Trigger reflow
      cookieRef.current.classList.add('cookie-clicked')
    }

    // Floating number
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const clickEffect: ClickEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: '+1'
    }
    
    setClicks(prev => [...prev, clickEffect])
    
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== clickEffect.id))
    }, 1000)

    // Create particles
    createParticles(e.clientX, e.clientY)
  }

  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + Math.random() + i,
        x,
        y,
        rotation: Math.random() * 360
      })
    }
    setParticles(prev => [...prev, ...newParticles])
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 1000)
  }

  const getCookieGlow = () => {
    if (cookiesPerSecond > 10000) return 'cookie-glow-epic'
    if (cookiesPerSecond > 1000) return 'cookie-glow-legendary'
    if (cookiesPerSecond > 100) return 'cookie-glow-rare'
    return ''
  }

  return (
    <div className="cookie-clicker-container">
      {milestoneMessage && (
        <div className="milestone-message">
          {milestoneMessage}
        </div>
      )}

      <div className="game-info">
        <div className="cookie-count">
          <div className="cookie-icon">🍪</div>
          <div className="cookie-stats">
            <div className="cookie-amount">{formatNumber(cookies)}</div>
            <div className="cookie-label">cookies</div>
          </div>
        </div>
        <div className="production-info">
          <div className="cps">
            <span className="cps-label">per second:</span> 
            <span className="cps-value">{formatNumber(cookiesPerSecond)}</span>
          </div>
          <div className="total">
            <span className="total-label">total baked:</span>
            <span className="total-value">{formatNumber(totalCookiesEarned)}</span>
          </div>
        </div>
      </div>

      <div className="cookie-area">
        <GoldenCookie onGoldenClick={handleGoldenCookieClick} />
        
        <div 
          ref={cookieRef}
          className={`big-cookie ${getCookieGlow()}`}
          onClick={handleCookieClick}
        >
          🍪
        </div>
        {clicks.map(click => (
          <div
            key={click.id}
            className={`click-number ${click.isGolden ? 'golden-click' : ''}`}
            style={{ left: click.x, top: click.y }}
          >
            {click.value}
          </div>
        ))}
      </div>

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  )
}

export default CookieClicker
