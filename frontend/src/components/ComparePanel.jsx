const MODELS = [
  {
    tag: "Confidentiality",
    tagColor: "bg-blue-50 text-blue-700 ring-blue-100",
    accent: "border-blue-400",
    title: "Bell-LaPadula",
    goal: "Prevent secrets leaking downward",
    rules: [
      {
        name: "No read-up (simple security)",
        color: "text-blue-700",
        desc: "Subject reads only at same or lower classification.",
        formula: "subject.level ≥ object.level",
      },
      {
        name: "No write-down (★-property)",
        color: "text-orange-700",
        desc: "Subject writes only to same or higher classification.",
        formula: "subject.level ≤ object.level",
      },
    ],
    example: "A Top Secret agent can read TS/Secret docs but cannot copy secrets into a Public file.",
  },
  {
    tag: "Integrity",
    tagColor: "bg-violet-50 text-violet-700 ring-violet-100",
    accent: "border-violet-400",
    title: "Biba",
    goal: "Prevent corruption spreading upward",
    rules: [
      {
        name: "No write-up (simple integrity)",
        color: "text-violet-700",
        desc: "Subject writes only to same or lower integrity level.",
        formula: "subject.level ≥ object.level",
      },
      {
        name: "No read-down (invocation)",
        color: "text-fuchsia-700",
        desc: "Subject cannot read from lower integrity level.",
        formula: "subject.level ≤ object.level",
      },
    ],
    example: "A High-integrity process cannot read Low-integrity data — preventing garbage from corrupting reliable outputs.",
  },
];

const COMPARISON = [
  ["Goal", "Confidentiality", "Integrity"],
  ["Read rule", "No read-up", "No read-down"],
  ["Write rule", "No write-down", "No write-up"],
  ["Threat", "Secret leaks out", "Corruption spreads in"],
  ["Used in", "Military, govt", "Financial, medical"],
];

export default function ComparePanel() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Model Comparison</h2>
        <p className="mt-1 text-sm text-slate-500">
          Bell-LaPadula and Biba are exact duals — one protects confidentiality, the other integrity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {MODELS.map((m) => (
          <article key={m.title} className="card-padded space-y-4">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${m.tagColor}`}>
                {m.tag}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{m.goal}</p>
            </div>

            {m.rules.map((rule) => (
              <div key={rule.name} className={`border-l-2 ${m.accent} pl-4`}>
                <p className={`text-sm font-semibold ${rule.color}`}>{rule.name}</p>
                <p className="mt-1 text-sm text-slate-600">{rule.desc}</p>
                <code className="mt-2 block rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-700">
                  {rule.formula}
                </code>
              </div>
            ))}

            <p className="text-xs leading-relaxed text-slate-400">{m.example}</p>
          </article>
        ))}
      </div>

      <div className="card-padded">
        <h3 className="font-semibold text-slate-900">Key insight — they are exact duals</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          BLP controls information flow <strong>downward</strong> (no read-up, no write-down).
          Biba controls contamination <strong>upward</strong> (no write-up, no read-down).
          BLP asks <em>"can this person see this secret?"</em> — Biba asks <em>"can this data be trusted?"</em>
          Real systems like SELinux combine both simultaneously.
        </p>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left font-medium text-slate-500">Property</th>
                <th className="p-3 text-left font-medium text-blue-700">Bell-LaPadula</th>
                <th className="p-3 text-left font-medium text-violet-700">Biba</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([prop, blp, biba], i) => (
                <tr key={prop} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="border-t border-slate-100 p-3 text-xs font-medium text-slate-500">{prop}</td>
                  <td className="border-t border-slate-100 p-3 text-slate-700">{blp}</td>
                  <td className="border-t border-slate-100 p-3 text-slate-700">{biba}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
