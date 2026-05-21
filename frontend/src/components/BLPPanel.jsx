import { useState } from 'react'
import axios from 'axios'
import Lattice from './Lattice'

const API = 'http://localhost:8000'
const BLP_LEVELS = ['Top Secret', 'Secret', 'Confidential', 'Unclassified']
const BLP_COLORS = {
  'Top Secret':'#ef4444',
  'Secret':'#3b82f6',
  'Confidential':'#22c55e',
  'Unclassified':'#94a3b8'
}
const DEFAULT_ENTITIES = [
  { id:1, name:'Alice',     type:'subject', level:'Top Secret'   },
  { id:2, name:'Bob',       type:'subject', level:'Secret'       },
  { id:3, name:'Eve',       type:'subject', level:'Unclassified' },
  { id:4, name:'TS_Report', type:'object',  level:'Top Secret'   },
  { id:5, name:'Memo',      type:'object',  level:'Confidential' },
  { id:6, name:'Public',    type:'object',  level:'Unclassified' },
]

export default function BLPPanel() {
  const [entities, setEntities]   = useState(DEFAULT_ENTITIES)
  const [subjectId, setSubjectId] = useState(1)
  const [objectId, setObjectId]   = useState(4)
  const [result, setResult]       = useState(null)
  const [log, setLog]             = useState([])
  const [rules, setRules]         = useState({ no_read_up: true, no_write_down: true })
  const [newName, setNewName]     = useState('')
  const [newLevel, setNewLevel]   = useState('Secret')
  const [newType, setNewType]     = useState('subject')

  async function checkAccess(op) {
    const subject = entities.find(e => e.id === subjectId)
    const object  = entities.find(e => e.id === objectId)
    try {
      const { data } = await axios.post(`${API}/check-access`, {
        model: 'blp', subject_level: subject.level,
        object_level: object.level, operation: op, rules,
      })
      setResult({ ...data, subject: subject.name, object: object.name, op })
      setLog(l => [{ ...data, subject: subject.name, object: object.name, op,
        ts: new Date().toLocaleTimeString() }, ...l].slice(0, 20))
    } catch {
      setResult({ allowed: false, reason: 'Backend offline — is uvicorn running on port 8000?' })
    }
  }

  function addEntity() {
    setEntities(es => [...es, { id: Date.now(), name: newName || 'New', type: newType, level: newLevel }])
    setNewName('')
  }

  const subjects = entities.filter(e => e.type === 'subject')
  const objects  = entities.filter(e => e.type === 'object')

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Lattice levels={BLP_LEVELS} entities={entities} colors={BLP_COLORS}
          onMove={(id, level) => setEntities(es => es.map(e => e.id === id ? {...e, level} : e))} />
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Bell-LaPadula rules (confidentiality)</p>
          <p>📖 <strong>No read-up:</strong> subject can only read objects at same or lower level</p>
          <p>✏️ <strong>No write-down (★):</strong> subject can only write to same or higher level</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Active Rules</p>
          {[['no_read_up','No read-up (simple security)'],['no_write_down','No write-down (★-property)']].map(([k,label]) => (
            <label key={k} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
              <input type="checkbox" checked={rules[k]}
                onChange={e => setRules(r => ({...r, [k]: e.target.checked}))}
                className="accent-blue-600" />
              {label}
            </label>
          ))}
        </div>
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase">Request Access</p>
          <div>
            <p className="text-xs text-gray-400 mb-1">Subject (person)</p>
            <select value={subjectId} onChange={e => setSubjectId(+e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Object (file/resource)</p>
            <select value={objectId} onChange={e => setObjectId(+e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm">
              {objects.map(o => <option key={o.id} value={o.id}>{o.name} ({o.level})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => checkAccess('read')}
              className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 rounded py-2 text-sm font-medium hover:bg-blue-100">
              ▶ Read
            </button>
            <button onClick={() => checkAccess('write')}
              className="flex-1 bg-orange-50 border border-orange-200 text-orange-700 rounded py-2 text-sm font-medium hover:bg-orange-100">
              ✏ Write
            </button>
          </div>
        </div>
        {result && (
          <div className={`border rounded-xl p-4 text-sm ${result.allowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-semibold text-base mb-1 ${result.allowed ? 'text-green-700' : 'text-red-700'}`}>
              {result.allowed ? '✓ Access Granted' : '✗ Access Denied'}
            </p>
            <p className="text-gray-600">{result.subject} → {result.op} → {result.object}</p>
            <p className="text-gray-500 mt-1 text-xs">{result.reason}</p>
          </div>
        )}
        <div className="bg-white border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Add Entity</p>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Name e.g. Charlie" className="w-full border rounded px-2 py-1 text-sm" />
          <select value={newLevel} onChange={e => setNewLevel(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            {BLP_LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={newType} onChange={e => setNewType(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            <option value="subject">Subject (person)</option>
            <option value="object">Object (file)</option>
          </select>
          <button onClick={addEntity}
            className="w-full border rounded py-1 text-sm hover:bg-gray-50">+ Add</button>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Access Log</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {log.length === 0 && <p className="text-xs text-gray-400">No requests yet.</p>}
            {log.map((l, i) => (
              <div key={i} className={`text-xs py-1 border-b ${l.allowed ? 'text-green-700' : 'text-red-600'}`}>
                {l.ts} {l.allowed ? '✓' : '✗'} {l.subject} {l.op}s {l.object}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
