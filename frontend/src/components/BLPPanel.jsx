import AccessPanel from "./AccessPanel";

// ─── Partial Order Graph (branched hierarchy) ───
//       Top Secret
//           |
//         Secret
//         /    \
// Confidential-A  Confidential-B
//         \    /
//       Unclassified
const BLP_GRAPH = {
    "Top Secret": ["Secret"],
    Secret: ["Confidential-A", "Confidential-B"],
    "Confidential-A": ["Unclassified"],
    "Confidential-B": ["Unclassified"],
    Unclassified: [],
};

const DEFAULT_ENTITIES = [
    { id: 1, name: "Alice", type: "subject", level: "Top Secret" },
    { id: 2, name: "Bob", type: "subject", level: "Secret" },
    { id: 3, name: "Eve", type: "subject", level: "Unclassified" },
    { id: 4, name: "Carol", type: "subject", level: "Confidential-A" },
    { id: 5, name: "Dave", type: "subject", level: "Confidential-B" },
    { id: 6, name: "TS_Report", type: "object", level: "Top Secret" },
    { id: 7, name: "Memo_A", type: "object", level: "Confidential-A" },
    { id: 8, name: "Memo_B", type: "object", level: "Confidential-B" },
    { id: 9, name: "Public", type: "object", level: "Unclassified" },
];

export default function BLPPanel() {
    return (
        <AccessPanel
            model="blp"
            title="Bell-LaPadula Lattice"
            description="Partial-order confidentiality lattice. Branches under Secret demonstrate partial ordering — Carol and Dave are incomparable, but both dominate Unclassified."
            graph={BLP_GRAPH}
            defaultEntities={DEFAULT_ENTITIES}
            accent="blue"
            rulesConfig={[
                ["no_read_up", "No read-up (simple security)"],
                ["no_write_down", "No write-down (★-property)"],
            ]}
            rulesDescription={{
                title: "Bell-LaPadula rules",
                body: "No read-up: subject can read only if it dominates the object. No write-down: subject can write only if the object dominates it.",
                badge: "Confidentiality model",
            }}
        />
    );
}