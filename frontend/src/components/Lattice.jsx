export default function Lattice({ levels, entities, onMove, colors }) {
    function handleDrop(e, level) {
        const id = +e.dataTransfer.getData("text/plain");
        onMove(id, level);
    }

    return (
        <div className="card-padded space-y-4">
            <div className="flex items-center justify-between">
                <p className="section-label">Security lattice</p>
                <p className="text-xs text-slate-400">Drag entities to change level</p>
            </div>

            <div className="space-y-2">
                {levels.map((lvl, i) => {
                    const atLevel = entities.filter((ent) => ent.level === lvl);
                    return (
                        <div key={lvl} className="group flex items-stretch gap-3">
                            {/* Left Side: Level Labels */}
                            <div className="flex w-36 shrink-0 items-center gap-2 sm:w-40">
                                <div
                                    className="h-9 w-1 rounded-full"
                                    style={{ background: colors[lvl] }}
                                />
                                <div>
                                    {/* Brightened from text-slate-800 to text-slate-200 */}
                                    <div className="text-sm font-medium text-slate-200">{lvl}</div>
                                    <div className="text-xs text-slate-400">Level {levels.length - i}</div>
                                </div>
                            </div>

                            {/* Right Side: Drop Zone */}
                            <div
                                className="flex min-h-[3.5rem] flex-1 flex-wrap gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 p-2.5 transition
                  group-hover:border-slate-500 group-hover:bg-slate-800/60"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, lvl)}
                            >
                                {atLevel.map((ent) => (
                                    <div
                                        key={ent.id}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData("text/plain", ent.id)}
                                        className="inline-flex cursor-grab select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm
                      transition hover:scale-[1.03] active:cursor-grabbing"
                                        style={{
                                            // Increased opacity from 18 to 33 so the background is visible against dark grey
                                            background: colors[lvl] + "40",
                                            // color: colors[lvl],
                                            color: "#ffffff",
                                            border: `1.5px ${ent.type === "object" ? "dashed" : "solid"} ${colors[lvl]}`,
                                            boxShadow: `0 2px 10px ${colors[lvl]}20`
                                        }}
                                    >
                                        <EntityIcon type={ent.type} />
                                        <span className="max-w-[8rem] truncate sm:max-w-xs">{ent.name}</span>
                                    </div>
                                ))}

                                {atLevel.length === 0 && (
                                    <span className="self-center text-xs italic text-slate-500">
                    Drop entities here
                  </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EntityIcon({ type }) {
    if (type === "subject") {
        return (
            <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        );
    }
    return (
        <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}