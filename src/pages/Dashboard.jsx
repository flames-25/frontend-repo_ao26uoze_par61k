import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'

function Stat({title, value, suffix}){
  return (
    <div className="bg-white rounded-lg p-4 shadow border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-blue-700">{value}{suffix||''}</div>
    </div>
  )
}

function SearchFilter({q, setQ, status, setStatus, placeholder='Cari nama driver', statusLabel='Status'}){
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={placeholder} className="border rounded px-3 py-2 w-64"/>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
        <option value="">{statusLabel}</option>
        <option value="approved">approved</option>
        <option value="not approved">not approved</option>
        <option value="SOS">SOS</option>
        <option value="Fall Down">Fall Down</option>
        <option value="Low Battery">Low Battery</option>
        <option value="Remove Smart Wearable">Remove Smart Wearable</option>
      </select>
    </div>
  )
}

export default function Dashboard(){
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [summary, setSummary] = useState(null)
  const [q1, setQ1] = useState('')
  const [status1, setStatus1] = useState('')
  const [q2, setQ2] = useState('')
  const [status2, setStatus2] = useState('')
  const [readyRows, setReadyRows] = useState([])
  const [eventRows, setEventRows] = useState([])
  const [mapPoints, setMapPoints] = useState([])

  useEffect(()=>{ (async ()=>{
    // ensure seed data
    try { await fetch(`${backend}/seed`, { method: 'POST' }) } catch{}
    const s = await fetch(`${backend}/dashboard/summary`).then(r=>r.json())
    setSummary(s)
    const r = await fetch(`${backend}/dashboard/readiness`).then(r=>r.json())
    setReadyRows(r.items || [])
    const e = await fetch(`${backend}/dashboard/events`).then(r=>r.json())
    setEventRows(e.items || [])
    const m = await fetch(`${backend}/dashboard/map`).then(r=>r.json())
    setMapPoints(m.items || [])
  })() }, [])

  const filteredReady = useMemo(()=>{
    let rows = [...readyRows]
    if(q1) rows = rows.filter(x=> (x.driver_name||'').toLowerCase().includes(q1.toLowerCase()))
    if(status1) rows = rows.filter(x=> (x.status||'').toLowerCase()===status1.toLowerCase())
    return rows
  }, [readyRows, q1, status1])

  const filteredEvents = useMemo(()=>{
    let rows = [...eventRows]
    if(q2) rows = rows.filter(x=> (x.driver_name||'').toLowerCase().includes(q2.toLowerCase()))
    if(status2) rows = rows.filter(x=> (x.status_event||'').toLowerCase()===status2.toLowerCase())
    return rows
  }, [eventRows, q2, status2])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat title="Tekanan Darah > Threshold" value={summary?.high_bp_count ?? '-'} />
          <Stat title="Score Sleep < Threshold" value={summary?.low_sleep_score_count ?? '-'} />
          <Stat title="Under Sleep Duration" value={summary?.under_sleep_duration_count ?? '-'} />
          <Stat title="Online Devices" value={summary?.online_devices ?? '-'} />
          <Stat title="Offline Devices" value={summary?.offline_devices ?? '-'} />
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Kelayakan Driver Bertugas (harian)</h2>
            <SearchFilter q={q1} setQ={setQ1} status={status1} setStatus={setStatus1} statusLabel="Status" />
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Date Time</th>
                  <th className="px-3 py-2 text-left">Driver Name</th>
                  <th className="px-3 py-2 text-left">Device ID</th>
                  <th className="px-3 py-2 text-left">Last Sleep Score</th>
                  <th className="px-3 py-2 text-left">Sistolik</th>
                  <th className="px-3 py-2 text-left">Diastolik</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReady.map((r, idx)=> (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">{idx+1}</td>
                    <td className="px-3 py-2">{r.datetime ? new Date(r.datetime).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2">{r.driver_name}</td>
                    <td className="px-3 py-2">{r.device_id}</td>
                    <td className="px-3 py-2">{r.last_sleep_score ?? '-'}</td>
                    <td className="px-3 py-2">{r.last_bp_systolic ?? '-'}</td>
                    <td className="px-3 py-2">{r.last_bp_diastolic ?? '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${r.status==='approved'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Event / Alarm Harian</h2>
            <SearchFilter q={q2} setQ={setQ2} status={status2} setStatus={setStatus2} placeholder='Cari nama driver' statusLabel="Status Event" />
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Date Time</th>
                  <th className="px-3 py-2 text-left">Driver Name</th>
                  <th className="px-3 py-2 text-left">Device ID</th>
                  <th className="px-3 py-2 text-left">Status Event</th>
                  <th className="px-3 py-2 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((r, idx)=> (
                  <tr key={idx} className="border-b">
                    <td className="px-3 py-2">{idx+1}</td>
                    <td className="px-3 py-2">{r.datetime ? new Date(r.datetime).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2">{r.driver_name}</td>
                    <td className="px-3 py-2">{r.device_id}</td>
                    <td className="px-3 py-2">{r.status_event}</td>
                    <td className="px-3 py-2">{r.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <h2 className="font-semibold text-lg mb-3">Peta Perangkat</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative w-full h-96 bg-slate-100 rounded">
                {/* Fake map canvas with points */}
                {mapPoints.map((p, idx)=> (
                  <div key={idx} className="absolute" style={{left: `${20+idx*20}%`, top: `${30+idx*10}%`}}>
                    <div className="group relative">
                      <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                      <div className="absolute left-4 top-0 hidden group-hover:block bg-white text-xs border rounded p-2 shadow">
                        <div><b>{p.device_id}</b></div>
                        <div>{p.driver_name}</div>
                        <div>Battery: {p.battery}%</div>
                        <div>Event: {p.event || '-'}</div>
                        <div>{p.address || '-'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {mapPoints.map((p, idx)=> (
                <div key={idx} className="border rounded p-3 text-sm">
                  <div className="font-semibold">{p.driver_name}</div>
                  <div className="text-gray-600">{p.device_id} • Battery {p.battery}% • {p.event || 'Normal'}</div>
                  <div className="text-gray-500">{p.address || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
