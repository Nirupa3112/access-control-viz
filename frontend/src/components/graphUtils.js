// Pure functions for working with a partial order graph (DAG)

// Check if `a` dominates `b` (i.e., there's a path from a down to b)
export function dominates(a, b, graph) {
    if (a === b) return true;
    const children = graph[a] || [];
    for (const child of children) {
        if (dominates(child, b, graph)) return true;
    }
    return false;
}

// Get a flat list of every node in the graph (both parents and children)
export function getAllNodes(graph) {
    const set = new Set();
    Object.entries(graph).forEach(([node, children]) => {
        set.add(node);
        (children || []).forEach((c) => set.add(c));
    });
    return Array.from(set);
}

// Compute the "rank" (depth) of each node — used for vertical positioning
export function computeRanks(graph) {
    const nodes = getAllNodes(graph);
    const incoming = {};
    nodes.forEach((n) => (incoming[n] = 0));
    nodes.forEach((n) => (graph[n] || []).forEach((c) => incoming[c]++));

    const roots = nodes.filter((n) => incoming[n] === 0);
    const ranks = {};

    function assign(node, depth, visited) {
        if (visited.has(node)) return; // cycle guard
        visited.add(node);
        if (ranks[node] === undefined || depth > ranks[node]) {
            ranks[node] = depth;
        }
        (graph[node] || []).forEach((c) => assign(c, depth + 1, new Set(visited)));
    }

    roots.forEach((r) => assign(r, 0, new Set()));
    nodes.forEach((n) => {
        if (ranks[n] === undefined) ranks[n] = 0;
    });

    return ranks;
}

// A palette of colors — nodes at the same rank share a color for visual clarity
const PALETTE = [
    "#a855f7", // purple
    "#6366f1", // indigo
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#10b981", // emerald
    "#f59e0b", // amber
];

export function getRankColor(rank) {
    return PALETTE[rank % PALETTE.length];
}