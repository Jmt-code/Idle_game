import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import './SaveManager.css'

function SaveManager() {
  const { 
    getSaveHash, 
    loadFromHash, 
    reset, 
    ascend, 
    heavenlyChips, 
    totalCookiesEarned 
  } = useGameStore()
  
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showPrestigeModal, setShowPrestigeModal] = useState(false)
  const [saveHash, setSaveHash] = useState('')
  const [loadHash, setLoadHash] = useState('')
  const [loadMessage, setLoadMessage] = useState('')

  const potentialChips = Math.floor(Math.sqrt(totalCookiesEarned / 1000000000))

  const handleExportSave = () => {
    const hash = getSaveHash()
    setSaveHash(hash)
    setShowSaveModal(true)
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(saveHash)
    alert('Code copied to clipboard!')
  }

  const handleImportSave = () => {
    if (loadHash.trim()) {
      const offlineCookies = loadFromHash(loadHash.trim())
      if (offlineCookies > 0) {
        setLoadMessage(`Game loaded! You earned ${Math.floor(offlineCookies)} cookies while you were away.`)
      } else {
        setLoadMessage('Game loaded successfully!')
      }
      setTimeout(() => {
        setShowLoadModal(false)
        setLoadHash('')
        setLoadMessage('')
      }, 3000)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? You will lose all your progress.')) {
      reset()
      alert('Game reset!')
    }
  }

  const handleAscend = () => {
    ascend()
    setShowPrestigeModal(false)
    alert('Ascension successful! You have been reborn.')
  }

  return (
    <>
      <div className="save-manager">
        <div className="prestige-info" onClick={() => setShowPrestigeModal(true)} title="Ascend">
          ⭐ {heavenlyChips || 0}
        </div>
        <button className="save-btn" onClick={handleExportSave} title="Export save">
          💾
        </button>
        <button className="save-btn" onClick={() => setShowLoadModal(true)} title="Import save">
          📥
        </button>
        <button className="save-btn reset-btn" onClick={handleReset} title="Reset game">
          🔄
        </button>
      </div>

      {showPrestigeModal && (
        <div className="modal-overlay" onClick={() => setShowPrestigeModal(false)}>
          <div className="modal-content prestige-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2>⭐ Ascension</h2>
            <p>Ascending will reset your buildings and cookies, but you will gain <b>Heavenly Chips</b>.</p>
            <p>Each Heavenly Chip grants <b>+10% CpS</b> permanently.</p>
            
            <div className="prestige-stats">
              <div className="stat-row">
                <span>Current Chips:</span>
                <span className="highlight-gold">{heavenlyChips || 0}</span>
              </div>
              <div className="stat-row">
                <span>Chips to Gain:</span>
                <span className="highlight-green">+{potentialChips}</span>
              </div>
              <div className="stat-row">
                <span>New Bonus:</span>
                <span className="highlight-cyan">+{(heavenlyChips + potentialChips) * 10}% CpS</span>
              </div>
            </div>

            <div className="modal-buttons">
              <button 
                onClick={handleAscend} 
                className="ascend-btn"
                disabled={potentialChips <= 0}
              >
                🚀 Ascend
              </button>
              <button onClick={() => setShowPrestigeModal(false)} className="close-btn">
                Cancel
              </button>
            </div>
            {potentialChips <= 0 && (
              <p className="ascend-note">
                You need at least 1 Billion total cookies to earn your first Heavenly Chip.
              </p>
            )}
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2>💾 Export Save</h2>
            <p>Copy this code to save your game:</p>
            <div className="hash-container">
              <textarea 
                readOnly 
                value={saveHash}
                className="hash-input"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleCopyHash} className="copy-btn">
                📋 Copy
              </button>
              <button onClick={() => setShowSaveModal(false)} className="close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2>📥 Import Save</h2>
            <p>Paste your save code:</p>
            <div className="hash-container">
              <textarea 
                value={loadHash}
                onChange={e => setLoadHash(e.target.value)}
                className="hash-input"
                placeholder="Paste your code here..."
              />
            </div>
            {loadMessage && (
              <div className="load-message">{loadMessage}</div>
            )}
            <div className="modal-buttons">
              <button onClick={handleImportSave} className="load-btn">
                ✅ Load
              </button>
              <button onClick={() => setShowLoadModal(false)} className="close-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SaveManager
