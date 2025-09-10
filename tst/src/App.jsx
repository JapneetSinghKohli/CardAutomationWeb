import { useState } from 'react'
import Navb from './components/Navb'
import './App.css'
import Dashboard from './components/dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navb/>
      <Dashboard/>
    </>
  )
}

export default App
