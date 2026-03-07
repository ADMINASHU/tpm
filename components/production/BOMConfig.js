"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Search,
  Check,
  AlertCircle,
  Trash2,
  Edit,
  Download,
  Upload,
  GitBranch,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function BOMConfig({ pageName = "Production" }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [targetProduct, setTargetProduct] = useState("");
  const [targetType, setTargetType] = useState("Finished_Product");
  const [documentNo, setDocumentNo] = useState("");
  const [version, setVersion] = useState("1.0");
  const [materials, setMaterials] = useState([]);
  const fileInputRef = useRef(null);

  // New States for API and Search
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });
  const [itemsList, setItemsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [editingBomId, setEditingBomId] = useState(null);

  // System Config States
  const [systemCategories, setSystemCategories] = useState([]);
  const [systemMakes, setSystemMakes] = useState([]);

  // States for Saved BOMs Table
  const [savedBOMs, setSavedBOMs] = useState([]);
  const [isLoadingBOMs, setIsLoadingBOMs] = useState(false);
  const [expandedBOM, setExpandedBOM] = useState(null);

  // Modal States
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const [currentMaterial, setCurrentMaterial] = useState({
    itemId: "",
    itemName: "",
    itemCode: "",
    trackingStrategy: "Bulk",
    qty: 1,
    legend: "",
    make: "",
    category: "",
    searchQuery: "",
    showDropdown: false,
    showMakeDropdown: false,
  });

  // Fetch Items for Search & Saved BOMs
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      try {
        const res = await fetch("/api/production/items");
        const json = await res.json();
        if (json.success) {
          setItemsList(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    const fetchSystemConfig = async () => {
      try {
        const res = await fetch("/api/config/component");
        const json = await res.json();
        if (json.success && json.data) {
          setSystemCategories(json.data.categories || []);
          setSystemMakes(json.data.makes || []);
        }
      } catch (error) {
        console.error("Error fetching system config:", error);
      }
    };

    fetchItems();
    fetchSystemConfig();
    fetchSavedBOMs();
  }, []);

  const fetchSavedBOMs = async () => {
    setIsLoadingBOMs(true);
    try {
      const res = await fetch("/api/production/bom");
      const json = await res.json();
      if (json.success) {
        setSavedBOMs(json.data);
      }
    } catch (error) {
      console.error("Error fetching BOMs:", error);
    } finally {
      setIsLoadingBOMs(false);
    }
  };

  const handleOpenAddModal = (e) => {
    e?.preventDefault();
    setEditingMaterialIndex(null);
    setCurrentMaterial({
      itemId: "",
      itemName: "",
      itemCode: "",
      trackingStrategy: "Bulk",
      qty: 1,
      legend: "",
      make: "",
      category: "",
      searchQuery: "",
      showDropdown: false,
      showMakeDropdown: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e, index) => {
    e?.preventDefault();
    setEditingMaterialIndex(index);
    setCurrentMaterial({ ...materials[index] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveMaterialToBOM = () => {
    if (editingMaterialIndex !== null) {
      const updated = [...materials];
      updated[editingMaterialIndex] = { ...currentMaterial };
      setMaterials(updated);
    } else {
      setMaterials([...materials, { ...currentMaterial }]);
    }
    handleCloseModal();
  };

  const handleDownloadTemplate = () => {
    const headers = ["ItemCode", "Category", "Legend", "RequiredQty", "Make"];
    const csvContent =
      "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bom_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((row) => row.trim() !== "");
      if (rows.length <= 1) return; // Only headers or empty

      const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
      const itemCodeIdx = headers.indexOf("itemcode");
      const legendIdx = headers.indexOf("legend");
      const qtyIdx = headers.indexOf("requiredqty");
      const makeIdx = headers.indexOf("make");
      const catIdx = headers.indexOf("category");

      const newMaterials = [];

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (
          cols.length <
          Math.max(itemCodeIdx, legendIdx, qtyIdx, makeIdx, catIdx) + 1
        )
          continue;

        const code = itemCodeIdx >= 0 ? cols[itemCodeIdx] : "";
        const legend = legendIdx >= 0 ? cols[legendIdx] : "";
        const qty =
          qtyIdx >= 0 && !isNaN(cols[qtyIdx]) ? Number(cols[qtyIdx]) : 1;
        const compMake = makeIdx >= 0 ? cols[makeIdx] : "";
        const compCat = catIdx >= 0 ? cols[catIdx] : "";

        // Try to match item logic
        const matchedItem =
          itemsList.find((item) => item.itemCode === code) || null;

        newMaterials.push({
          itemId: matchedItem ? matchedItem._id : "",
          itemName: matchedItem ? matchedItem.itemName : "",
          itemCode: code,
          trackingStrategy: matchedItem
            ? matchedItem.trackingType || "Bulk"
            : "Bulk",
          qty: qty,
          legend: legend,
          make: compMake,
          category: compCat,
          searchQuery: matchedItem ? `${code} - ${matchedItem.itemName}` : code,
          showDropdown: false,
          showMakeDropdown: false,
        });
      }

      setMaterials((prev) => [...prev, ...newMaterials]);
      e.target.value = null; // Reset input
    };
    reader.readAsText(file);
  };

  const handleSaveBOM = async () => {
    setSaveMessage({ type: "", text: "" });

    // Validation
    if (
      !documentNo.trim() ||
      !String(version).trim() ||
      !targetProduct.trim()
    ) {
      setSaveMessage({
        type: "error",
        text: "Document No., Version, and Target Product are required.",
      });
      return;
    }
    if (materials.length === 0) {
      setSaveMessage({
        type: "error",
        text: "BOM must contain at least one component.",
      });
      return;
    }

    const invalidMaterials = materials.filter((m) => !m.itemId || m.qty <= 0);
    if (invalidMaterials.length > 0) {
      setSaveMessage({
        type: "error",
        text: "Please select valid components and ensure quantities are greater than 0.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        bomNumber: documentNo.trim(),
        version: String(version).trim(),
        targetProduct: targetProduct.trim(),
        targetType: targetType,
        components: materials.map((m) => ({
          itemId: m.itemId,
          itemName: m.itemName,
          requiredQuantity: Number(m.qty),
          trackingStrategy: m.trackingStrategy,
          legend: m.legend.trim() || undefined,
          make: m.make.trim() || undefined,
          category: m.category.trim() || undefined,
        })),
      };

      let res;
      if (editingBomId) {
        payload._id = editingBomId;
        res = await fetch("/api/production/bom", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/production/bom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (json.success) {
        setSaveMessage({
          type: "success",
          text: editingBomId
            ? "BOM updated successfully!"
            : "BOM saved successfully!",
        });
        fetchSavedBOMs(); // Refresh the table
        setTimeout(() => {
          setIsInitialized(false);
          setMaterials([]);
          setTargetProduct("");
          setDocumentNo("");
          setVersion("1.0");
          setEditingBomId(null);
          setSaveMessage({ type: "", text: "" });
        }, 2000);
      } else {
        setSaveMessage({
          type: "error",
          text: json.error || "Failed to save BOM.",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditBOM = (bom) => {
    setEditingBomId(bom._id);
    setDocumentNo(bom.bomNumber);
    setVersion(bom.version);
    setTargetProduct(bom.targetProduct);
    setTargetType(bom.targetType);

    // Convert DB components mapping back to form state
    const mappedMaterials = bom.components.map((comp) => ({
      itemId: comp.itemId?._id || comp.itemId,
      itemName: comp.itemId?.itemName || comp.itemName,
      itemCode: comp.itemId?.itemCode || "",
      trackingStrategy: comp.trackingStrategy,
      qty: comp.requiredQuantity,
      legend: comp.legend || "",
      make: comp.make || "",
      category: comp.category || "",
      searchQuery: `${comp.itemId?.itemCode || ""} - ${comp.itemId?.itemName || comp.itemName}`,
      showDropdown: false,
      showMakeDropdown: false,
    }));

    setMaterials(mappedMaterials);
    setIsInitialized(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBOM = async (id, bomNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete recipe ${bomNumber}?`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/production/bom?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        fetchSavedBOMs(); // Refresh list automatically
      } else {
        alert(json.error || "Failed to delete BOM");
      }
    } catch (error) {
      console.error("Delete error", error);
      alert("An error occurred during deletion.");
    }
  };

  // Modal Form Input Handlers
  const handleModalChange = (field, value) => {
    const updated = { ...currentMaterial };
    updated[field] = value;

    if (field === "searchQuery") {
      updated.showDropdown = true;
      // Clear selection if searching again
      if (updated.itemId) {
      }
    }
    setCurrentMaterial(updated);
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setTargetProduct("");
    setDocumentNo("");
    setVersion("1.0");
  };

  const handleModalSelectItem = (item) => {
    const updated = { ...currentMaterial };
    updated.itemId = item._id;
    updated.itemName = item.itemName;
    updated.itemCode = item.itemCode;
    updated.trackingStrategy = item.trackingType || "Bulk";
    updated.searchQuery = `${item.itemCode} - ${item.itemName}`;
    updated.showDropdown = false;
    setCurrentMaterial(updated);
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Database className="mr-2 text-indigo-600 h-6 w-6" />
                Master BOM Configuration
              </h2>
              <Breadcrumb pageName={pageName} subPageName="BOM Configuration" />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Define ratio mappings for Spare Parts (PCBs) and Finished
              Products.
            </p>
          </div>
          {!isInitialized && (
            <button
              onClick={() => setIsRecipeModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              Create New BOM
            </button>
          )}
        </div>

        {isInitialized && (
          <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center border-b border-indigo-50 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  BOM: <span className="text-indigo-600">{targetProduct}</span>
                </h3>
                <p className="text-sm text-slate-500">
                  Add required components and quantities for one unit.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleImportCSV}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
                  title="Import BOM from CSV"
                >
                  <Upload className="w-4 h-4" /> Import CSV
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
                  title="Download CSV Template"
                >
                  <Download className="w-4 h-4" /> Template
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {materials.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-indigo-50/50 rounded-xl border border-dashed border-indigo-100 mb-6">
                <Database className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-sm text-indigo-900 font-semibold mb-1">
                  BOM is empty
                </p>
                <p className="text-xs text-indigo-700/70 max-w-xs">
                  Click &quot;Add Item&quot; to start appending components and
                  raw materials to this recipe.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[25%]"
                        >
                          Item Code
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]"
                        >
                          Legend
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[20%]"
                        >
                          Approved Make
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[10%]"
                        >
                          Qty
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-[15%]"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {materials.map((m, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                            {m.category || (
                              <span className="text-slate-400 italic">
                                None
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-semibold text-slate-900 border-b border-dashed border-slate-200 w-max pb-0.5">
                              {m.itemCode || (
                                <span className="text-slate-400 font-normal italic">
                                  Pending...
                                </span>
                              )}
                            </div>
                            <div
                              className="text-xs text-slate-500 truncate max-w-[200px] mt-1"
                              title={m.itemName}
                            >
                              {m.itemName}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-bold uppercase">
                            {m.legend || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {m.make ? (
                                m.make.split(" / ").map((mk, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-xs break-all"
                                  >
                                    {mk}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600 bg-indigo-50 text-center">
                            {m.qty}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => handleOpenEditModal(e, i)}
                              className="text-indigo-600 hover:text-indigo-900 mx-2 p-1.5 border border-transparent rounded hover:bg-indigo-50 transition-colors"
                              title="Edit Component"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setMaterials(
                                  materials.filter((_, idx) => idx !== i),
                                )
                              }
                              className="text-red-500 hover:text-red-700 p-1.5 border border-transparent rounded hover:bg-red-50 transition-colors"
                              title="Remove from BOM"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {saveMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  saveMessage.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {saveMessage.type === "error" && (
                  <AlertCircle className="w-4 h-4" />
                )}
                {saveMessage.type === "success" && (
                  <Check className="w-4 h-4" />
                )}
                {saveMessage.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsInitialized(false);
                  setMaterials([]);
                  setTargetProduct("");
                  setDocumentNo("");
                  setVersion("1.0");
                  setEditingBomId(null);
                  setSaveMessage({ type: "", text: "" });
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Discard Draft
              </button>
              <button
                onClick={handleSaveBOM}
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingBomId
                    ? "Update BOM"
                    : "Save Parent BOM"}
              </button>
            </div>
          </div>
        )}

        {/* Saved BOMs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-8">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Configured BOMs
            </h3>
            <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
              {savedBOMs.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Document No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Target Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Version
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoadingBOMs ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Loading BOMs...
                    </td>
                  </tr>
                ) : savedBOMs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No BOMs configured yet. Create one above.
                    </td>
                  </tr>
                ) : (
                  savedBOMs.map((bom) => (
                    <React.Fragment key={bom._id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                          {bom.bomNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                          {bom.targetProduct}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {bom.targetType.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {bom.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bom.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {bom.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() =>
                                setExpandedBOM(
                                  expandedBOM === bom._id ? null : bom._id,
                                )
                              }
                              className="text-indigo-600 hover:text-indigo-900 font-semibold bg-indigo-50 px-3 py-1 rounded-md transition-colors"
                            >
                              {expandedBOM === bom._id ? "Hide" : "View"}
                            </button>
                            <button
                              onClick={() => handleEditBOM(bom)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit Recipe"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteBOM(bom._id, bom.bomNumber)
                              }
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Recipe"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Components Row */}
                      {expandedBOM === bom._id && (
                        <tr className="bg-slate-50 border-b border-indigo-100">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                              <div className="bg-indigo-50/50 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                                  Recipe Contents
                                </h4>
                              </div>
                              <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500"
                                    >
                                      Category
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500"
                                    >
                                      Item Code
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500"
                                    >
                                      Description
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500"
                                    >
                                      Legend
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-left text-xs font-semibold text-slate-500"
                                    >
                                      Approved Make
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-2 text-right text-xs font-semibold text-slate-500"
                                    >
                                      Required Qty
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {bom.components.map((comp, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-slate-500">
                                        {comp.category || "-"}
                                      </td>
                                      <td className="px-4 py-1.5 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {comp.itemId?.itemCode || "Unknown"}
                                      </td>
                                      <td className="px-4 py-1.5 text-sm text-slate-500">
                                        {comp.itemId?.description ||
                                          comp.itemName}
                                      </td>
                                      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-slate-500">
                                        {comp.legend || "-"}
                                      </td>
                                      <td
                                        className="px-4 py-1.5 whitespace-nowrap text-sm text-slate-500 max-w-[150px] truncate"
                                        title={comp.make}
                                      >
                                        {comp.make || "-"}
                                      </td>
                                      <td className="px-4 py-1.5 whitespace-nowrap text-sm font-semibold text-indigo-600 text-right">
                                        {comp.requiredQuantity}{" "}
                                        {comp.itemId?.baseUom || "Nos"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recipe Creation Modal */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={handleCloseRecipeModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl px-6 pt-5 pb-6 text-left overflow-visible shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-xl leading-6 font-bold text-slate-900 border-b border-slate-100 pb-4 flex justify-between items-center">
                    Create New BOM Recipe
                    <button
                      onClick={handleCloseRecipeModal}
                      className="text-slate-400 hover:text-slate-500 transition-colors outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </h3>

                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Document No.
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={documentNo}
                          onChange={(e) => setDocumentNo(e.target.value)}
                          placeholder="e.g. TSBR/ONL..."
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Version<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={version}
                          onChange={(e) => setVersion(e.target.value)}
                          placeholder="e.g. 1.02"
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Target Product Name
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={targetProduct}
                          onChange={(e) => setTargetProduct(e.target.value)}
                          placeholder="Target Product Name"
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Target Type
                        </label>
                        <select
                          value={targetType}
                          onChange={(e) => setTargetType(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                        >
                          <option>Finished_Product</option>
                          <option>Spare_Part</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-8 sm:flex sm:flex-row-reverse border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (targetProduct && documentNo && version) {
                      setIsInitialized(true);
                      setIsRecipeModalOpen(false);
                    }
                  }}
                  disabled={!targetProduct || !documentNo || !version}
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 text-base font-semibold text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                    !targetProduct || !documentNo || !version
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  Create Recipe
                </button>
                <button
                  type="button"
                  onClick={handleCloseRecipeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-5 py-2.5 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl px-6 pt-5 pb-6 text-left overflow-visible shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-xl leading-6 font-bold text-slate-900 border-b border-slate-100 pb-4 flex justify-between items-center">
                    {editingMaterialIndex !== null
                      ? "Edit Component"
                      : "Add New Component"}
                    <button
                      onClick={handleCloseModal}
                      className="text-slate-400 hover:text-slate-500 transition-colors outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </h3>

                  <div className="mt-6 space-y-5">
                    {/* Category Input */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Category<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={currentMaterial.category}
                        onChange={(e) =>
                          handleModalChange("category", e.target.value)
                        }
                        className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                      >
                        <option value="">Select Category</option>
                        {systemCategories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Component Search */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Component / Raw Material
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by item code or name..."
                          value={currentMaterial.searchQuery}
                          onChange={(e) =>
                            handleModalChange("searchQuery", e.target.value)
                          }
                          onFocus={() =>
                            handleModalChange("showDropdown", true)
                          }
                          className={`block w-full rounded-xl border py-3 pl-10 pr-4 text-sm shadow-sm transition-colors outline-none ${currentMaterial.itemId ? "bg-emerald-50 border-emerald-200 text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" : "bg-white border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"}`}
                          autoComplete="off"
                        />
                        {currentMaterial.itemId && (
                          <Check className="absolute right-3 top-3 h-5 w-5 text-emerald-600" />
                        )}
                      </div>

                      {/* Search Dropdown */}
                      {currentMaterial.showDropdown && (
                        <div
                          className="absolute z-50 mt-1 w-[80%] max-w-lg bg-white shadow-2xl rounded-xl py-2 text-sm ring-1 ring-black ring-opacity-5 max-h-64 overflow-y-auto"
                          onMouseLeave={() =>
                            handleModalChange("showDropdown", false)
                          }
                        >
                          {isLoadingItems ? (
                            <div className="px-4 py-3 text-slate-500 italic">
                              Validating items sequence...
                            </div>
                          ) : (
                            (itemsList || [])
                              .filter((item) => {
                                const searchMatch =
                                  item.itemName
                                    .toLowerCase()
                                    .includes(
                                      currentMaterial.searchQuery.toLowerCase(),
                                    ) ||
                                  item.itemCode
                                    .toLowerCase()
                                    .includes(
                                      currentMaterial.searchQuery.toLowerCase(),
                                    );
                                const categoryMatch = currentMaterial.category
                                  ? (item.category || "")
                                      .toLowerCase()
                                      .includes(
                                        currentMaterial.category.toLowerCase(),
                                      )
                                  : true;
                                return searchMatch && categoryMatch;
                              })
                              .slice(0, 15)
                              .map((item) => (
                                <div
                                  key={item._id}
                                  onClick={() => handleModalSelectItem(item)}
                                  className="cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {item.itemCode}
                                    </span>
                                    <span className="text-slate-500 text-xs mt-0.5 truncate max-w-[400px]">
                                      {item.itemName}
                                    </span>
                                  </div>
                                </div>
                              ))
                          )}
                          {(itemsList || []).filter((item) => {
                            const searchMatch =
                              item.itemName
                                .toLowerCase()
                                .includes(
                                  currentMaterial.searchQuery.toLowerCase(),
                                ) ||
                              item.itemCode
                                .toLowerCase()
                                .includes(
                                  currentMaterial.searchQuery.toLowerCase(),
                                );
                            const categoryMatch = currentMaterial.category
                              ? (item.category || "")
                                  .toLowerCase()
                                  .includes(
                                    currentMaterial.category.toLowerCase(),
                                  )
                              : true;
                            return searchMatch && categoryMatch;
                          }).length === 0 &&
                            !isLoadingItems && (
                              <div className="px-4 py-3 text-rose-500 font-medium bg-rose-50 text-center">
                                No matching components found.
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Legend and Quantity Grid */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Legend (Ref)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. C1.C2"
                          value={currentMaterial.legend}
                          onChange={(e) =>
                            handleModalChange("legend", e.target.value)
                          }
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={currentMaterial.qty}
                          onChange={(e) =>
                            handleModalChange("qty", e.target.value)
                          }
                          className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none font-bold text-slate-900"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Approved Make */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Approved Make
                      </label>
                      <div
                        className={`w-full rounded-xl border py-3 px-4 text-sm shadow-sm transition-colors cursor-pointer min-h-[46px] flex flex-wrap gap-1.5 items-center outline-none ${currentMaterial.showMakeDropdown ? "bg-white border-indigo-500 ring-2 ring-indigo-500" : "bg-white border-slate-200 hover:border-slate-300"}`}
                        onClick={() =>
                          handleModalChange(
                            "showMakeDropdown",
                            !currentMaterial.showMakeDropdown,
                          )
                        }
                      >
                        {currentMaterial.make ? (
                          currentMaterial.make.split(" / ").map((mk, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold break-all border border-indigo-200 shadow-sm"
                            >
                              {mk}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">
                            Apply Make Overrides (Optional)
                          </span>
                        )}
                      </div>

                      {currentMaterial.showMakeDropdown && (
                        <div
                          className="absolute z-10 w-full mt-2 bg-white shadow-2xl max-h-64 rounded-xl py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
                          onMouseLeave={() =>
                            handleModalChange("showMakeDropdown", false)
                          }
                        >
                          <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] flex justify-between items-center z-10">
                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                              Select Approved Makes
                            </span>
                            <button
                              type="button"
                              className="text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModalChange("showMakeDropdown", false);
                              }}
                            >
                              Done
                            </button>
                          </div>
                          {systemMakes.map((makeOpt, idx) => {
                            const isSelected = (currentMaterial.make || "")
                              .split(" / ")
                              .includes(makeOpt);
                            return (
                              <div
                                key={idx}
                                className="flex items-center px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let currentMakes = currentMaterial.make
                                    ? currentMaterial.make.split(" / ")
                                    : [];
                                  if (isSelected) {
                                    currentMakes = currentMakes.filter(
                                      (x) => x !== makeOpt,
                                    );
                                  } else {
                                    currentMakes.push(makeOpt);
                                  }
                                  handleModalChange(
                                    "make",
                                    currentMakes.join(" / "),
                                  );
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="mr-3.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                />
                                <span
                                  className={`text-sm ${isSelected ? "text-indigo-900 font-semibold" : "text-slate-700"}`}
                                >
                                  {makeOpt}
                                </span>
                              </div>
                            );
                          })}
                          {systemMakes.length === 0 && (
                            <div className="px-4 py-3 text-slate-500 text-sm italic text-center">
                              No makes found in system config.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 sm:mt-8 sm:flex sm:flex-row-reverse border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleSaveMaterialToBOM}
                  disabled={
                    !currentMaterial.itemId || !currentMaterial.category
                  }
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 text-base font-semibold text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${!currentMaterial.itemId || !currentMaterial.category ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`}
                >
                  {editingMaterialIndex !== null
                    ? "Update Component"
                    : "Add to BOM"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-5 py-2.5 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default BOMConfig;
