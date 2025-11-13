import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function Devices(){
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')

  useEffect(()=>{(async()=>{
    const data = await fetch(`${backend}/devices`).then(r=>r.json())
    setItems(data.items||[])
  })()},[])

  const filtered = useMemo(()=>{
    let rows = [...items]
    if(q) rows = rows.filter(x=> ((x.device_id||'')+' '+(x.driver_name||'')).toLowerCase().includes(q.toLowerCase()))
    return rows
  }, [items, q])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Device List</h1>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari device / driver" className="border rounded px-3 py-2" />
        </div>
        <div className="overflow-auto bg-white rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Device ID</th>
                <th className="px-3 py-2 text-left">Driver Name</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, idx)=> (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">{idx+1}</td>
                  <td className="px-3 py-2">{d.device_id}</td>
                  <td className="px-3 py-2">{d.driver_name || '-'}</td>
                  <td className="px-3 py-2">
                    <Link to={`/devices/${d.device_id}`} className="text-blue-600 hover:underline">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
