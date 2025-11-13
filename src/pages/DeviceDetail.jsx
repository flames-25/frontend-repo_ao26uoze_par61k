import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'

function Widget({title, value}){
  return (
    <div className="bg-white p-4 rounded border shadow">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function RadarLike({items}){
  return (
    <div className="bg-white rounded border shadow p-4">
      <div className="text-sm font-semibold mb-2">Aktivitas Harian</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {items.map((it, idx)=> (
          <div key={idx} className="flex items-center justify-between bg-slate-50 rounded p-3">
            <div className="text-gray-600">{it.label}</div>
            <div className="font-semibold">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ECGChart({samples}){
  const ref = useRef(null)
  useEffect(()=>{
    const canvas = ref.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    samples.forEach((v, i)=>{
      const x = (i/(samples.length-1))*canvas.width
      const y = canvas.height - (v/100)*canvas.height
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
    })
    ctx.stroke()
  }, [samples])
  return <canvas ref={ref} width={600} height={160} className="w-full"/>
}

function SleepTimeline({segments}){
  const colors = { light: 'bg-green-400', deep: 'bg-red-500', awake: 'bg-yellow-400', rem: 'bg-blue-500' }
  const total = segments.reduce((a,b)=> a + (new Date(b.end)-new Date(b.start)), 0)
  return (
    <div className="w-full">
      <div className="flex w-full h-4 rounded overflow-hidden">
        {segments.map((s, idx)=>{
          const width = ((new Date(s.end)-new Date(s.start))/total)*100
          return <div key={idx} className={`${colors[s.type]} h-full`} style={{width: `${width}%`}} title={`${s.type}`}></div>
        })}
      </div>
      <div className="mt-2 text-xs text-gray-600 flex gap-3">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 inline-block"/> light</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block"/> deep</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 inline-block"/> awake</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 inline-block"/> rem</span>
      </div>
    </div>
  )
}

export default function DeviceDetail(){
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [deviceId, setDeviceId] = useState(window.location.pathname.split('/').pop())
  const [data, setData] = useState(null)
  const [ecg, setEcg] = useState({samples: []})
  const [tab, setTab] = useState('health')
  const [date, setDate] = useState('')
  const [sleepList, setSleepList] = useState([])

  useEffect(()=>{(async()=>{
    const res = await fetch(`${backend}/devices/${deviceId}`).then(r=>r.json())
    setData(res)
  })()}, [deviceId])

  useEffect(()=>{
    let timer
    const load = async ()=>{
      const e = await fetch(`${backend}/devices/${deviceId}/ecg`).then(r=>r.json())
      setEcg(e)
    }
    load()
    timer = setInterval(load, 3000)
    return ()=> clearInterval(timer)
  }, [deviceId])

  useEffect(()=>{(async()=>{
    const res = await fetch(`${backend}/devices/${deviceId}/sleep${date?`?date=${date}`:''}`).then(r=>r.json())
    setSleepList(res.items||[])
  })()}, [deviceId, date])

  const health = data?.health

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Device {deviceId}</h1>
          <div className="flex gap-2">
            <button onClick={()=>setTab('health')} className={`px-3 py-1 rounded ${tab==='health'?'bg-blue-600 text-white':'bg-white border'}`}>Health</button>
            <button onClick={()=>setTab('sleep')} className={`px-3 py-1 rounded ${tab==='sleep'?'bg-blue-600 text-white':'bg-white border'}`}>Sleep</button>
          </div>
        </div>

        {tab==='health' && (
          <div className="space-y-4">
            <div className="bg-white rounded border p-4 shadow">
              <div className="text-sm font-semibold mb-2">ECG (Realtime)</div>
              <ECGChart samples={ecg.samples||[]} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Widget title="Heart Rate" value={`${health?.heart_rate ?? '-'} bpm`} />
              <Widget title="Blood Pressure" value={`${health?.bp_systolic ?? '-'} / ${health?.bp_diastolic ?? '-'}`} />
              <Widget title="Temperature" value={`${health?.temperature ?? '-'} °C`} />
            </div>
            <RadarLike items={[
              {label: 'Total Kalori (per hari)', value: `${health?.calories ?? '-'} kcal`},
              {label: 'Total Steps', value: `${health?.steps ?? '-'} langkah`},
              {label: 'Durasi Aktif', value: `${health?.duration_minutes ?? '-'} menit`},
              {label: 'Jarak Tempuh', value: `${health?.kilometers ?? '-'} km`},
            ]} />
          </div>
        )}

        {tab==='sleep' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-3 py-2"/>
            </div>
            <div className="space-y-3">
              {sleepList.map((s, idx)=> (
                <details key={idx} className="bg-white rounded border p-4">
                  <summary className="cursor-pointer select-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{s.date}</div>
                        <div className="text-sm text-gray-600">Score: {s.score} • Duration: {s.duration_minutes} menit</div>
                      </div>
                    </div>
                  </summary>
                  <div className="mt-4">
                    <SleepTimeline segments={s.segments || []} />
                    <div className="mt-3 overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Start</th>
                            <th className="px-3 py-2 text-left">End</th>
                            <th className="px-3 py-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(s.segments||[]).map((seg, i)=> (
                            <tr key={i} className="border-b">
                              <td className="px-3 py-2">{new Date(seg.start).toLocaleTimeString()}</td>
                              <td className="px-3 py-2">{new Date(seg.end).toLocaleTimeString()}</td>
                              <td className="px-3 py-2 capitalize">{seg.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
