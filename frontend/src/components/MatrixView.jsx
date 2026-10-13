import { dominates } from "./graphUtils";

export default function MatrixView({ model, subjects, objects, rules, graph }) {
    // Frontend Rule Engine — uses graph traversal for partial order
    const evaluateAccess = (subjectLevel, objectLevel, operation) => {
        if (model === "blp") {
            if (operation === "read" || operation === "execute") {
                if (!rules.no_read_up) return true;
                return dominates(subjectLevel, objectLevel, graph);
            }
            if (operation === "write") {
                if (!rules.no_write_down) return true;
                return dominates(objectLevel, subjectLevel, graph);
            }
        }

        if (model === "biba") {
            if (operation === "write") {
                if (!rules.no_write_up) return true;
                return dominates(objectLevel, subjectLevel, graph);
            }
            if (operation === "read" || operation === "execute") {
                if (!rules.no_read_down) return true;
                return dominates(subjectLevel, objectLevel, graph);
            }
        }
        return false;
    };

    const RightsBadge = ({ allowed, label }) => (
        <span
            title={allowed ? `${label} Allowed` : `${label} Denied`}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border transition ${
                allowed
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-900/50"
                    : "bg-slate-800 text-slate-600 border-slate-700 line-through opacity-60"
            }`}
        >
      {label}
    </span>
    );

    return (
        <div className="card-padded overflow-x-auto mt-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Access Control Matrix
                    </h3>
                    <p className="text-sm text-slate-400">
                        Generated dynamically from current entities, rules, and{" "}
                        {model.toUpperCase()} partial-order model
                    </p>
                </div>
            </div>

            <table className="w-full text-sm border-collapse min-w-[700px]">
                <thead>
                <tr>
                    <th className="p-3 border border-slate-700 bg-slate-800/80 text-left font-medium text-slate-300 rounded-tl-xl w-48">
                        Subject \ Object
                    </th>
                    {objects.map((obj) => (
                        <th
                            key={obj.id}
                            className="p-3 border border-slate-700 bg-slate-800/80 font-medium text-slate-300 text-center"
                        >
                <span className="block truncate max-w-[120px] mx-auto text-white">
                  {obj.name}
                </span>
                            <div className="text-[10px] font-normal text-slate-400">
                                {obj.level}
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {subjects.map((subj) => (
                    <tr key={subj.id}>
                        <td className="p-3 border border-slate-700 bg-slate-800/50 font-medium text-slate-200">
                <span className="block truncate max-w-[150px] text-white">
                  {subj.name}
                </span>
                            <div className="text-[10px] font-normal text-slate-400">
                                {subj.level}
                            </div>
                        </td>
                        {objects.map((obj) => {
                            const canRead = evaluateAccess(
                                subj.level,
                                obj.level,
                                "read"
                            );
                            const canWrite = evaluateAccess(
                                subj.level,
                                obj.level,
                                "write"
                            );
                            const canExec = evaluateAccess(
                                subj.level,
                                obj.level,
                                "execute"
                            );

                            return (
                                <td
                                    key={obj.id}
                                    className="p-3 border border-slate-700 text-center align-middle bg-slate-900/50"
                                >
                                    <div className="flex justify-center gap-1.5">
                                        <RightsBadge allowed={canRead} label="R" />
                                        <RightsBadge allowed={canWrite} label="W" />
                                        <RightsBadge allowed={canExec} label="X" />
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="mt-5 flex gap-6 text-xs text-slate-400 items-center flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 inline-block"></span>
          Allowed
        </span>
                <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 line-through opacity-60 inline-flex items-center justify-center text-[10px] text-slate-600">
            R
          </span>
          Denied
        </span>
                <span className="text-slate-500 italic ml-auto">
          *R = Read, W = Write, X = Execute
        </span>
            </div>
        </div>
    );
}