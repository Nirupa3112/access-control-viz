import AccessPanel from "./AccessPanel";

// ─── Partial Order Graph for Biba ───
//            High
//              |
//           Medium
//           /    \
//       Analyst-A  Analyst-B
//           \    /
//            Low
const BIBA_GRAPH = {
    High: ["Medium"],
    Medium: ["Analyst-A", "Analyst-B"],
    "Analyst-A": ["Low"],
    "Analyst-B": ["Low"],
    Low: [],
};

const DEFAULT_ENTITIES = [
    { id: 1, name: "Auditor", type: "subject", level: "High" },
    { id: 2, name: "Manager", type: "subject", level: "Medium" },
    { id: 3, name: "User", type: "subject", level: "Low" },
    { id: 4, name: "AnalystX", type: "subject", level: "Analyst-A" },
    { id: 5, name: "AnalystY", type: "subject", level: "Analyst-B" },
    { id: 6, name: "Core_DB", type: "object", level: "High" },
    { id: 7, name: "ReportsA", type: "object", level: "Analyst-A" },
    { id: 8, name: "ReportsB", type: "object", level: "Analyst-B" },
    { id: 9, name: "Logs", type: "object", level: "Low" },
];

export default function BibaPanel() {
    return (
        <AccessPanel
            model="biba"
            title="Biba Integrity Lattice"
            description="Partial-order integrity lattice. Branches under Medium show partial ordering — AnalystX and AnalystY are incomparable branches."
            graph={BIBA_GRAPH}
            defaultEntities={DEFAULT_ENTITIES}
            accent="indigo"
            rulesConfig={[
                ["no_write_up", "No write-up (simple integrity)"],
                ["no_read_down", "No read-down (invocation)"],
            ]}
            rulesDescription={{
                title: "Biba rules",
                body: "No write-up: subject can write only if the object dominates it. No read-down: subject can read only if it dominates the object.",
                badge: "Integrity model",
            }}
        />
    );
}