"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Settings2, Columns } from "lucide-react";
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

  const [formData, setFormData] = useState({
    itemCode: "", // Represents Hex Code (4-digit ID)
    itemName: "",
    category: "Spares",
    trackingType: "Serialized",
    ratings: "", // KVA
    volt: "", // DC Voltage
    amp: "", // Current Rating
    revision: "",
    addOnPartNumber: "",
    technicalSpecs: {}, // For "Specs Details"
    make: "",
    averageUnitCost: "", // Represents Price
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
      const res = await fetch("/api/production/items");
      const json = await res.json();
      if (json.success) {
        const sparesOnly = (json.data || []).filter(
          (item) => item.category === "Spares",
        );
        setItemsList(sparesOnly);
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
      category: "Spares",
      trackingType: "Serialized",
      ratings: "",
      volt: "",
      amp: "",
      revision: "",
      addOnPartNumber: "",
      technicalSpecs: {},
      make: "",
      averageUnitCost: "",
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
      category: "Spares",
      trackingType: item.trackingType || "Serialized",
      ratings: item.ratings || "",
      volt: item.volt || "",
      amp: item.amp || "",
      revision: item.revision || "",
      addOnPartNumber: item.addOnPartNumber || "",
      technicalSpecs: item.technicalSpecs || {},
      make: item.make || "",
      averageUnitCost: item.averageUnitCost || "",
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
      const res = await fetch(`/api/production/items?id=${id}`, {
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

      const payload = { ...formData, technicalSpecs: parsedSpecs };

      let url = "/api/production/items";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Service & Spare Kits
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Spares Config" />
        </div>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Add Spare Kit
          </button>
        )}
      </div>

      <p className="text-slate-500 text-sm">
        Configure high-value components and subsets meant for field repairs and
        service kits.
      </p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-medium transition-all"
              placeholder="Search config ID, name, or part number..."
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
                  {visibleColumns.hexCode && (
                    <th className="py-4 px-6 whitespace-nowrap">Config ID</th>
                  )}
                  {visibleColumns.itemName && (
                    <th className="py-4 px-6">Name & Revision</th>
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
                  {visibleColumns.status && (
                    <th className="py-4 px-6 text-center">Status</th>
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
                    {visibleColumns.hexCode && (
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          {item.itemCode}
                        </span>
                      </td>
                    )}

                    {visibleColumns.itemName && (
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {item.itemName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {item.revision && (
                            <span className="uppercase text-slate-400">
                              {item.revision}
                            </span>
                          )}
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

                    {visibleColumns.status && (
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            item.status === "Available"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.status === "Buffer"
                                ? "bg-amber-100 text-amber-700"
                                : item.status === "Consumed"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.status || "Available"}
                        </span>
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
                {isEditing ? "Edit Spare Config" : "New Spare Registration"}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Configuration ID (Unique)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SP-PCB-01"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-mono uppercase bg-white"
                      value={formData.itemCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          itemCode: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Revision
                    </label>
                    <input
                      type="text"
                      placeholder="v1.0"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.revision}
                      onChange={(e) =>
                        setFormData({ ...formData, revision: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Master Status
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-medium bg-white"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Buffer">Buffer (Pending Trial)</option>
                    <option value="Available">Available (Active)</option>
                    <option value="Consumed">Consumed (Discontinued)</option>
                    <option value="Scrapped">Scrapped</option>
                  </select>
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
    </div>
  );
}

export default SpareParts;
