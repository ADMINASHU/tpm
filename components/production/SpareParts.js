"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Edit, Trash2, Search, Settings2, Columns, Download, Upload, X, Check, AlertCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getISODateIST } from "@/lib/dateUtils";

function SpareParts({ pageName = "Production" }) {
  const [itemsList, setItemsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const csvInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemCode: "", // Represents Hex Code (4-digit ID)
    itemName: "",
    category: "Spares_Config",
    trackingType: "Serialized",
    ratings: "", // KVA
    volt: "", // DC Voltage
    amp: "", // Current Rating
    addOnPartNumber: "",
    technicalSpecs: {}, // For "Specs Details"
    make: "",
    averageUnitCost: "", // Represents Price
    minStockLevel: 0,
    maxStockLevel: 0,
    status: "Available",
  });

  const [specsInput, setSpecsInput] = useState(""); // Temporary string representation

  // UI State for Columns (Simulating ComponentConfig but simplified for Spares)
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    hexCode: true,
    itemName: true,
    ratings: true,
    voltAmp: true,
    makePrice: true,
    status: true,
    actions: true,
  });

  const fetchSpares = async () => {
    setIsLoading(true);
    try {
      // Re-use items API, but we'll filter on the frontend for simplicity,
      // or the API handles it if we pass a param (currently API returns all limit 20. We'll need to fetch all or pass category)
      // Since API GET doesn't filter by category yet, we'll fetch and filter.
      // Ideal: Update GET /api/production/items?category=Spares
      const res = await fetch("/api/production/config/spares");
      const json = await res.json();
      if (json.success) {
        setItemsList(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching spares:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpares();
  }, []);

  const filteredItems = useMemo(() => {
    if (!itemsList) return [];
    const s = searchTerm.toLowerCase();
    return itemsList.filter((item) => {
      return (
        item.itemCode?.toLowerCase().includes(s) ||
        item.itemName?.toLowerCase().includes(s) ||
        item.make?.toLowerCase().includes(s) ||
        item.addOnPartNumber?.toLowerCase().includes(s)
      );
    });
  }, [itemsList, searchTerm]);

  const handleAddNew = () => {
    setFormData({
      itemCode: "",
      itemName: "",
      category: "Spares_Config",
      trackingType: "Serialized",
      ratings: "",
      volt: "",
      amp: "",
      addOnPartNumber: "",
      technicalSpecs: {},
      make: "",
      averageUnitCost: "",
      minStockLevel: 0,
      maxStockLevel: 0,
      status: "Available",
    });
    setSpecsInput("");
    setIsEditing(false);
    setEditingId(null);
    setSaveError("");
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      category: "Spares_Config",
      trackingType: item.trackingType || "Serialized",
      ratings: item.ratings || "",
      volt: item.volt || "",
      amp: item.amp || "",
      addOnPartNumber: item.addOnPartNumber || "",
      technicalSpecs: item.technicalSpecs || {},
      make: item.make || "",
      averageUnitCost: item.averageUnitCost || "",
      minStockLevel: item.minStockLevel || 0,
      maxStockLevel: item.maxStockLevel || 0,
      status: item.status || "Available",
    });

    // Convert specs object to string for easy editing
    const specsStr = Object.entries(item.technicalSpecs || {})
      .map(([k, v]) => `${k}:${v}`)
      .join("; ");
    setSpecsInput(specsStr);

    setIsEditing(true);
    setEditingId(item._id);
    setSaveError("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this spare config?"))
      return;
    try {
      const res = await fetch(`/api/production/config/spares?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchSpares();
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting item.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      // Parse technical specs string
      const parsedSpecs = {};
      if (specsInput.trim()) {
        const pairs = specsInput.split(";");
        pairs.forEach((p) => {
          const [key, val] = p.split(":");
          if (key && val) {
            parsedSpecs[key.trim()] = val.trim();
          }
        });
      }

      const payload = {
        ...formData,
        technicalSpecs: parsedSpecs,
        // Auto-generate itemCode if not present (for configs)
        itemCode: formData.itemCode || `CFG-${Date.now().toString(36).toUpperCase()}`
      };

      let url = "/api/production/config/spares";
      let method = "POST";

      if (isEditing) {
        method = "PUT";
        payload._id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save spare configuration.");
      }

      fetchSpares();
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const CSV_HEADERS = [
    "itemCode",
    "itemName",
    "make",
    "ratings",
    "volt",
    "amp",
    "addOnPartNumber",
    "minStockLevel",
    "maxStockLevel",
    "technicalSpecs",
  ];

  const handleCsvFile = (e) => {
    setCsvError("");
    setCsvRows([]);
    setUploadResult(null);
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setCsvError("Please upload a valid .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        setCsvError("CSV must have a header row and at least one data row.");
        return;
      }
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const parsed = lines.slice(1).map((line, i) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });
        row._rowNum = i + 2;

        // Pre-validation logic
        const exists = itemsList.some(item => item.itemCode?.toLowerCase() === row.itemCode?.toLowerCase());
        row._isUpdate = exists;

        row._error = !row.itemCode
          ? "itemCode is required"
          : !row.itemName
            ? "itemName is required"
            : null;
        return row;
      });
      setCsvRows(parsed);
      setShowCsvModal(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCsvUpload = async () => {
    const validRows = csvRows
      .filter((r) => !r._error)
      .map((r) => {
        const { _rowNum, _error, _isUpdate, ...rest } = r;
        if (rest.itemCode) rest.itemCode = rest.itemCode.trim().toLowerCase();
        if (rest.itemName) rest.itemName = rest.itemName.trim().toLowerCase();
        if (rest.make) rest.make = rest.make.trim().toLowerCase();

        // Parse technicalSpecs string into object
        if (typeof rest.technicalSpecs === "string" && rest.technicalSpecs) {
          const specObj = {};
          const pairs = rest.technicalSpecs.split(";");
          pairs.forEach((p) => {
            const [key, val] = p.split(":");
            if (key && val) {
              specObj[key.trim().toLowerCase()] = val.trim().toLowerCase();
            }
          });
          rest.technicalSpecs = specObj;
        } else {
          rest.technicalSpecs = {};
        }

        // Parse numbers
        rest.minStockLevel = rest.minStockLevel ? Number(rest.minStockLevel) : 0;
        rest.maxStockLevel = rest.maxStockLevel ? Number(rest.maxStockLevel) : 0;

        return rest;
      });

    if (validRows.length === 0) {
      setCsvError("No valid rows to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/production/config/spares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRows),
      });
      const json = await res.json();
      setUploadResult(json.results);
      if (json.success) {
        fetchSpares();
      } else {
        setCsvError(json.results?.errors?.[0]?.error || json.error || "Upload failed.");
      }
    } catch (error) {
      console.error("CSV Upload Error:", error);
      setCsvError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const header = CSV_HEADERS.join(",");
    const example = [
      "SPR-101",
      "Control Card Assembly",
      "Techser",
      "5 KVA",
      "192 VDC",
      "20A",
      "20A",
      "TC-7805-MOD",
      "100",
      "1000",
      "PCB:FR4;Thickness:1.6mm",
    ].join(",");
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spares_config_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Spare Configuration
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Spares Config" />
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleCsvFile}
            />
            <button
              onClick={() => csvInputRef.current.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" /> Add Spare Config
            </button>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-sm">
        Define technical specifications for spares. These configurations will be used to build and track stock entries.
      </p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-medium transition-all"
              placeholder="Search spare name, part number, or specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border text-sm border-slate-100 rounded-2xl shadow-sm overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading spares catalog...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Settings2 className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                No spare kits found.
              </p>
              <p className="text-slate-400 mt-1 max-w-sm">
                {searchTerm
                  ? "Try adjusting your search filters."
                  : "Start by adding a new spare configuration."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                  {visibleColumns.itemName && (
                    <th className="py-4 px-6">Name</th>
                  )}
                  {visibleColumns.ratings && (
                    <th className="py-4 px-6">Ratings</th>
                  )}
                  {visibleColumns.voltAmp && (
                    <th className="py-4 px-6">Volt / Amp</th>
                  )}
                  {visibleColumns.makePrice && (
                    <th className="py-4 px-6 whitespace-nowrap">Make</th>
                  )}
                  {visibleColumns.actions && (
                    <th className="py-4 px-6 text-right w-24">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >

                    {visibleColumns.itemName && (
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {item.itemName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.addOnPartNumber && (
                            <span className="bg-slate-100 px-1.5 rounded">
                              {item.addOnPartNumber}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {visibleColumns.ratings && (
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">
                          {item.ratings || "-"}
                        </span>
                      </td>
                    )}

                    {visibleColumns.voltAmp && (
                      <td className="py-4 px-6">
                        <div className="text-xs font-medium text-slate-600">
                          {item.volt ? `${item.volt} V` : "-"} /{" "}
                          {item.amp ? `${item.amp} A` : "-"}
                        </div>
                      </td>
                    )}

                    {visibleColumns.makePrice && (
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                          {item.make || "-"}
                        </div>
                      </td>
                    )}


                    {visibleColumns.actions && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white border text-sm border-slate-200 rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-4xl my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 pb-2 border-b-2 border-indigo-600 inline-block">
                {isEditing ? "Edit Spare Config" : "New Spare Configuration"}
              </h3>
            </div>

            {saveError && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-medium border border-rose-100 flex items-start gap-3">
                <span className="shrink-0">⚠️</span> {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h4 className="font-bold text-slate-800">
                    Identity & Naming
                  </h4>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Name (Spare Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Control Card Assembly"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Add-On Part Number
                  </label>
                  <input
                    type="text"
                    placeholder="Supplementary internal ref"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.addOnPartNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addOnPartNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h4 className="font-bold text-slate-800">
                    Capacity & Ratings
                  </h4>
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Ratings (KVA)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 KVA"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.ratings}
                      onChange={(e) =>
                        setFormData({ ...formData, ratings: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Volt (VDC)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192 VDC"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.volt}
                      onChange={(e) =>
                        setFormData({ ...formData, volt: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Amp (A)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20A"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.amp}
                      onChange={(e) =>
                        setFormData({ ...formData, amp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Min Buffer
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, minStockLevel: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Max Buffer
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.maxStockLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, maxStockLevel: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Make / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Techser"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Specs Details (Key:Value)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. PCB:FR4; Thickness:1.6mm"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-mono bg-white"
                    value={specsInput}
                    onChange={(e) => setSpecsInput(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">
                    Format: Key:Value; separated by semicolons.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Update Configuration"
                    : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCsvModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  Preview Spare Config Import
                </h3>
                <p className="text-sm text-slate-500 mt-1">Review the data below before final synchronization.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvRows([]);
                    setCsvError("");
                    setUploadResult(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              {uploadResult && (
                <div className={`mb-4 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm border ${uploadResult.errors?.length ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${uploadResult.errors?.length ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                    <span>
                      Successfully processed: <b className="text-lg mx-1">{uploadResult.created + uploadResult.updated}</b> rows
                      <span className="mx-2 opacity-30">|</span>
                      New: <b>{uploadResult.created}</b>
                      <span className="mx-2 opacity-30">|</span>
                      Updated: <b>{uploadResult.updated}</b>
                      {uploadResult.errors?.length > 0 && (
                        <>
                          <span className="mx-2 opacity-30">|</span>
                          Failed: <b className="text-rose-600">{uploadResult.errors.length}</b>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {csvError && (
                <div className="mb-4 p-4 rounded-2xl text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 sr-0" />
                  {csvError}
                </div>
              )}

              <div className="flex-1 overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col">
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 z-20 shadow-sm">
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                        <th className="py-4 px-6 bg-slate-50">#</th>
                        <th className="py-4 px-6 bg-slate-50">Code</th>
                        <th className="py-4 px-6 bg-slate-50">Spare Name</th>
                        <th className="py-4 px-6 bg-slate-50">Make</th>
                        <th className="py-4 px-6 bg-slate-50">Volt / Amp</th>
                        <th className="py-4 px-6 bg-slate-50 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvRows.map((row) => (
                        <tr
                          key={row._rowNum}
                          className={`${row._error ? "bg-rose-50/30" : row._isUpdate ? "bg-amber-50/10" : "hover:bg-slate-50/50"} transition-colors`}
                        >
                          <td className="py-3 px-6 text-slate-400 font-mono italic">{row._rowNum}</td>
                          <td className="py-3 px-6 font-mono font-bold text-indigo-600">{row.itemCode}</td>
                          <td className="py-3 px-6 font-semibold text-slate-700">{row.itemName}</td>
                          <td className="py-3 px-6 font-bold text-slate-500 uppercase">{row.make}</td>
                          <td className="py-3 px-6 text-slate-600">{row.ratings || "-"}</td>
                          <td className="py-3 px-6">
                            <div className="flex justify-center">
                              {row._error ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase ring-1 ring-rose-200/50">
                                  <AlertCircle className="w-3 h-3" /> Error
                                </span>
                              ) : row._isUpdate ? (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black uppercase ring-1 ring-amber-200/50">
                                  <Edit className="w-3 h-3 text-amber-500" /> Update
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase ring-1 ring-emerald-200/50">
                                  <Check className="w-3 h-3 text-emerald-500" /> New
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Valid Entries</span>
                  <span className="text-lg font-black text-emerald-600 leading-tight">
                    {csvRows.filter(r => !r._error).length} <span className="text-xs font-normal text-slate-400">/ {csvRows.length}</span>
                  </span>
                </div>
                {csvRows.some(r => r._isUpdate) && (
                  <div className="flex flex-col border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Existing Updates</span>
                    <span className="text-lg font-black text-amber-500 leading-tight">
                      {csvRows.filter(r => !r._error && r._isUpdate).length}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvRows([]);
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Discard
                </button>
                {!uploadResult && (
                  <button
                    onClick={handleCsvUpload}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-60"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Import {csvRows.filter((r) => !r._error).length} Items
                  </button>
                )}
                {uploadResult && (
                  <button
                    onClick={() => setShowCsvModal(false)}
                    className="px-8 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpareParts;
