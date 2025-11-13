import { useState } from 'react'

export default function Login(){
  const [email, setEmail] = useState('admin@tj.co.id')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backend}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if(!res.ok) throw new Error('Login gagal')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }))
      window.location.href = '/dashboard'
    } catch (err){
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-md">{loading? 'Memproses...' : 'Masuk'}</button>
        </form>
      </div>
    </div>
  )
}
