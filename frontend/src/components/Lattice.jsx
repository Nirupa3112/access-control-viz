import { useEffect, useMemo, useRef, useState } from "react";
import { getAllNodes, computeRanks, getRankColor } from "./graphUtils";

export default function Lattice({ graph, entities, onMove, onDelete }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(800);

    useEffect(() => {
        function measure() {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        }
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const { positions, edges, height, ranks } = useMemo(() => {
        const ranks = computeRanks(graph);
        const nodes = getAllNodes(graph);
        const maxRank = Math.max(0, ...Object.values(ranks));

        // Group nodes by rank
        const byRank = [];
        for (let i = 0; i <= maxRank; i++) {
            byRank.push(nodes.filter((n) => ranks[n] === i));
        }

        // Position each node horizontally within its rank
        const NODE_VERTICAL_SPACING = 210;
        const positions = {};
        byRank.forEach((rankNodes, r) => {
            const spacing = width / (rankNodes.length + 1);
            rankNodes.forEach((node, i) => {
                positions[node] = {
                    x: spacing * (i + 1),
                    y: 60 + r * NODE_VERTICAL_SPACING,
                };
            });
        });

        // Build edge list
        const edges = [];
        nodes.forEach((n) => {
            (graph[n] || []).forEach((c) => {
                edges.push({ from: n, to: c, id: `${n}->${c}` });
            });
        });

        return {
            positions,
            edges,
            ranks,
            height: 60 + (maxRank + 1) * NODE_VERTICAL_SPACING,
        };
    }, [graph, width]);

    return (
        <div className="card-padded">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="section-label">Security Lattice</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Partial order — drag entities onto any node
                    </p>
                </div>
            </div>

            <div
                ref={containerRef}
                style={{
                    position: "relative",
                    height: `${height}px`,
                    minWidth: "100%",
                }}
            >
                {/* SVG edges layer (behind everything) */}
                <svg
                    width={width}
                    height={height}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="8"
                            refX="9"
                            refY="4"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
                        </marker>
                    </defs>
                    {edges.map((edge) => {
                        const from = positions[edge.from];
                        const to = positions[edge.to];
                        if (!from || !to) return null;
                        return (
                            <line
                                key={edge.id}
                                x1={from.x}
                                y1={from.y + 26}
                                x2={to.x}
                                y2={to.y - 26}
                                stroke="#64748b"
                                strokeWidth={1.5}
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}
                </svg>

                {/* Node cards + entity pills */}
                {Object.entries(positions).map(([node, pos]) => {
                    const rank = ranks[node] ?? 0;
                    const color = getRankColor(rank);
                    const nodeEntities = entities.filter((e) => e.level === node);

                    return (
                        <div
                            key={node}
                            style={{
                                position: "absolute",
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                                zIndex: 1,
                                width: 180,
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                const id = +e.dataTransfer.getData("text/plain");
                                onMove(id, node);
                            }}
                        >
                            {/* Node label card */}
                            <div
                                className="rounded-xl border-2 px-3 py-2 text-center transition hover:scale-105"
                                style={{
                                    borderColor: color,
                                    background: `${color}22`,
                                }}
                            >
                                <div className="text-sm font-semibold text-white">{node}</div>
                                <div className="text-[10px] text-slate-400">Rank {rank}</div>
                            </div>

                            {/* Entity pills below node */}
                            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                {nodeEntities.map((ent) => (
                                    <div
                                        key={ent.id}
                                        draggable
                                        onDragStart={(e) =>
                                            e.dataTransfer.setData("text/plain", String(ent.id))
                                        }
                                        className="group/pill inline-flex cursor-grab select-none items-center gap-1 rounded-full pl-2 pr-1 py-1 text-xs font-medium shadow-md transition hover:scale-105 active:cursor-grabbing"
                                        style={{
                                            background: `${color}55`,
                                            color: "#ffffff",
                                            border: `1px ${ent.type === "object" ? "dashed" : "solid"} ${color}`,
                                            boxShadow: `0 2px 8px ${color}40`,
                                        }}
                                    >
                                        <EntityIcon type={ent.type} />
                                        <span className="max-w-[70px] truncate">{ent.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(ent.id);
                                            }}
                                            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold opacity-50 transition hover:bg-black/30 hover:opacity-100 hover:text-rose-300"
                                            title={`Delete ${ent.name}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 items-center border-t border-slate-800 pt-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-slate-300 inline-block"></span>
          Subject (solid)
        </span>
                <span className="flex items-center gap-2">
          <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ border: "2px dashed #cbd5e1" }}
          ></span>
          Object (dashed)
        </span>
                <span className="text-slate-500 italic ml-auto">
          Drop an entity onto any node to change its level
        </span>
            </div>
        </div>
    );
}

function EntityIcon({ type }) {
    if (type === "subject") {
        return (
            <svg
                className="h-3 w-3 opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        );
    }
    return (
        <svg
            className="h-3 w-3 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
}