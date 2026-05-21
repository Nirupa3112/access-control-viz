export default function ComparePanel() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">Confidentiality</span>
          <h2 className="text-lg font-semibold mt-2">Bell-LaPadula</h2>
          <p className="text-sm text-gray-500 mt-1">Goal: prevent secrets leaking <strong>downward</strong></p>
        </div>
        <div className="border-l-4 border-blue-400 pl-4 py-1">
          <p className="text-sm font-semibold text-blue-700">No read-up (simple security)</p>
          <p className="text-sm text-gray-600 mt-1">Subject reads only at same or lower classification.</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">subject.level ≥ object.level</code>
        </div>
        <div className="border-l-4 border-orange-400 pl-4 py-1">
          <p className="text-sm font-semibold text-orange-700">No write-down (★-property)</p>
          <p className="text-sm text-gray-600 mt-1">Subject writes only to same or higher classification.</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">subject.level ≤ object.level</code>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Example: A Top Secret agent can read TS/Secret docs but cannot copy secrets into a Public file.
        </p>
      </div>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-50 text-purple-700">Integrity</span>
          <h2 className="text-lg font-semibold mt-2">Biba</h2>
          <p className="text-sm text-gray-500 mt-1">Goal: prevent corruption spreading <strong>upward</strong></p>
        </div>
        <div className="border-l-4 border-purple-400 pl-4 py-1">
          <p className="text-sm font-semibold text-purple-700">No write-up (simple integrity)</p>
          <p className="text-sm text-gray-600 mt-1">Subject writes only to same or lower integrity level.</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">subject.level ≥ object.level</code>
        </div>
        <div className="border-l-4 border-pink-400 pl-4 py-1">
          <p className="text-sm font-semibold text-pink-700">No read-down (invocation property)</p>
          <p className="text-sm text-gray-600 mt-1">Subject cannot read from lower integrity level.</p>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">subject.level ≤ object.level</code>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Example: A High-integrity process cannot read Low-integrity data — prevents garbage from corrupting reliable outputs.
        </p>
      </div>
      <div className="col-span-2 bg-gray-50 border rounded-xl p-6">
        <h3 className="font-semibold mb-2">Key insight — they are exact duals</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          BLP controls information <strong>flow downward</strong> (no read-up, no write-down).
          Biba controls information <strong>contamination upward</strong> (no write-up, no read-down).
          BLP asks <em>"can this person see this secret?"</em> — Biba asks <em>"can this data be trusted?"</em>
          Real systems like SELinux combine both simultaneously.
        </p>
        <table className="mt-4 w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border rounded-tl font-medium">Property</th>
              <th className="text-left p-2 border font-medium text-blue-700">Bell-LaPadula</th>
              <th className="text-left p-2 border rounded-tr font-medium text-purple-700">Biba</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Goal',        'Confidentiality',  'Integrity'],
              ['Read rule',   'No read-up',       'No read-down'],
              ['Write rule',  'No write-down',    'No write-up'],
              ['Threat',      'Secret leaks out', 'Corruption spreads in'],
              ['Used in',     'Military, govt',   'Financial, medical'],
            ].map(([prop, blp, biba]) => (
              <tr key={prop} className="border-b">
                <td className="p-2 border font-medium text-gray-500 text-xs">{prop}</td>
                <td className="p-2 border text-gray-700">{blp}</td>
                <td className="p-2 border text-gray-700">{biba}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
