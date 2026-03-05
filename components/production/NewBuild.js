"use client";

import { useState, useEffect } from "react";
import { Wrench, QrCode, ArrowRight } from "lucide-react";

function NewBuild() {
  const [components, setComponents] = useState([]);
  const [scannedTag, setScannedTag] = useState("");
  const [taskState, setTaskState] = useState("Pending"); // Pending, In_Progress, Paused, Completed
  const [elapsedTime, setElapsedTime] = useState(0);

  // Mock Timer
  useEffect(() => {
    let interval;
    if (taskState === "In_Progress") {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 60000); // add 1 minute
    }
    return () => clearInterval(interval);
  }, [taskState]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!scannedTag) return;
    setComponents([...components, scannedTag.toUpperCase()]);
    setScannedTag("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Wrench className="mr-2 text-indigo-600 h-6 w-6" />
            Assemble New Product
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select BOM and scan Hex Tags to bind components into a finished
            product.
          </p>
        </div>

        <form onSubmit={handleScan} className="mb-6 relative">
          <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={scannedTag}
            onChange={(e) => setScannedTag(e.target.value)}
            className="block w-full pl-10 pr-24 py-3 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-semibold uppercase tracking-widest"
            placeholder="SCAN HEX TAG OR BULK BARCODE"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            ADD
          </button>
        </form>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[300px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Scanned Entities ({components.length})
          </h3>
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 h-48">
              <QrCode className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm font-semibold">No entities scanned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {components.map((c, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 flex items-center justify-between group"
                >
                  <span className="font-mono text-sm font-bold text-slate-700">
                    {c}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setComponents(components.filter((_, idx) => idx !== i))
                    }
                    className="text-slate-300 hover:text-red-500 hidden group-hover:block transition-colors text-xs font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Digital Job Card & Auto-SN
        </h3>

        {/* Job Card Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-600">
              Task: PCBA Soldering
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {taskState === "In_Progress" && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${taskState === "In_Progress" ? "bg-emerald-500" : taskState === "Completed" ? "bg-blue-500" : "bg-amber-400"}`}
                ></span>
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                {taskState.replace("_", " ")} ({elapsedTime}m)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {taskState !== "In_Progress" && taskState !== "Completed" && (
              <button
                onClick={() => setTaskState("In_Progress")}
                className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold py-2 rounded-lg transition-colors"
              >
                START TASK
              </button>
            )}
            {taskState === "In_Progress" && (
              <>
                <button
                  onClick={() => setTaskState("Paused")}
                  className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  PAUSE
                </button>
                <button
                  onClick={() => setTaskState("Completed")}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  FINISH TASK
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex justify-between items-center py-2 border-b border-slate-200 bg-white rounded-lg p-3">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Target Smart Serial
            </span>
            <span className="text-sm font-mono font-bold text-indigo-600">
              B26020001 (Auto-gen)
            </span>
          </div>

          <div className="flex justify-between items-center text-sm p-3 bg-rose-50 border border-rose-100 shadow-sm rounded-lg">
            <span className="font-semibold text-slate-700">
              Cooling Fan Array{" "}
              <span className="text-xs text-slate-400 ml-2 font-mono">
                Pending
              </span>
            </span>
            <span className="font-bold text-rose-600">
              Missing Sub-assembly
            </span>
          </div>
          <div className="flex justify-between items-center text-sm p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
            <span className="font-semibold text-slate-700">
              Power Supply Unit{" "}
              <span className="text-xs text-slate-400 ml-2 font-mono">
                HX-PSU-4411
              </span>
            </span>
            <span className="font-bold text-emerald-600">Passed QC</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200 mt-4">
            <span className="text-sm font-semibold text-slate-600">
              Base BOM Cost
            </span>
            <span className="text-sm font-bold text-slate-900">â‚¹ 0.00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-600">
              Assigned Labor
            </span>
            <span className="text-sm font-bold text-emerald-600">
              â‚¹ 450.00/hr
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-600">
              Prev. Month Overhead Factor
            </span>
            <span className="text-sm font-bold text-rose-600">
              + â‚¹ 145.00/unit
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Est. Transfer Price
            </span>
            <span className="text-3xl font-black text-indigo-700">
              â‚¹ 595.00
            </span>
          </div>
          <button
            disabled={components.length === 0}
            className="w-full flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalize Auto-Serial Build <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default NewBuild;

