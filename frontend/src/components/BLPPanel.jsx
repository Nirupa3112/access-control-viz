import AccessPanel from "./AccessPanel";

const BLP_LEVELS = ["Top Secret", "Secret", "Confidential", "Unclassified"];
const BLP_COLORS = {
  "Top Secret": "#ef4444",
  Secret: "#3b82f6",
  Confidential: "#22c55e",
  Unclassified: "#38bdf8",
};
const DEFAULT_ENTITIES = [
  { id: 1, name: "Alice", type: "subject", level: "Top Secret" },
  { id: 2, name: "Bob", type: "subject", level: "Secret" },
  { id: 3, name: "Eve", type: "subject", level: "Unclassified" },
  { id: 4, name: "TS_Report", type: "object", level: "Top Secret" },
  { id: 5, name: "Memo", type: "object", level: "Confidential" },
  { id: 6, name: "Public", type: "object", level: "Unclassified" },
];

export default function BLPPanel() {
  return (
    <AccessPanel
      model="blp"
      title="Bell-LaPadula Lattice"
      description="Explore confidentiality levels and test read/write requests. Drag entities between levels to update the lattice."
      levels={BLP_LEVELS}
      colors={BLP_COLORS}
      defaultEntities={DEFAULT_ENTITIES}
      accent="blue"
      rulesConfig={[
        ["no_read_up", "No read-up (simple security)"],
        ["no_write_down", "No write-down (★-property)"],
      ]}
      rulesDescription={{
        title: "Bell-LaPadula rules",
        body: "No read-up: subjects read only at same or lower level. No write-down: subjects write only to same or higher level.",
        badge: "Confidentiality model",
      }}
    />
  );
}
