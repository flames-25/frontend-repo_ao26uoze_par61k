import { Link, useLocation } from 'react-router-dom'

export default function Navbar(){
  const { pathname } = useLocation()
  const link = (to, label) => (
    <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium ${pathname===to? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`}>
      {label}
    </Link>
  )
  return (
    <div className="w-full bg-white/70 backdrop-blur border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-bold text-blue-700">Smart Wearable Platform</div>
        <div className="flex gap-2 ml-4">
          {link('/', 'Login')}
          {link('/dashboard', 'Dashboard')}
          {link('/devices', 'Devices')}
        </div>
      </div>
    </div>
  )
}
