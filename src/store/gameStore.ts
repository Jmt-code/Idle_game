import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Building {
  id: string
  name: string
  baseCost: number
  baseProduction: number
  icon: string
  description: string
  unlockAt: number
}

export interface BuildingState {
  owned: number
  unlocked: boolean
}

export interface GameState {
  cookies: number
  totalCookiesEarned: number
  cookiesPerSecond: number
  clickPower: number
  buildings: Record<string, BuildingState>
  lastUpdateTime: number
  purchaseMultiplier: number | 'max'
  heavenlyChips: number
  
  click: () => void
  clickGoldenCookie: () => number
  ascend: () => void
  buyBuilding: (buildingId: string) => void
  getMaxAffordable: (buildingId: string) => number
  getBuildingCost: (buildingId: string) => number
  setPurchaseMultiplier: (multiplier: number | 'max') => void
  recalculateCPS: () => void
  update: () => void
  getSaveHash: () => string
  loadFromHash: (hash: string) => number
  reset: () => void
}

// Building/upgrade definitions
export const BUILDINGS: Building[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    baseCost: 15,
    baseProduction: 0.1,
    icon: '👆',
    description: 'Autoclicks the cookie',
    unlockAt: 0
  },
  {
    id: 'grandma',
    name: 'Grandma',
    baseCost: 100,
    baseProduction: 1,
    icon: '👵',
    description: 'A nice grandma to bake more cookies',
    unlockAt: 1
  },
  {
    id: 'farm',
    name: 'Farm',
    baseCost: 1100,
    baseProduction: 8,
    icon: '🌾',
    description: 'Grows cookie plants from cookie seeds',
    unlockAt: 1
  },
  {
    id: 'mine',
    name: 'Mine',
    baseCost: 12000,
    baseProduction: 47,
    icon: '⛏️',
    description: 'Mines out cookie dough and chocolate chips',
    unlockAt: 1
  },
  {
    id: 'factory',
    name: 'Factory',
    baseCost: 130000,
    baseProduction: 260,
    icon: '🏭',
    description: 'Produces large quantities of cookies',
    unlockAt: 1
  },
  {
    id: 'bank',
    name: 'Bank',
    baseCost: 1400000,
    baseProduction: 1400,
    icon: '🏦',
    description: 'Generates cookies from interest',
    unlockAt: 1
  },
  {
    id: 'temple',
    name: 'Temple',
    baseCost: 20000000,
    baseProduction: 7800,
    icon: '⛩️',
    description: 'Summons sacred cookies',
    unlockAt: 1
  },
  {
    id: 'wizard',
    name: 'Wizard Tower',
    baseCost: 330000000,
    baseProduction: 44000,
    icon: '🧙',
    description: 'Summons cookies with magic spells',
    unlockAt: 1
  },
  {
    id: 'spaceship',
    name: 'Spaceship',
    baseCost: 5100000000,
    baseProduction: 260000,
    icon: '🚀',
    description: 'Brings cookies from other planets',
    unlockAt: 1
  },
  {
    id: 'timemachine',
    name: 'Time Machine',
    baseCost: 75000000000,
    baseProduction: 1600000,
    icon: '⏰',
    description: 'Brings cookies from the past',
    unlockAt: 1
  }
]

const calculateCost = (baseCost: number, owned: number) => {
  return Math.floor(baseCost * Math.pow(1.15, owned))
}

const calculateProduction = (baseProduction: number, owned: number) => {
  return baseProduction * owned
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Game state
      cookies: 0,
      totalCookiesEarned: 0,
      cookiesPerSecond: 0,
      clickPower: 1,
      buildings: BUILDINGS.reduce((acc, building) => {
        acc[building.id] = { owned: 0, unlocked: building.id === 'cursor' }
        return acc
      }, {} as Record<string, BuildingState>),
      lastUpdateTime: Date.now(),
      purchaseMultiplier: 1, // 1, 5, 10, 100, or 'max'
      heavenlyChips: 0,
      
      // Actions
      click: () => {
        const { clickPower, heavenlyChips } = get()
        // Prestige bonus also affects clicks
        const prestigeMultiplier = 1 + ((heavenlyChips || 0) * 0.1)
        const totalClickPower = clickPower * prestigeMultiplier
        
        set((state) => ({
          cookies: state.cookies + totalClickPower,
          totalCookiesEarned: state.totalCookiesEarned + totalClickPower
        }))
      },

      clickGoldenCookie: () => {
        const state = get()
        // Bonus: 15 minutes of production or 15% of current bank, whichever is less (but at least some amount)
        // Let's make it simple: 10% of current bank + 100 * CPS
        const bonus = (state.cookies * 0.10) + (state.cookiesPerSecond * 100) + 100 // Base 100 to ensure it's not 0
        
        set((state) => ({
          cookies: state.cookies + bonus,
          totalCookiesEarned: state.totalCookiesEarned + bonus
        }))
        return bonus
      },

      ascend: () => {
        const state = get()
        // Formula: 1 Chip for every 1 Billion cookies earned in this run (sqrt scaling)
        // Chips = floor(sqrt(totalCookies / 1B))
        const newChips = Math.floor(Math.sqrt(state.totalCookiesEarned / 1000000000))
        
        if (newChips <= 0) return

        const totalChips = state.heavenlyChips + newChips

        set({
          cookies: 0,
          totalCookiesEarned: 0,
          cookiesPerSecond: 0,
          clickPower: 1,
          buildings: BUILDINGS.reduce((acc, building) => {
            acc[building.id] = { owned: 0, unlocked: building.id === 'cursor' }
            return acc
          }, {} as Record<string, BuildingState>),
          lastUpdateTime: Date.now(),
          purchaseMultiplier: 1,
          heavenlyChips: totalChips
        })
        
        get().recalculateCPS()
      },

      buyBuilding: (buildingId: string) => {
        const state = get()
        const building = BUILDINGS.find(b => b.id === buildingId)
        if (!building) return

        const currentOwned = state.buildings[buildingId].owned
        const multiplier = state.purchaseMultiplier === 'max' 
          ? get().getMaxAffordable(buildingId)
          : state.purchaseMultiplier

        if (multiplier === 0) return

        let totalCost = 0
        for (let i = 0; i < multiplier; i++) {
          totalCost += calculateCost(building.baseCost, currentOwned + i)
        }

        if (state.cookies >= totalCost) {
          set((state) => {
            const newBuildings = { ...state.buildings }
            newBuildings[buildingId] = {
              ...newBuildings[buildingId],
              owned: newBuildings[buildingId].owned + multiplier
            }

            // Unlock next building
            const currentIndex = BUILDINGS.findIndex(b => b.id === buildingId)
            if (currentIndex < BUILDINGS.length - 1 && newBuildings[buildingId].owned >= 1) {
              const nextBuilding = BUILDINGS[currentIndex + 1]
              newBuildings[nextBuilding.id] = {
                ...newBuildings[nextBuilding.id],
                unlocked: true
              }
            }

            return {
              cookies: state.cookies - totalCost,
              buildings: newBuildings
            }
          })
          get().recalculateCPS()
        }
      },

      getMaxAffordable: (buildingId: string) => {
        const state = get()
        const building = BUILDINGS.find(b => b.id === buildingId)
        if (!building) return 0

        const currentOwned = state.buildings[buildingId].owned
        let count = 0
        let totalCost = 0

        while (totalCost + calculateCost(building.baseCost, currentOwned + count) <= state.cookies) {
          totalCost += calculateCost(building.baseCost, currentOwned + count)
          count++
        }

        return count
      },

      getBuildingCost: (buildingId: string) => {
        const state = get()
        const building = BUILDINGS.find(b => b.id === buildingId)
        if (!building) return 0

        const currentOwned = state.buildings[buildingId].owned
        let multiplier = state.purchaseMultiplier === 'max' 
          ? get().getMaxAffordable(buildingId)
          : state.purchaseMultiplier

        // If max is selected but can't afford any, show cost for 1
        if (state.purchaseMultiplier === 'max' && multiplier === 0) {
          multiplier = 1
        }

        let totalCost = 0
        for (let i = 0; i < (multiplier as number); i++) {
          totalCost += calculateCost(building.baseCost, currentOwned + i)
        }

        return totalCost
      },

      setPurchaseMultiplier: (multiplier: number | 'max') => {
        set({ purchaseMultiplier: multiplier })
      },

      recalculateCPS: () => {
        const state = get()
        let cps = 0
        
        BUILDINGS.forEach(building => {
          const owned = state.buildings[building.id].owned
          cps += calculateProduction(building.baseProduction, owned)
        })

        // Apply Prestige Bonus (10% per chip)
        if (state.heavenlyChips > 0) {
          cps = cps * (1 + (state.heavenlyChips * 0.1))
        }

        set({ cookiesPerSecond: cps })
      },

      update: () => {
        const state = get()
        const now = Date.now()
        const deltaTime = (now - state.lastUpdateTime) / 1000 // seconds
        
        if (deltaTime > 0) {
          const cookiesGained = state.cookiesPerSecond * deltaTime
          set({
            cookies: state.cookies + cookiesGained,
            totalCookiesEarned: state.totalCookiesEarned + cookiesGained,
            lastUpdateTime: now
          })
        }
      },

      // Save system
      getSaveHash: () => {
        const state = get()
        const saveData = {
          c: Math.floor(state.cookies),
          t: state.totalCookiesEarned,
          b: state.buildings,
          ts: state.lastUpdateTime,
          hc: state.heavenlyChips || 0
        }
        return btoa(JSON.stringify(saveData))
      },

      loadFromHash: (hash: string) => {
        try {
          const saveData = JSON.parse(atob(hash))
          const now = Date.now()
          const offlineTime = (now - saveData.ts) / 1000 // seconds
          
          set({
            cookies: saveData.c,
            totalCookiesEarned: saveData.t,
            buildings: saveData.b,
            lastUpdateTime: now,
            heavenlyChips: saveData.hc || 0
          })

          // Recalculate CPS and apply offline production
          get().recalculateCPS()
          const offlineCookies = get().cookiesPerSecond * Math.min(offlineTime, 3600) // Max 1 hour
          
          set((state) => ({
            cookies: state.cookies + offlineCookies,
            totalCookiesEarned: state.totalCookiesEarned + offlineCookies
          }))

          return offlineCookies
        } catch (e) {
          console.error('Error loading save:', e)
          return 0
        }
      },

      reset: () => {
        set({
          cookies: 0,
          totalCookiesEarned: 0,
          cookiesPerSecond: 0,
          clickPower: 1,
          buildings: BUILDINGS.reduce((acc, building) => {
            acc[building.id] = { owned: 0, unlocked: building.id === 'cursor' }
            return acc
          }, {} as Record<string, BuildingState>),
          lastUpdateTime: Date.now(),
          purchaseMultiplier: 1,
          heavenlyChips: 0
        })
      }
    }),
    {
      name: 'idle-game-storage',
      partialize: (state) => ({
        cookies: state.cookies,
        totalCookiesEarned: state.totalCookiesEarned,
        buildings: state.buildings,
        lastUpdateTime: state.lastUpdateTime,
        purchaseMultiplier: state.purchaseMultiplier,
        heavenlyChips: state.heavenlyChips
      })
    }
  )
)
