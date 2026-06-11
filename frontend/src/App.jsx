import { useState } from "react";
import BLPPanel from "./components/BLPPanel";
import BibaPanel from "./components/BibaPanel";
import ComparePanel from "./components/ComparePanel";

const TABS = [
  { id: "blp", label: "Bell-LaPadula", hint: "Confidentiality" },
  { id: "biba", label: "Biba", hint: "Integrity" },
  { id: "compare", label: "Compare", hint: "Side by side" },
];

export default function App() {
  const [tab, setTab] = useState("blp");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Access Control Models
                </h1>
                <p className="text-sm text-slate-500">
                  Interactive lattice visualization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              API connected
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`tab-pill flex-1 sm:flex-none ${tab === t.id ? "tab-pill-active" : "tab-pill-inactive"}`}
              >
                <span>{t.label}</span>
                <span className={`hidden sm:inline text-xs ${tab === t.id ? "text-indigo-200" : "text-slate-400"}`}>
                  · {t.hint}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {tab === "blp" && <BLPPanel />}
        {tab === "biba" && <BibaPanel />}
        {tab === "compare" && <ComparePanel />}
      </main>
    </div>
  );
}
