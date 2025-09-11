import React from 'react'
import { Outlet } from 'react-router-dom'
import Navb from './components/Navb'


function Layout() {
  return (
    <div>
      <Navb/>
        <Outlet/>
    </div>
  )
}

export default Layout
