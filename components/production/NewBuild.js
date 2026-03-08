"use client";

import { useState, useEffect, useMemo } from "react";
import { Wrench, QrCode, ArrowRight, Search, Check, AlertCircle, Package, Settings, Plus, RefreshCw } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import clsx from "clsx";

function NewBuild({ onClose, pageName = "Production" }) {
  const [targetType, setTargetType] = useState("Finished_Product"); // Finished_Product, Spare_Part
  // ... (rest of states)
  const [configsList, setConfigsList] = useState([]);
  const [bomsList, setBomsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [scannedEntities, setScannedEntities] = useState([]);
  const [newEntityTag, setNewEntityTag] = useState("");

  const [searchConfigQuery, setSearchConfigQuery] = useState("");
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [activeComponents, setActiveComponents] = useState([]);
  const [componentStocks, setComponentStocks] = useState({}); // { configId: qty }
  const [compSearchQuery, setCompSearchQuery] = useState("");
  const [compSearchResults, setCompSearchResults] = useState([]);
  const [showCompDropdown, setShowCompDropdown] = useState(false);

  // Fetch stocks for active components
  useEffect(() => {
    if (activeComponents.length === 0) {
      setComponentStocks({});
      return;
    }

    const fetchStocks = async () => {
      try {
        const ids = activeComponents.map(c => c.configId).join(",");
        const res = await fetch(`/api/inventory/transactions?summary=true&ids=${ids}`);
        const json = await res.json();
        if (json.success) {
          const stockMap = {};
          json.data.forEach(item => {
            // Summary returns _id as the configId (or fallbackId)
            stockMap[item._id] = item.currentQuantity || 0;
          });
          setComponentStocks(stockMap);
        }
      } catch (err) {
        console.error("Error fetching component stocks:", err);
      }
    };

    const delay = setTimeout(fetchStocks, 500);
    return () => clearTimeout(delay);
  }, [activeComponents]);

  const predictedOutcome = useMemo(() => {
    if (!selectedConfig || !selectedBOM || scannedEntities.length === 0) return null;

    // Total need = component quantity * number of units to build
    const yieldCount = scannedEntities.length;

    for (const comp of activeComponents) {
      const totalRequired = (comp.quantity || 0) * yieldCount;
      const available = componentStocks[comp.configId] || 0;
      if (available < totalRequired) return "Pending";
    }

    return "Completed";
  }, [selectedConfig, selectedBOM, scannedEntities, activeComponents, componentStocks]);

  // Fetch configs and BOMs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sparesRes, productsRes, bomsRes] = await Promise.all([
          fetch("/api/production/config/spares"),
          fetch("/api/production/config/products"),
          fetch("/api/production/bom")
        ]);

        const sparesJson = await sparesRes.json();
        const productsJson = await productsRes.json();
        const bomsJson = await bomsRes.json();

        if (productsJson.success && sparesJson.success) {
          if (targetType === "Finished_Product") {
            setConfigsList(productsJson.data || []);
          } else {
            setConfigsList(sparesJson.data || []);
          }
        }

        if (bomsJson.success) {
          setBomsList(bomsJson.data || []);
        }
      } catch (err) {
        console.error("Error fetching build data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [targetType]);

  const filteredConfigs = useMemo(() => {
    const s = searchConfigQuery.toLowerCase();
    return configsList.filter(cfg => {
      if (targetType === "Finished_Product") {
        return cfg.productName?.toLowerCase().includes(s) || cfg.serialNumber?.toLowerCase().includes(s);
      } else {
        return cfg.itemName?.toLowerCase().includes(s) || cfg.itemCode?.toLowerCase().includes(s);
      }
    });
  }, [configsList, searchConfigQuery, targetType]);

  const availableBOMs = useMemo(() => {
    if (!selectedConfig) return [];
    const configId = selectedConfig._id;
    // The BOM targetConfigId should match our selectedConfig._id
    return bomsList.filter(bom => (bom.targetConfigId?._id || bom.targetConfigId) === configId);
  }, [selectedConfig, bomsList, targetType]);

  useEffect(() => {
    if (availableBOMs.length === 1) {
      setSelectedBOM(availableBOMs[0]);
    } else {
      setSelectedBOM(null);
    }
  }, [availableBOMs]);

  useEffect(() => {
    if (selectedBOM) {
      setActiveComponents(selectedBOM.components.map(c => ({
        configId: c.configId?._id ? String(c.configId._id) : String(c.configId),
        configModel: c.configModel || "ComponentConfig",
        itemName: c.itemName || (c.configId?.itemName || ""),
        quantity: c.requiredQuantity,
        isOverride: false
      })));
    } else {
      setActiveComponents([]);
    }
  }, [selectedBOM]);

  useEffect(() => {
    if (compSearchQuery.length > 2) {
      const delay = setTimeout(async () => {
        try {
          // Point to Config APIs instead of live items
          const [compRes, spareRes] = await Promise.all([
            fetch(`/api/production/config/components?search=${compSearchQuery}`),
            fetch(`/api/production/config/spares?search=${compSearchQuery}`)
          ]);

          const compData = await compRes.json();
          const spareData = await spareRes.json();

          let combined = [];
          if (compData.success) {
            combined = [...combined, ...compData.data.map(c => ({ ...c, configModel: "ComponentConfig" }))];
          }
          if (spareData.success) {
            combined = [...combined, ...spareData.data.map(s => ({ ...s, configModel: "SpareConfig" }))];
          }

          setCompSearchResults(combined);
        } catch (e) {
          console.error("Comp search error", e);
        }
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [compSearchQuery, targetType]);

  const addManualComponent = (item) => {
    const configIdStr = String(item._id);
    const exists = activeComponents.find(c => c.configId === configIdStr);
    if (exists) return;
    setActiveComponents([...activeComponents, {
      configId: configIdStr,
      configModel: item.configModel,
      itemName: item.itemName,
      quantity: 1,
      isOverride: true
    }]);
    setCompSearchQuery("");
    setShowCompDropdown(false);
  };

  const removeComponent = (index) => {
    setActiveComponents(activeComponents.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, typedQty) => {
    const qty = typedQty === "" ? "" : parseFloat(typedQty);
    setActiveComponents(activeComponents.map((c, i) =>
      i === index ? { ...c, quantity: qty, isOverride: true } : c
    ));
  };

  const handleAddEntity = (e) => {
    e.preventDefault();
    if (!newEntityTag.trim()) return;
    if (scannedEntities.includes(newEntityTag.trim().toUpperCase())) return;
    setScannedEntities([...scannedEntities, newEntityTag.trim().toUpperCase()]);
    setNewEntityTag("");
  };

  const handleFinalize = async () => {
    if (!selectedConfig || !selectedBOM) return;

    setIsSaving(true);
    setSaveMessage({ type: "", text: "" });

    try {
      const batchId = `BATCH-${Date.now()}`;

      const payload = {
        batchId,
        targetType,
        configId: selectedConfig._id,
        configModel: targetType === "Finished_Product" ? "ProductConfig" : "SpareConfig",
        configName: targetType === "Finished_Product" ? selectedConfig.productName : selectedConfig.itemName,
        bomNumber: selectedBOM.bomNumber,
        bomVersion: selectedBOM.version,
        scannedEntities,
        components: activeComponents,
        configDetails: selectedConfig
      };

      const res = await fetch("/api/production/assembly-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to process assembly.");
      }

      if (result.status === "Pending") {
        setSaveMessage({
          type: "warning",
          text: result.message || "Assembly saved as PENDING."
        });
      } else {
        setSaveMessage({
          type: "success",
          text: result.message || `Successfully assembled ${scannedEntities.length} unit(s).`
        });
      }

      // Reset & Close
      setTimeout(() => {
        setScannedEntities([]);
        setSelectedConfig(null);
        setSelectedBOM(null);
        setSearchConfigQuery("");
        setSaveMessage({ type: "", text: "" });
        if (onClose) onClose(true);
      }, 2000);

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
              <Wrench className="mr-2 text-indigo-600 h-6 w-6" />
              New Assembly Production
            </h2>
            <p className="text-xs text-slate-500 font-medium">Scan entities and bind components into a finished product.</p>
          </div>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 text-slate-400 rotate-45" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => {
                  setTargetType("Finished_Product");
                  setSelectedConfig(null);
                  setSelectedBOM(null);
                  setSearchConfigQuery("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "Finished_Product" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Finished Product
              </button>
              <button
                onClick={() => {
                  setTargetType("Spare_Part");
                  setSelectedConfig(null);
                  setSelectedBOM(null);
                  setSearchConfigQuery("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${targetType === "Spare_Part" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Spare Assembly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    1. Select Build Configuration
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={targetType === "Finished_Product" ? "Search product models..." : "Search spare configs..."}
                      className="block w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      value={searchConfigQuery}
                      onChange={(e) => {
                        setSearchConfigQuery(e.target.value);
                        setShowConfigDropdown(true);
                      }}
                      onFocus={() => setShowConfigDropdown(true)}
                    />
                    {selectedConfig && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />}

                    {showConfigDropdown && (
                      <div className="absolute z-10 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto" onMouseLeave={() => setShowConfigDropdown(false)}>
                        {filteredConfigs.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-sm italic">No configurations found</div>
                        ) : (
                          filteredConfigs.map(cfg => (
                            <div
                              key={cfg._id}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setSelectedConfig(cfg);
                                setSearchConfigQuery(targetType === "Finished_Product" ? cfg.productName : cfg.itemName);
                                setShowConfigDropdown(false);
                              }}
                            >
                              <div className="font-bold text-slate-900 text-sm">
                                {targetType === "Finished_Product" ? cfg.serialNumber : cfg.itemCode}
                              </div>
                              <div className="text-xs text-slate-500">
                                {targetType === "Finished_Product" ? cfg.productName : cfg.itemName}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    2. Select Active BOM
                  </label>
                  {selectedConfig ? (
                    availableBOMs.length === 0 ? (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs font-medium">
                        <AlertCircle className="h-4 w-4" /> No active BOM found for this configuration.
                      </div>
                    ) : (
                      <select
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        value={selectedBOM?._id || ""}
                        onChange={(e) => setSelectedBOM(availableBOMs.find(b => b._id === e.target.value))}
                      >
                        {availableBOMs.length > 1 && <option value="">Select a recipe...</option>}
                        {availableBOMs.map(bom => (
                          <option key={bom._id} value={bom._id}>{bom.bomNumber} (v{bom.version})</option>
                        ))}
                      </select>
                    )
                  ) : (
                    <div className="text-slate-400 text-xs italic p-3 border border-dashed border-slate-200 rounded-xl">Select a configuration first</div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">
                    3. Manage Build Components (Recipe)
                  </label>
                  {activeComponents.some(c => c.isOverride) && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase">
                      BOM Overridden
                    </span>
                  )}
                </div>

                {selectedBOM ? (
                  <div className="space-y-4">
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2">Component</th>
                            <th className="px-4 py-2 w-32">Per Unit</th>
                            <th className="px-4 py-2 w-32 text-center">Batch Need</th>
                            <th className="px-4 py-2 w-32 text-right">Available</th>
                            <th className="px-4 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {activeComponents.map((comp, index) => {
                            const batchNeeded = (comp.quantity || 0) * (scannedEntities.length || 0);
                            const available = componentStocks[comp.configId] || 0;
                            const isShort = scannedEntities.length > 0 && available < batchNeeded;

                            return (
                              <tr key={`${comp.configId}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="font-bold text-slate-900 leading-tight">{comp.itemName}</p>
                                  {comp.isOverride && <span className="text-[9px] text-indigo-500 font-bold uppercase italic">Custom Addition</span>}
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-center"
                                    value={comp.quantity === "" ? "" : (isNaN(comp.quantity) ? 0 : comp.quantity)}
                                    onChange={(e) => updateQuantity(index, e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className="font-black text-slate-500 text-xs">{batchNeeded || "-"}</span>
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
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => removeComponent(index)}
                                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                  >
                                    &times;
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="relative">
                      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Add manual component to build..."
                        className="block w-full pl-9 pr-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        value={compSearchQuery}
                        onChange={(e) => {
                          setCompSearchQuery(e.target.value);
                          setShowCompDropdown(true);
                        }}
                        onFocus={() => setShowCompDropdown(true)}
                      />
                      {showCompDropdown && compSearchResults.length > 0 && (
                        <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto" onMouseLeave={() => setShowCompDropdown(false)}>
                          {compSearchResults.map(item => (
                            <div
                              key={item._id}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => addManualComponent(item)}
                            >
                              <div className="font-bold text-slate-800 text-[11px]">{item.itemName}</div>
                              <div className="text-[10px] text-slate-400">{item.itemCode} | {item.make}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs italic p-4 border border-dashed border-slate-200 rounded-xl text-center">
                    Select a configuration and BOM to load components
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
                <label className="block text-sm font-bold text-slate-700">
                  4. Scan Tag / Assign Serial
                </label>
                <form onSubmit={handleAddEntity} className="relative">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="SCAN HEX TAG OR MANUAL SN"
                    className="block w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all uppercase font-mono"
                    value={newEntityTag}
                    onChange={(e) => setNewEntityTag(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    disabled={!selectedConfig || !selectedBOM}
                  >
                    ADD
                  </button>
                </form>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[200px]">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Assigned Entities ({scannedEntities.length})
                  </h3>
                  {scannedEntities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-slate-300 h-32">
                      <QrCode className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs font-medium">No tags scanned yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {scannedEntities.map((tag, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-lg group shadow-sm">
                          <span className="font-mono text-xs font-bold text-slate-700">{tag}</span>
                          <button
                            onClick={() => setScannedEntities(scannedEntities.filter((_, idx) => idx !== i))}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
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
                      <div className="text-sm font-bold text-slate-900">{selectedConfig ? (targetType === "Finished_Product" ? selectedConfig.productName : selectedConfig.itemName) : "-"}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedConfig ? (targetType === "Finished_Product" ? selectedConfig.serialNumber : selectedConfig.itemCode) : "No selected"}</div>
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
                    <span className="text-sm font-bold text-slate-900">{selectedBOM ? `${selectedBOM.bomNumber} (v${selectedBOM.version})` : "-"}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm text-slate-500 font-semibold">Batch Yield</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">{scannedEntities.length} unit(s)</span>
                      {scannedEntities.length > 0 && (
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                          Consuming {activeComponents.length} components per unit
                        </div>
                      )}
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
                  disabled={!selectedConfig || !selectedBOM || isSaving}
                  className={clsx(
                    "w-full px-6 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:scale-100 border text-white",
                    scannedEntities.length === 0
                      ? "bg-slate-700 hover:bg-slate-800 border-slate-800"
                      : predictedOutcome === "Pending"
                        ? "bg-slate-500 hover:bg-slate-600 border-slate-600"
                        : "bg-indigo-600 hover:bg-indigo-700 border-indigo-700",
                    "disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  )}
                >
                  {isSaving ? "Processing..." : (
                    <>
                      <Package className="w-4 h-4" />
                      {scannedEntities.length === 0
                        ? "Save Progress as Draft"
                        : predictedOutcome === "Pending"
                          ? "Save as Pending Build"
                          : `Finalize ${targetType === "Finished_Product" ? "Assembly" : "Spare"} Build`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest font-bold">
                  {scannedEntities.length === 0
                    ? "Build progress will be saved for later serial assignment"
                    : predictedOutcome === "Pending"
                      ? "Incomplete build will be recorded for later reassembly"
                      : "This action will update inventory stock entries"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewBuild;

