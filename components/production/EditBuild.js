"use client";

import { useState, useEffect, useMemo } from "react";
import { Wrench, QrCode, ArrowRight, Check, AlertCircle, Package, Settings, Plus, RefreshCcw } from "lucide-react";
import clsx from "clsx";

function EditBuild({ logData, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [scannedTag, setScannedTag] = useState(logData?.entityTag || "");
  const [tagInput, setTagInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [componentStocks, setComponentStocks] = useState({}); // { itemId: qty }

  const activeComponents = logData?.components || [];
  const targetType = logData?.targetType || "Finished_Product";

  // Fetch stocks for active components
  useEffect(() => {
    if (activeComponents.length === 0) return;

    const fetchStocks = async () => {
      try {
        const ids = activeComponents.map(c => c.configId).join(",");
        const res = await fetch(`/api/inventory/transactions?summary=true&ids=${ids}`);
        const json = await res.json();
        if (json.success) {
          const stockMap = {};
          json.data.forEach(item => {
            const id = item._id.item || item._id.product || item._id;
            stockMap[id] = item.currentQuantity || 0;
          });
          setComponentStocks(stockMap);
        }
      } catch (err) {
        console.error("Error fetching component stocks:", err);
      }
    };

    fetchStocks();
  }, [activeComponents]);

  const predictedOutcome = useMemo(() => {
    // Total need = component quantity * 1 unit (retries are single unit)
    for (const comp of activeComponents) {
      const totalRequired = comp.quantity || 0;
      const available = componentStocks[comp.configId] || 0;
      if (available < totalRequired) return "Pending";
    }
    return "Completed";
  }, [activeComponents, componentStocks]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    setScannedTag(tagInput.trim().toUpperCase());
    setTagInput("");
  };

  const handleFinalize = async () => {
    if (!scannedTag) {
      setSaveMessage({ type: "error", text: "Please scan an entity tag to finalize this draft." });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/production/assembly-log", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: logData._id, newTag: scannedTag })
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to retry assembly.");
      }

      setSaveMessage({
        type: result.status === "Pending" ? "warning" : "success",
        text: result.message || "Assembly successfully completed."
      });

      // Reset & Close
      setTimeout(() => {
        if (onClose) onClose(true);
      }, 1500);

    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-white w-full max-w-6xl max-h-full overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <RefreshCcw className="mr-2 text-indigo-600 h-6 w-6" />
              Edit Assembly Production
            </h2>
            <p className="text-xs text-slate-500 font-medium">Reassemble pending units or finalize draft assemblies.</p>
          </div>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 text-slate-400 rotate-45" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    1. Locked Recipe Components
                  </label>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                    Read Only
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2">Component</th>
                          <th className="px-4 py-2 w-32 text-center">Required</th>
                          <th className="px-4 py-2 w-32 text-right">Available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {activeComponents.map((comp, index) => {
                          const required = comp.quantity || 0;
                          const available = componentStocks[comp.configId] || 0;
                          const isShort = available < required;

                          return (
                            <tr key={`${comp.configId}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-900 leading-tight">{comp.itemName}</p>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className="font-black text-slate-500 text-xs">{required}</span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex flex-col items-end">
                                  <span className={clsx(
                                    "font-black text-sm",
                                    isShort ? "text-rose-600" : "text-emerald-600"
                                  )}>
                                    {available}
                                  </span>
                                  {isShort && (
                                    <span className="text-[8px] font-black text-rose-500 uppercase leading-none mt-0.5">
                                      Shortage
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <label className="block text-sm font-bold text-slate-700">
                  2. Scan Tag / Assign Serial
                </label>

                {!logData?.entityTag && !scannedTag ? (
                  <form onSubmit={handleAddTag} className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="SCAN HEX TAG OR MANUAL SN"
                      className="block w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all uppercase font-mono"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      ADD
                    </button>
                  </form>
                ) : null}

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[100px]">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Assigned Entity Tag
                  </h3>
                  {!scannedTag ? (
                    <div className="flex flex-col items-center justify-center text-slate-300 h-16">
                      <p className="text-xs font-medium">No tag assigned</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                      <span className="font-mono text-sm font-bold text-slate-700">{scannedTag}</span>
                      {!logData?.entityTag && (
                        <button
                          onClick={() => setScannedTag("")}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <Wrench className="w-48 h-48 rotate-12 text-slate-900" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                    Build Summary
                  </h3>
                  {predictedOutcome && (
                    <div className={clsx(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-sm bg-white",
                      predictedOutcome === "Completed"
                        ? "border-emerald-200 text-emerald-600"
                        : "border-amber-200 text-amber-600"
                    )}>
                      {predictedOutcome === "Completed" ? (
                        <>
                          <Check className="w-3 h-3" />
                          Ready for Completion
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Pending: Stock Shortage
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <span className="text-sm text-slate-500 font-semibold">Configuration</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{logData?.configName || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{logData?.configId || "-"}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm text-slate-500 font-semibold">Target Type</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide bg-white border ${targetType === "Finished_Product" ? "border-indigo-100 text-indigo-600" : "border-emerald-100 text-emerald-600"}`}>
                      {targetType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm text-slate-500 font-semibold">BOM Recipe</span>
                    <span className="text-sm font-bold text-slate-900">{logData?.bomNumber} (v{logData?.bomVersion})</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm text-slate-500 font-semibold">Batch Yield</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">1 unit(s)</span>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                        Consuming {activeComponents.length} components
                      </div>
                    </div>
                  </div>

                  {saveMessage.text && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-bold border bg-white shadow-sm ${saveMessage.type === "success" ? "border-emerald-200 text-emerald-600" : saveMessage.type === "warning" ? "border-amber-200 text-amber-600" : "border-rose-200 text-rose-600"}`}>
                      {saveMessage.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      {saveMessage.text}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 relative z-10">
                <button
                  onClick={handleFinalize}
                  disabled={!scannedTag || isSaving}
                  className={clsx(
                    "w-full px-6 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm border text-white",
                    !scannedTag
                      ? "bg-slate-700 hover:bg-slate-800 border-slate-800"
                      : predictedOutcome === "Pending"
                        ? "bg-slate-500 hover:bg-slate-600 border-slate-600 shadow-slate-900/20 active:scale-95"
                        : "bg-indigo-600 hover:bg-indigo-700 border-indigo-700 shadow-indigo-900/40 active:scale-95",
                    "disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  )}
                >
                  {isSaving ? "Processing..." : (
                    <>
                      <Package className="w-4 h-4" />
                      {predictedOutcome === "Pending"
                        ? "Save as Pending Build"
                        : `Finalize Assembly`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditBuild;
