import { useState } from 'react'
import Navb from './components/Navb'
import './App.css'
import Dashboard from './components/dashboard'
import KeyManagement from './components/KeyManagement'
import AccessLogs from './components/AccessLogs'
import MembersAccessLogs from './components/MembersAccessLog'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";





export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AccessLogs />} />
        <Route path="/keys" element={<KeyManagement />} />
        <Route path="/members" element={<MembersAccessLogs />} /> {/* 👈 new route */}
      </Routes>
    </Router>
  );
}
