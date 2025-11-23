import { useGameStore, BUILDINGS } from '../store/gameStore'
import BuildingCard from './BuildingCard'
import './BuildingsList.css'

function BuildingsList() {
  const { 
    buildings, 
    purchaseMultiplier,
    setPurchaseMultiplier
  } = useGameStore()

  const multipliers = [1, 5, 10, 100, 'max']

  return (
    <div className="buildings-container">
      <div className="buildings-header">
        <h2>🏪 Store</h2>
        <div className="purchase-selector">
          {multipliers.map(mult => (
            <button
              key={mult}
              className={`multiplier-btn ${purchaseMultiplier === mult ? 'active' : ''}`}
              onClick={() => setPurchaseMultiplier(mult as number | 'max')}
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

          return (
            <BuildingCard 
              key={building.id} 
              building={building} 
            />
          )
        })}
      </div>
    </div>
  )
}

export default BuildingsList
