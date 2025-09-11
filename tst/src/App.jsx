import { useState } from 'react'
import Navb from './components/Navb'
import './App.css'
import Dashboard from './components/dashboard'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
