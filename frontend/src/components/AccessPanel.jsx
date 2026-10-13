import { useState, useMemo } from "react";
import axios from "axios";
import Lattice from "./Lattice";
import MatrixView from "./MatrixView";

const API = "https://access-control-viz.onrender.com";

export default function AccessPanel({
                                      model,
                                      title,
                                      description,
                                      levels,
                                      colors,
                                      defaultEntities,
                                      rulesConfig,
                                      rulesDescription,
                                      accent = "indigo",
                                    }) {
  const [entities, setEntities] = useState(defaultEntities);
  const [subjectId, setSubjectId] = useState(defaultEntities[0]?.id);
  const [objectId, setObjectId] = useState(
      defaultEntities.find((e) => e.type === "object")?.id ?? defaultEntities[0]?.id,
  );
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [rules, setRules] = useState(
      Object.fromEntries(rulesConfig.map(([k]) => [k, true])),
  );
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState(levels[Math.floor(levels.length / 2)]);
  const [newType, setNewType] = useState("subject");
  const [showMatrix, setShowMatrix] = useState(false); // New state for matrix

  // Dark mode friendly accent classes
  const accentRing = accent === "blue" ? "focus:ring-blue-500/30" : "focus:ring-indigo-500/30";
  const accentBorder = accent === "blue" ? "focus:border-blue-500" : "focus:border-indigo-500";
  const accentBtn =
      accent === "blue"
          ? "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 active:scale-[0.98]"
          : "btn-primary";
  const accentSoft = accent === "blue"
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
  const accentCheckbox = accent === "blue" ? "accent-blue-500" : "accent-indigo-500";

  async function checkAccess(op) {
    const subject = entities.find((e) => e.id === subjectId);
    const object = entities.find((e) => e.id === objectId);
    try {
      const { data } = await axios.post(`${API}/check-access`, {
        model,
        subject_level: subject.level,
        object_level: object.level,
        operation: op,
        rules,
      });
      setResult({ ...data, subject: subject.name, object: object.name, op });
      setLog((l) =>
          [{ ...data, subject: subject.name, object: object.name, op, ts: new Date().toLocaleTimeString() }, ...l].slice(0, 50),
      );
    } catch {
      setResult({ allowed: false, reason: "Backend offline — check the API connection." });
    }
  }

  function addEntity() {
    setEntities((es) => [
      ...es,
      { id: Date.now(), name: newName || "New", type: newType, level: newLevel },
    ]);
    setNewName("");
  }

  const subjects = entities.filter((e) => e.type === "subject");
  const objects = entities.filter((e) => e.type === "object");

  const stats = useMemo(() => {
    const byLevel = {};
    levels.forEach((l) => (byLevel[l] = 0));
    entities.forEach((e) => (byLevel[e.level] = (byLevel[e.level] || 0) + 1));
    return byLevel;
  }, [entities, levels]);

  return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">{description}</p>
          </div>
          <button
              onClick={() => setShowMatrix(!showMatrix)}
              className={`shrink-0 text-sm ${showMatrix ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showMatrix ? "Hide Matrix" : "Generate Matrix"}
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {levels.map((lvl) => (
              <div key={lvl} className="card-padded flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-300">{lvl}</div>
                  <div className="text-2xl font-semibold text-white">{stats[lvl]}</div>
                </div>
                <span
                    className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: colors[lvl] + "33", color: colors[lvl] }}
                >
              {stats[lvl]} {stats[lvl] === 1 ? "entity" : "entities"}
            </span>
              </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Lattice
                levels={levels}
                entities={entities}
                colors={colors}
                onMove={(id, level) =>
                    setEntities((es) => es.map((e) => (e.id === id ? { ...e, level } : e)))
                }
            />

            {/* Render the Matrix below the Lattice */}
            {showMatrix && (
                <MatrixView
                    model={model}
                    subjects={subjects}
                    objects={objects}
                    rules={rules}
                    levels={levels}
                />
            )}

            <div className={`card-padded flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <p className="text-sm font-semibold text-slate-200">{rulesDescription.title}</p>
                <p className="mt-1 text-sm text-slate-300">{rulesDescription.body}</p>
              </div>
              <div className={`rounded-xl px-3 py-2 text-xs font-medium ${accentSoft}`}>
                {rulesDescription.badge}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-padded">
              <p className="section-label mb-3">Active Rules</p>
              <div className="space-y-3">
                {rulesConfig.map(([k, label]) => (
                    <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                      <span className="text-slate-200">{label}</span>
                      <input
                          type="checkbox"
                          checked={rules[k]}
                          onChange={(e) => setRules((r) => ({ ...r, [k]: e.target.checked }))}
                          className={`h-4 w-4 rounded ${accentCheckbox}`}
                      />
                    </label>
                ))}
              </div>
            </div>

            <div className="card-padded space-y-3">
              <p className="section-label">Request Access</p>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Subject</label>
                <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(+e.target.value)}
                    className={`input-field ${accentBorder} ${accentRing}`}
                >
                  {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Object</label>
                <select
                    value={objectId}
                    onChange={(e) => setObjectId(+e.target.value)}
                    className={`input-field ${accentBorder} ${accentRing}`}
                >
                  {objects.map((o) => (
                      <option key={o.id} value={o.id}>{o.name} ({o.level})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => checkAccess("read")} className={accentBtn}>
                  <ReadIcon /> Read
                </button>
                <button onClick={() => checkAccess("write")} className="btn-secondary">
                  <WriteIcon /> Write
                </button>
                <button onClick={() => checkAccess("execute")} className="btn-secondary">
                  <ExecIcon /> Execute
                </button>
              </div>
            </div>

            {result && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`card-padded text-sm ${
                        result.allowed
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-rose-500/30 bg-rose-500/10"
                    }`}
                >
                  <p className={`mb-1 text-base font-semibold ${result.allowed ? "text-emerald-400" : "text-rose-400"}`}>
                    {result.allowed ? "Access granted" : "Access denied"}
                  </p>
                  <p className="text-slate-200">{result.subject} → {result.op} → {result.object}</p>
                  <p className="mt-1 text-xs text-slate-300">{result.reason}</p>
                </div>
            )}

            <div className="card-padded space-y-3">
              <p className="section-label">Add Entity</p>
              <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name"
                  className={`input-field ${accentBorder} ${accentRing}`}
              />
              <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className={`input-field ${accentBorder} ${accentRing}`}
              >
                {levels.map((l) => <option key={l}>{l}</option>)}
              </select>
              <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className={`input-field ${accentBorder} ${accentRing}`}
              >
                <option value="subject">Subject (person)</option>
                <option value="object">Object (resource)</option>
              </select>
              <button onClick={addEntity} className={`w-full ${accentBtn}`}>+ Add entity</button>
            </div>

            <div className="card-padded">
              <p className="section-label mb-3">Access Log</p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {log.length === 0 && <p className="text-xs text-slate-300">No requests yet.</p>}
                {log.map((l, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ${
                            l.allowed
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}
                    >
                  <span>
                    <span className="text-slate-300">{l.ts}</span>{" "}
                    <span className="font-medium text-slate-100">{l.subject}</span> {l.op}s{" "}
                    <span className="font-medium text-slate-100">{l.object}</span>
                  </span>
                      <span className="font-semibold">{l.allowed ? "✓" : "✗"}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function ReadIcon() {
  return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
  );
}

function WriteIcon() {
  return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20h9"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
  );
}

function ExecIcon() {
  return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
  );
}