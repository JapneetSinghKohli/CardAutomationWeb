import { useState } from 'react'
import Navb from './components/Navb'
import './App.css'
import Dashboard from './components/dashboard'
import KeyManagement from './components/KeyManagement'
import AccessLogs from './components/AccessLogs'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navb/>
      <AccessLogs/>
    </>
  )
}

export default App
