import { useState, useRef, useEffect } from 'react'
import { useGameStore, Building } from '../store/gameStore'
import './BuildingCard.css'

interface BuildingCardProps {
  building: Building
}

function BuildingCard({ building }: BuildingCardProps) {
  const { 
    cookies, 
    buildings, 
    buyBuilding, 
    getBuildingCost,
    purchaseMultiplier,
    getMaxAffordable,
    cookiesPerSecond
  } = useGameStore()

  const [hovered, setHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const tooltipHeight = 200 // Approximate
      const spaceAbove = rect.top
      
      // If not enough space above, show below
      if (spaceAbove < tooltipHeight) {
        setTooltipPosition('bottom')
      } else {
        setTooltipPosition('top')
      }
    }
  }, [hovered])

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K'
    return Math.floor(num).toLocaleString()
  }

  const getTooltipInfo = () => {
    const buildingData = buildings[building.id]
    const owned = buildingData.owned
    const currentProduction = building.baseProduction * owned
    const cost = getBuildingCost(building.id)
    
    let amount = purchaseMultiplier === 'max' ? getMaxAffordable(building.id) : purchaseMultiplier
    if (purchaseMultiplier === 'max' && amount === 0) {
      amount = 1
    }

    const nextProduction = building.baseProduction * (owned + (amount as number))
    const productionIncrease = nextProduction - currentProduction

    return {
      owned,
      currentProduction,
      cost,
      amount,
      nextProduction,
      productionIncrease
    }
  }

  const buildingData = buildings[building.id]
  if (!buildingData) return null

  const isUnlocked = buildingData.unlocked
  const cost = getBuildingCost(building.id)
  const canAfford = cookies >= cost && cost > 0
  const owned = buildingData.owned
  const production = building.baseProduction * owned
  const maxAffordable = getMaxAffordable(building.id)

  const tooltipInfo = getTooltipInfo()

  return (
    <div
      ref={cardRef}
      className={`building-card ${!isUnlocked ? 'locked' : ''} ${!canAfford ? 'unaffordable' : ''}`}
      onClick={() => isUnlocked && canAfford && buyBuilding(building.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="building-icon">{building.icon}</div>
      
      <div className="building-info">
        <div className="building-header">
          <div className="building-name">{building.name}</div>
          <div className="building-owned">{owned}</div>
        </div>
        
        <div className="building-description">{building.description}</div>
        
        <div className="building-stats">
          <div className="building-cost">
            {isUnlocked ? (
              <>
                🍪 {formatNumber(cost)}
                {purchaseMultiplier === 'max' && maxAffordable > 0 && (
                  <span className="max-amount"> (x{maxAffordable})</span>
                )}
              </>
            ) : (
              '🔒 Locked'
            )}
          </div>
          
          {owned > 0 && (
            <div className="building-production">
              📈 {formatNumber(production)}/s
              <span className="production-percentage">
                ({cookiesPerSecond > 0 ? ((production / cookiesPerSecond) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hovered && isUnlocked && (
        <div className={`building-tooltip tooltip-${tooltipPosition}`}>
          <div className="tooltip-header">
            <span className="tooltip-icon">{building.icon}</span>
            <span className="tooltip-title">{building.name}</span>
          </div>
          
          <div className="tooltip-divider"></div>
          
          <div className="tooltip-section">
            <div className="tooltip-row">
              <span className="tooltip-label">Current amount:</span>
              <span className="tooltip-value">{tooltipInfo.owned}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Current production:</span>
              <span className="tooltip-value highlight-green">
                {formatNumber(tooltipInfo.currentProduction)}/s
              </span>
            </div>
          </div>

          {tooltipInfo.amount > 0 && (
            <>
              <div className="tooltip-divider"></div>
              
              <div className="tooltip-section">
                <div className="tooltip-purchase-info">
                  Buying x{tooltipInfo.amount}
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Total cost:</span>
                  <span className="tooltip-value highlight-gold">
                    {formatNumber(tooltipInfo.cost)} 🍪
                  </span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">New amount:</span>
                  <span className="tooltip-value">{tooltipInfo.owned + (tooltipInfo.amount as number)}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">New production:</span>
                  <span className="tooltip-value highlight-green">
                    {formatNumber(tooltipInfo.nextProduction)}/s
                  </span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Increase:</span>
                  <span className="tooltip-value highlight-cyan">
                    +{formatNumber(tooltipInfo.productionIncrease)}/s
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BuildingCard
