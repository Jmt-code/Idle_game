import { useGameStore, BUILDINGS } from '../store/gameStore'
import { useState, useRef, useEffect } from 'react'
import './BuildingsList.css'

function BuildingsList() {
  const { 
    cookies, 
    buildings, 
    buyBuilding, 
    getBuildingCost,
    purchaseMultiplier,
    setPurchaseMultiplier,
    getMaxAffordable
  } = useGameStore()

  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState('top')
  const cardRefs = useRef({})

  useEffect(() => {
    if (hoveredBuilding) {
      const cardElement = cardRefs.current[hoveredBuilding]
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect()
        const tooltipHeight = 200 // Approximate
        const spaceAbove = rect.top
        
        // If not enough space above, show below
        if (spaceAbove < tooltipHeight) {
          setTooltipPosition('bottom')
        } else {
          setTooltipPosition('top')
        }
      }
    }
  }, [hoveredBuilding])

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K'
    return Math.floor(num).toLocaleString()
  }

  const multipliers = [1, 5, 10, 100, 'max']

  const getTooltipInfo = (building) => {
    const buildingData = buildings[building.id]
    const owned = buildingData.owned
    const currentProduction = building.baseProduction * owned
    const cost = getBuildingCost(building.id)
    const amount = purchaseMultiplier === 'max' ? getMaxAffordable(building.id) : purchaseMultiplier
    const nextProduction = building.baseProduction * (owned + amount)
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

  return (
    <div className="buildings-container">
      <div className="buildings-header">
        <h2>🏪 Store</h2>
        <div className="purchase-selector">
          {multipliers.map(mult => (
            <button
              key={mult}
              className={`multiplier-btn ${purchaseMultiplier === mult ? 'active' : ''}`}
              onClick={() => setPurchaseMultiplier(mult)}
            >
              {mult === 'max' ? 'MAX' : `x${mult}`}
            </button>
          ))}
        </div>
      </div>

      <div className="buildings-list">
        {BUILDINGS.map(building => {
          const buildingData = buildings[building.id]
          if (!buildingData) return null

          const isUnlocked = buildingData.unlocked
          const cost = getBuildingCost(building.id)
          const canAfford = cookies >= cost && cost > 0
          const owned = buildingData.owned
          const production = building.baseProduction * owned
          const maxAffordable = getMaxAffordable(building.id)

          const tooltipInfo = getTooltipInfo(building)

          return (
            <div
              key={building.id}
              ref={el => cardRefs.current[building.id] = el}
              className={`building-card ${!isUnlocked ? 'locked' : ''} ${!canAfford ? 'unaffordable' : ''}`}
              onClick={() => isUnlocked && canAfford && buyBuilding(building.id)}
              onMouseEnter={() => setHoveredBuilding(building.id)}
              onMouseLeave={() => setHoveredBuilding(null)}
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
                    </div>
                  )}
                </div>
              </div>

              {/* Tooltip */}
              {hoveredBuilding === building.id && isUnlocked && (
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
                          <span className="tooltip-value">{tooltipInfo.owned + tooltipInfo.amount}</span>
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
        })}
      </div>
    </div>
  )
}

export default BuildingsList
