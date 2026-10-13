import { useState, useMemo } from "react";
import axios from "axios";
import Lattice from "./Lattice";
import MatrixView from "./MatrixView";
import { getAllNodes } from "./graphUtils";

const API = "https://access-control-viz.onrender.com";

export default function AccessPanel({
                                      model,
                                      title,
                                      description,
                                      graph,
                                      defaultEntities,
                                      rulesConfig,
                                      rulesDescription,
                                      accent = "indigo",
                                    }) {
  const allNodes = useMemo(() => getAllNodes(graph), [graph]);

  const [entities, setEntities] = useState(defaultEntities);
  const [subjectId, setSubjectId] = useState(
      defaultEntities.find((e) => e.type === "subject")?.id ?? null
  );
  const [objectId, setObjectId] = useState(
      defaultEntities.find((e) => e.type === "object")?.id ?? null
  );
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [rules, setRules] = useState(
      Object.fromEntries(rulesConfig.map(([k]) => [k, true]))
  );
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState(allNodes[0]);
  const [newType, setNewType] = useState("subject");
  const [showMatrix, setShowMatrix] = useState(false);

  const accentRing =
      accent === "blue" ? "focus:ring-blue-500/30" : "focus:ring-indigo-500/30";
  const accentBorder =
      accent === "blue" ? "focus:border-blue-500" : "focus:border-indigo-500";
  const accentBtn =
      accent === "blue"
          ? "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 active:scale-[0.98]"
          : "btn-primary";
  const accentSoft =
      accent === "blue"
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
  const accentCheckbox =
      accent === "blue" ? "accent-blue-500" : "accent-indigo-500";

  function addLog(action, details, allowed = null) {
    setLog((prev) => [
      {
        id: Date.now() + Math.random(),
        ts: new Date().toLocaleTimeString(),
        action,
        details,
        allowed,
      },
      ...prev,
    ]);
  }

  async function checkAccess(op) {
    if (!subjectId || !objectId) {
      setResult({
        allowed: false,
        reason: "Please create at least one subject and one object.",
      });
      return;
    }

    const subject = entities.find((e) => e.id === subjectId);
    const object = entities.find((e) => e.id === objectId);
    if (!subject || !object) return;

    try {
      const { data } = await axios.post(`${API}/check-access`, {
        model,
        subject_level: subject.level,
        object_level: object.level,
        operation: op,
        rules,
        graph, // Send the graph so the backend can do partial-order checks
      });
      setResult({ ...data, subject: subject.name, object: object.name, op });

      addLog(
          "ACCESS_REQUEST",
          `${subject.name} (${subject.level}) → ${op.toUpperCase()} → ${object.name} (${object.level})`,
          data.allowed
      );
    } catch {
      setResult({
        allowed: false,
        reason: "Backend offline — check the API connection.",
      });
    }
  }

  function addEntity() {
    const name = newName || "New";
    setEntities((es) => [
      ...es,
      { id: Date.now(), name, type: newType, level: newLevel },
    ]);
    addLog("ADD_ENTITY", `Added ${newType} "${name}" at node "${newLevel}"`);
    setNewName("");
  }

  function deleteEntity(id) {
    const entity = entities.find((e) => e.id === id);
    if (!entity) return;

    const updated = entities.filter((e) => e.id !== id);
    setEntities(updated);
    addLog(
        "DELETE_ENTITY",
        `Deleted ${entity.type} "${entity.name}" (Node: ${entity.level})`
    );

    if (subjectId === id) {
      const remainingSubjects = updated.filter((e) => e.type === "subject");
      setSubjectId(remainingSubjects[0]?.id ?? null);
    }
    if (objectId === id) {
      const remainingObjects = updated.filter((e) => e.type === "object");
      setObjectId(remainingObjects[0]?.id ?? null);
    }
  }

  function handleMoveEntity(id, newLevel) {
    const entity = entities.find((e) => e.id === id);
    if (!entity || entity.level === newLevel) return;

    setEntities((es) =>
        es.map((e) => (e.id === id ? { ...e, level: newLevel } : e))
    );
    addLog(
        "MOVE_ENTITY",
        `Moved ${entity.type} "${entity.name}" from "${entity.level}" → "${newLevel}"`
    );
  }

  function handleRuleToggle(key, checked) {
    setRules((r) => ({ ...r, [key]: checked }));
    addLog("TOGGLE_RULE", `${checked ? "Enabled" : "Disabled"} rule: "${key}"`);
  }

  function downloadLog() {
    if (log.length === 0) return;

    const header = "Timestamp,Action,Details,Allowed\n";
    const rows = log
        .map((l) => {
          const allowedStr =
              l.allowed === null ? "N/A" : l.allowed ? "YES" : "NO";
          const safeDetails = `"${l.details.replace(/"/g, '""')}"`;
          return `${l.ts},${l.action},${safeDetails},${allowedStr}`;
        })
        .join("\n");

    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-control-log-${model}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const subjects = entities.filter((e) => e.type === "subject");
  const objects = entities.filter((e) => e.type === "object");

  return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">{description}</p>
          </div>
          <button
              onClick={() => setShowMatrix(!showMatrix)}
              className={`shrink-0 text-sm ${
                  showMatrix ? "btn-secondary" : "btn-primary"
              }`}
          >
            {showMatrix ? "Hide Matrix" : "Generate Matrix"}
          </button>
        </header>

        {/* Compact summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Subjects" value={subjects.length} color="#6366f1" />
          <SummaryCard label="Objects" value={objects.length} color="#06b6d4" />
          <SummaryCard
              label="Lattice Nodes"
              value={allNodes.length}
              color="#a855f7"
          />
          <SummaryCard
              label="Total Entities"
              value={entities.length}
              color="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Lattice
                graph={graph}
                entities={entities}
                onMove={handleMoveEntity}
                onDelete={deleteEntity}
            />

            {showMatrix && (
                <MatrixView
                    model={model}
                    subjects={subjects}
                    objects={objects}
                    rules={rules}
                    graph={graph}
                />
            )}

            <div className="card-padded flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {rulesDescription.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {rulesDescription.body}
                </p>
              </div>
              <div
                  className={`rounded-xl px-3 py-2 text-xs font-medium ${accentSoft}`}
              >
                {rulesDescription.badge}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-padded">
              <p className="section-label mb-3">Active Rules</p>
              <div className="space-y-3">
                {rulesConfig.map(([k, label]) => (
                    <label
                        key={k}
                        className="flex cursor-pointer items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-200">{label}</span>
                      <input
                          type="checkbox"
                          checked={rules[k]}
                          onChange={(e) => handleRuleToggle(k, e.target.checked)}
                          className={`h-4 w-4 rounded ${accentCheckbox}`}
                      />
                    </label>
                ))}
              </div>
            </div>

            <div className="card-padded space-y-3">
              <p className="section-label">Request Access</p>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Subject
                </label>
                <select
                    value={subjectId || ""}
                    onChange={(e) => setSubjectId(+e.target.value)}
                    className={`input-field ${accentBorder} ${accentRing}`}
                    disabled={subjects.length === 0}
                >
                  {subjects.length === 0 && (
                      <option value="">No subjects available</option>
                  )}
                  {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.level})
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Object</label>
                <select
                    value={objectId || ""}
                    onChange={(e) => setObjectId(+e.target.value)}
                    className={`input-field ${accentBorder} ${accentRing}`}
                    disabled={objects.length === 0}
                >
                  {objects.length === 0 && (
                      <option value="">No objects available</option>
                  )}
                  {objects.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.level})
                      </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => checkAccess("read")}
                    className={accentBtn}
                    disabled={subjects.length === 0 || objects.length === 0}
                >
                  <ReadIcon /> Read
                </button>
                <button
                    onClick={() => checkAccess("write")}
                    className="btn-secondary"
                    disabled={subjects.length === 0 || objects.length === 0}
                >
                  <WriteIcon /> Write
                </button>
                <button
                    onClick={() => checkAccess("execute")}
                    className="btn-secondary"
                    disabled={subjects.length === 0 || objects.length === 0}
                >
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
                  <p
                      className={`mb-1 text-base font-semibold ${
                          result.allowed ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {result.allowed ? "Access granted" : "Access denied"}
                  </p>
                  <p className="text-slate-200">
                    {result.subject} → {result.op} → {result.object}
                  </p>
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
                {allNodes.map((n) => (
                    <option key={n}>{n}</option>
                ))}
              </select>
              <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className={`input-field ${accentBorder} ${accentRing}`}
              >
                <option value="subject">Subject (person)</option>
                <option value="object">Object (resource)</option>
              </select>
              <button onClick={addEntity} className={`w-full ${accentBtn}`}>
                + Add entity
              </button>
            </div>

            <div className="card-padded">
              <div className="flex items-center justify-between mb-3">
                <p className="section-label">Activity Log</p>
                <button
                    onClick={downloadLog}
                    disabled={log.length === 0}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download CSV
                </button>
              </div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {log.length === 0 && (
                    <p className="text-xs text-slate-500">No activity yet.</p>
                )}
                {log.map((l) => {
                  const styles =
                      l.allowed === null
                          ? "bg-slate-800/50 text-slate-300 border border-slate-700"
                          : l.allowed
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-300 border border-rose-500/20";

                  return (
                      <div
                          key={l.id}
                          className={`flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-xs ${styles}`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-70">
                          <span>{l.ts}</span>
                          <span className="font-mono">{l.action}</span>
                        </div>
                        <span className="font-medium leading-tight">
                      {l.details}
                    </span>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
      <div className="card-padded flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">{label}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
        <div
            className="h-10 w-1 rounded-full"
            style={{ background: color }}
        ></div>
      </div>
  );
}

function ReadIcon() {
  return (
      <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
      >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
  );
}

function WriteIcon() {
  return (
      <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20h9" />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"
        />
      </svg>
  );
}

function ExecIcon() {
  return (
      <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
      >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
  );
}