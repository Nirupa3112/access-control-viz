export default function Lattice({ levels, entities, onMove, colors }) {
  function handleDrop(e, level) {
    const id = +e.dataTransfer.getData('text/plain')
    onMove(id, level)
  }
  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Security Lattice — drag to change level</p>
      {levels.map(lvl => (
        <div key={lvl} className="flex items-start gap-3 min-h-14">
          <div className="w-36 text-right mt-2 flex-shrink-0">
            <span className="text-xs font-semibold px-2 py-1 rounded"
              style={{ background: colors[lvl] + '22', color: colors[lvl] }}>
              {lvl}
            </span>
          </div>
          <div className="flex-1 min-h-12 border border-dashed rounded-lg p-2 flex flex-wrap gap-2"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, lvl)}>
            {entities.filter(e => e.level === lvl).map(ent => (
              <div key={ent.id} draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', ent.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-grab select-none"
                style={{
                  background: colors[lvl] + '22',
                  color: colors[lvl],
                  border: `1.5px ${ent.type === 'object' ? 'dashed' : 'solid'} ${colors[lvl]}`
                }}>
                {ent.type === 'subject' ? '👤' : '📄'} {ent.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
