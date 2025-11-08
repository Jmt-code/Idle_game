import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import './SaveManager.css'

function SaveManager() {
  const { getSaveHash, loadFromHash, reset } = useGameStore()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [saveHash, setSaveHash] = useState('')
  const [loadHash, setLoadHash] = useState('')
  const [loadMessage, setLoadMessage] = useState('')

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

  return (
    <>
      <div className="save-manager">
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

      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
