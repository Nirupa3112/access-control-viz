import { useState } from 'react'
import BLPPanel from './components/BLPPanel'
import BibaPanel from './components/BibaPanel'
import ComparePanel from './components/ComparePanel'

const TABS = ['Bell-LaPadula', 'Biba', 'Compare Rules']

export default function App() {
  const [tab, setTab] = useState(0)
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-1">Access Control Models</h1>
      <p className="text-gray-500 text-sm mb-6">Interactive visualization — Bell-LaPadula & Biba</p>
      <div className="flex gap-1 mb-6 bg-white border rounded-lg p-1 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              tab === i ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>{t}</button>
        ))}
      </div>
      {tab === 0 && <BLPPanel />}
      {tab === 1 && <BibaPanel />}
      {tab === 2 && <ComparePanel />}
    </div>
  )
}
