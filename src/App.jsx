import CookieClicker from './components/CookieClicker'
import BuildingsList from './components/BuildingsList'
import SaveManager from './components/SaveManager'
import './App.css'

function App() {
  return (
    <div className="app">
      <SaveManager />
      <CookieClicker />
      <BuildingsList />
    </div>
  )
}

export default App
