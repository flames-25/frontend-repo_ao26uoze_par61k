import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'

function RequireAuth({children}){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/" replace />
  return children
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/devices" element={<RequireAuth><Devices /></RequireAuth>} />
      <Route path="/devices/:id" element={<RequireAuth><DeviceDetail /></RequireAuth>} />
    </Routes>
  )
}
