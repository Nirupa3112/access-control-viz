import AccessPanel from "./AccessPanel";

const BIBA_LEVELS = ["High", "Medium", "Low"];
const BIBA_COLORS = { High: "#334155", Medium: "#4f46e5", Low: "#6366f1" };
const DEFAULT_ENTITIES = [
  { id: 1, name: "Auditor", type: "subject", level: "High" },
  { id: 2, name: "Analyst", type: "subject", level: "Medium" },
  { id: 3, name: "User", type: "subject", level: "Low" },
  { id: 4, name: "Core_DB", type: "object", level: "High" },
  { id: 5, name: "Reports", type: "object", level: "Medium" },
  { id: 6, name: "Logs", type: "object", level: "Low" },
];

export default function BibaPanel() {
  return (
    <AccessPanel
      model="biba"
      title="Biba Integrity Lattice"
      description="Explore integrity levels and test access requests. Drag entities between levels to update the lattice."
      levels={BIBA_LEVELS}
      colors={BIBA_COLORS}
      defaultEntities={DEFAULT_ENTITIES}
      accent="indigo"
      rulesConfig={[
        ["no_write_up", "No write-up (simple integrity)"],
        ["no_read_down", "No read-down (invocation)"],
      ]}
      rulesDescription={{
        title: "Biba rules",
        body: "No write-up: subjects cannot write to higher integrity. No read-down: subjects cannot read from lower integrity.",
        badge: "Integrity model",
      }}
    />
  );
}
