"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";

function ComponentConfig({ pageName = "Production" }) {
  const [showForm, setShowForm] = useState(false);
  const [techSpecs, setTechSpecs] = useState([{ name: "Value", value: "" }]);

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const csvInputRef = useRef(null);

  // Form Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Items List State
  const [itemsList, setItemsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  // Table View Enhancements State
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    itemCode: true,
    itemName: true,
    description: true,
    make: true,
    category: true,
    trackingType: true,
    baseUom: true,
    hsnCode: false,
    mountingTechnology: false,
    bufferLevels: true,
    techSpecs: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [mergeDescMake, setMergeDescMake] = useState(true);

  // Initialize from Local Storage on Mount (Client-Side Only)
  useEffect(() => {
    const savedColumns = localStorage.getItem("componentConfig_visibleColumns");
    if (savedColumns) {
      try {
        setVisibleColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.error("Failed to parse saved columns", e);
      }
    }

    const savedMerge = localStorage.getItem("componentConfig_mergeDescMake");
    if (savedMerge !== null) {
      setMergeDescMake(savedMerge === "true");
    }
  }, []);

  // Save to Local Storage on Change
  useEffect(() => {
    localStorage.setItem(
      "componentConfig_visibleColumns",
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem(
      "componentConfig_mergeDescMake",
      String(mergeDescMake),
    );
  }, [mergeDescMake]);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch("/api/production/config/components");
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

  useEffect(() => {
    fetchItems();
  }, []);

  // Dynamic Lists State
  const [categories, setCategories] = useState([
    "IC",
    "PCB",
    "Passive",
    "Enclosure",
    "Hardware",
  ]);
  const [uoms, setUoms] = useState(["Nos", "Kg", "Meters", "Sets"]);
  const [makes, setMakes] = useState([
    "Yageo",
    "Murata",
    "TDK",
    "Vishay",
    "TE Connectivity",
  ]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Input State for New/Edit
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);

  const [newUom, setNewUom] = useState("");
  const [editingUomIndex, setEditingUomIndex] = useState(null);

  const [newMake, setNewMake] = useState("");
  const [editingMakeIndex, setEditingMakeIndex] = useState(null);

  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    category: "",
    make: "",
    description: "",
    baseUom: "",
    hsnCode: "",
    trackingType: "Bulk",
    mountingTechnology: "THT",
    minBufferLevel: "",
    maxBufferLevel: "",
  });

  // Fetch Config on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config/component");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCategories(json.data.categories || []);
            setUoms(json.data.baseUoms || []);
            setMakes(json.data.makes || makes);

            // Set defaults if form is empty
            setFormData((prev) => ({
              ...prev,
              category: prev.category || json.data.categories?.[0] || "",
              baseUom: prev.baseUom || json.data.baseUoms?.[0] || "",
              make: prev.make || json.data.makes?.[0] || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load component config:", error);
      } finally {
        setIsLoadingConfig(false);
      }
    }
    fetchConfig();
  }, []);

  // Sync to DB when lists change
  const syncConfigToDB = async (newCategories, newUoms, newMakes) => {
    try {
      await fetch("/api/config/component", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: newCategories,
          baseUoms: newUoms,
          makes: newMakes,
        }),
      });
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  };

  // Auto-generate description based on tech specs and make
  useEffect(() => {
    const specString = techSpecs
      .filter((s) => s.name && s.value)
      .map((s) => `${s.name}: ${s.value}`)
      .join(", ");

    const autoDesc = [formData.category, formData.make, specString]
      .filter(Boolean)
      .join(" - ");

    // Only auto-generate description if one doesn't exist or we're in "New Component" mode
    if (autoDesc && (!isEditing || !formData.description)) {
      setFormData((prev) => ({ ...prev, description: autoDesc }));
    }
  }, [techSpecs, formData.make]);

  // --- Category Handlers ---
  const handleSaveCategory = () => {
    if (!newCategory.trim()) return;

    let updatedCategories = [...categories];

    if (editingCategoryIndex !== null) {
      const oldVal = updatedCategories[editingCategoryIndex];
      updatedCategories[editingCategoryIndex] = newCategory;
      setCategories(updatedCategories);
      setEditingCategoryIndex(null);
      if (formData.category === oldVal) {
        setFormData({ ...formData, category: newCategory });
      }
    } else if (!categories.includes(newCategory)) {
      updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setFormData({ ...formData, category: newCategory });
    }

    setNewCategory("");
    syncConfigToDB(updatedCategories, uoms, makes);
  };

  const startEditCategory = () => {
    const idx = categories.indexOf(formData.category);
    if (idx !== -1) {
      setEditingCategoryIndex(idx);
      setNewCategory(formData.category);
    }
  };

  // --- UOM Handlers ---
  const handleSaveUom = () => {
    if (!newUom.trim()) return;

    let updatedUoms = [...uoms];

    if (editingUomIndex !== null) {
      const oldVal = updatedUoms[editingUomIndex];
      updatedUoms[editingUomIndex] = newUom;
      setUoms(updatedUoms);
      setEditingUomIndex(null);
      if (formData.baseUom === oldVal) {
        setFormData({ ...formData, baseUom: newUom });
      }
    } else if (!uoms.includes(newUom)) {
      updatedUoms = [...uoms, newUom];
      setUoms(updatedUoms);
      setFormData({ ...formData, baseUom: newUom });
    }

    setNewUom("");
    syncConfigToDB(categories, updatedUoms, makes);
  };

  const startEditUom = () => {
    const idx = uoms.indexOf(formData.baseUom);
    if (idx !== -1) {
      setEditingUomIndex(idx);
      setNewUom(formData.baseUom);
    }
  };

  // --- Make Handlers ---
  const handleSaveMake = () => {
    if (!newMake.trim()) return;
    let updatedMakes = [...makes];
    if (editingMakeIndex !== null) {
      const oldVal = updatedMakes[editingMakeIndex];
      updatedMakes[editingMakeIndex] = newMake;
      setMakes(updatedMakes);
      setEditingMakeIndex(null);
      if (formData.make === oldVal) setFormData({ ...formData, make: newMake });
    } else if (!makes.includes(newMake)) {
      updatedMakes = [...makes, newMake];
      setMakes(updatedMakes);
      setFormData({ ...formData, make: newMake });
    }
    setNewMake("");
    syncConfigToDB(categories, uoms, updatedMakes);
  };

  const startEditMake = () => {
    const idx = makes.indexOf(formData.make);
    if (idx !== -1) {
      setEditingMakeIndex(idx);
      setNewMake(formData.make);
    }
  };

  // --- Save Single Component Handler ---
  const handleSaveComponent = async () => {
    setSaveError("");
    if (!formData.itemCode.trim()) {
      setSaveError("Item Code is required.");
      return;
    }
    if (!formData.itemName.trim()) {
      setSaveError("Item Name is required.");
      return;
    }
    if (!formData.category) {
      setSaveError("Category is required.");
      return;
    }
    const techSpecsObj = {};
    techSpecs.forEach(({ name, value }) => {
      if (name.trim()) {
        techSpecsObj[name.trim().toLowerCase()] = value.trim().toLowerCase();
      }
    });
    const payload = {
      ...formData,
      itemCode: formData.itemCode.trim().toLowerCase(),
      itemName: formData.itemName.trim().toLowerCase(),
      category: formData.category.trim().toLowerCase(),
      make: formData.make.trim().toLowerCase(),
      description: formData.description.trim().toLowerCase(),
      baseUom: formData.baseUom.trim().toLowerCase(),
      trackingType: formData.trackingType.trim(),
      technicalSpecs: techSpecsObj,
      minStockLevel: formData.minBufferLevel
        ? Number(formData.minBufferLevel)
        : 0,
      maxStockLevel: formData.maxBufferLevel
        ? Number(formData.maxBufferLevel)
        : 0,
    };
    if (isEditing && editingId) {
      payload._id = editingId;
    }

    setIsSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/production/config/components?id=${editingId}` : "/api/production/config/components", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setIsEditing(false);
        setEditingId(null);
        setSaveError("");
        setFormData({
          itemCode: "",
          itemName: "",
          category: categories[0] || "",
          make: makes[0] || "",
          description: "",
          baseUom: uoms[0] || "",
          hsnCode: "",
          trackingType: "Bulk",
          mountingTechnology: "THT",
          minBufferLevel: "",
          maxBufferLevel: "",
        });
        setTechSpecs([{ name: "Value", value: "" }]);
        fetchItems();
      } else {
        setSaveError(
          json.results?.errors?.[0]?.error ||
          json.error ||
          "Save failed. Please try again.",
        );
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    // Normalize values to match case-sensitive options in the UI (since DB stores lowercase)
    const normalizedCategory =
      categories.find(
        (c) => c.toLowerCase() === item.category?.toLowerCase(),
      ) ||
      item.category ||
      "";
    const normalizedMake =
      makes.find((m) => m.toLowerCase() === item.make?.toLowerCase()) ||
      item.make ||
      "";
    const normalizedUom =
      uoms.find((u) => u.toLowerCase() === item.baseUom?.toLowerCase()) ||
      item.baseUom ||
      "";

    setFormData({
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
      category: normalizedCategory,
      make: normalizedMake,
      description: item.description || "",
      baseUom: normalizedUom,
      hsnCode: item.hsnCode || "",
      trackingType: item.trackingType || "Bulk",
      mountingTechnology: item.mountingTechnology || "THT",
      minBufferLevel: item.minStockLevel?.toString() || "",
      maxBufferLevel: item.maxStockLevel?.toString() || "",
    });

    if (item.technicalSpecs) {
      const specs = Object.entries(item.technicalSpecs).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );
      setTechSpecs(specs.length > 0 ? specs : [{ name: "Value", value: "" }]);
    } else {
      setTechSpecs([{ name: "Value", value: "" }]);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this component?")) return;
    try {
      const res = await fetch(`/api/production/config/components?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchItems();
      } else {
        alert(json.error || "Delete failed");
      }
    } catch {
      alert("Network error");
    }
  };

  // --- CSV Import Handlers ---
  const CSV_HEADERS = [
    "itemCode",
    "itemName",
    "category",
    "trackingType",
    "mountingTechnology",
    "hsnCode",
    "make",
    "baseUom",
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
        const { _rowNum, _error, ...rest } = r;
        // Normalizing all text fields to lowercase for storage
        if (rest.itemCode) rest.itemCode = rest.itemCode.trim().toLowerCase();
        if (rest.itemName) rest.itemName = rest.itemName.trim().toLowerCase();
        if (rest.category) rest.category = rest.category.trim().toLowerCase();
        if (rest.make) rest.make = rest.make.trim().toLowerCase();
        if (rest.description)
          rest.description = rest.description.trim().toLowerCase();
        if (rest.baseUom) rest.baseUom = rest.baseUom.trim().toLowerCase();

        // Handle Tracking Type Normalization
        if (rest.trackingType) {
          const tt = rest.trackingType.trim();
          if (tt.toLowerCase() === "serialized") {
            rest.trackingType = "Serialized";
          } else {
            rest.trackingType = "Bulk";
          }
        } else {
          rest.trackingType = "Bulk";
        }

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

        return rest;
      });
    if (validRows.length === 0) {
      setCsvError("No valid rows to upload.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch("/api/production/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRows),
      });
      const json = await res.json();
      setUploadResult(json.results);
      if (json.success) {
        fetchItems();
      } else {
        setCsvError(
          json.results?.errors?.[0]?.error ||
          json.error ||
          "Upload failed. Please try again.",
        );
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
      "COMP-001",
      "10k Resistor",
      "Passive",
      "Bulk",
      "THT",
      "8533",
      "Yageo",
      "Nos",
      "1000",
      "5000",
      "Value:10K 1/4W;Resistance:10K Ohm;Power Rating:1/4W;Tolerance:5%",
    ].join(",");
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "components_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = useMemo(() => {
    if (!itemsList) return [];
    const s = searchTerm.toLowerCase();
    return itemsList.filter((item) => {
      return (
        item.itemCode?.toLowerCase().includes(s) ||
        item.itemName?.toLowerCase().includes(s) ||
        item.category?.toLowerCase().includes(s) ||
        item.description?.toLowerCase().includes(s) ||
        item.make?.toLowerCase().includes(s) ||
        item.hsnCode?.toLowerCase().includes(s) ||
        item.mountingTechnology?.toLowerCase().includes(s)
      );
    });
  }, [itemsList, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Hidden CSV File Input */}
      <input
        type="file"
        accept=".csv"
        className="hidden"
        id="csv-upload-input"
        onChange={handleCsvFile}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Raw Materials & Components Master
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Component Config" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            title="Download the required CSV format before uploading"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSV Template
          </button>
          <button
            onClick={() => document.getElementById("csv-upload-input").click()}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import CSV
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setFormData({
                itemCode: "",
                itemName: "",
                category: categories[0] || "",
                make: makes[0] || "",
                description: "",
                baseUom: uoms[0] || "",
                hsnCode: "",
                trackingType: "Bulk",
                mountingTechnology: "THT",
                minBufferLevel: "",
                maxBufferLevel: "",
              });
              setTechSpecs([{ name: "Value", value: "" }]);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
          >
            + Add Component
          </button>
        </div>
      </div>
      <p className="text-slate-500 text-sm">
        Register master data for components including Category, HSN, UOM,
        Tracking Strategy, and Technical Specs.
      </p>

      {showForm && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-6xl shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing
                  ? "Edit Component Profile"
                  : "New Component Definition"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 border-r border-slate-200 pr-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item Code
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm uppercase font-mono bg-white"
                      placeholder="COMP-001"
                      value={formData.itemCode}
                      onChange={(e) =>
                        setFormData({ ...formData, itemCode: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Make (Brand)
                    </label>
                    <select
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.make}
                      onChange={(e) => {
                        setFormData({ ...formData, make: e.target.value });
                        setEditingMakeIndex(null);
                        setNewMake("");
                      }}
                    >
                      {makes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white shadow-sm uppercase"
                    placeholder={
                      editingMakeIndex !== null
                        ? "Edit make name..."
                        : "Add new make..."
                    }
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                  />
                  <button
                    onClick={handleSaveMake}
                    type="button"
                    className={`${editingMakeIndex !== null ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-200 text-slate-700 hover:bg-slate-300"} px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors`}
                  >
                    {editingMakeIndex !== null ? "Save" : "Add"}
                  </button>
                  {editingMakeIndex !== null ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMakeIndex(null);
                        setNewMake("");
                      }}
                      className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditMake}
                      className="bg-slate-50 border border-slate-200 text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white uppercase"
                    placeholder="e.g. 10k Ohm Resistor 1/4W"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white uppercase"
                    placeholder="Auto-generated if specs are added..."
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                  </div>
                  <select
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      setEditingCategoryIndex(null);
                      setNewCategory("");
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white shadow-sm uppercase"
                    placeholder={
                      editingCategoryIndex !== null
                        ? "Edit category text..."
                        : "Add new category..."
                    }
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    onClick={handleSaveCategory}
                    type="button"
                    className={`${editingCategoryIndex !== null ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-200 text-slate-700 hover:bg-slate-300"} px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors`}
                  >
                    {editingCategoryIndex !== null ? "Save" : "Add"}
                  </button>
                  {editingCategoryIndex !== null ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryIndex(null);
                        setNewCategory("");
                      }}
                      className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditCategory}
                      className="bg-slate-50 border border-slate-200 text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="col-span-1 border-r border-slate-200 pr-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Base UOM
                      </label>
                    </div>
                    <select
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.baseUom}
                      onChange={(e) => {
                        setFormData({ ...formData, baseUom: e.target.value });
                        setEditingUomIndex(null);
                        setNewUom("");
                      }}
                    >
                      {uoms.map((uom) => (
                        <option key={uom} value={uom}>
                          {uom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      placeholder="8542"
                      value={formData.hsnCode}
                      onChange={(e) =>
                        setFormData({ ...formData, hsnCode: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-200 py-1.5 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white shadow-sm uppercase"
                    placeholder={
                      editingUomIndex !== null
                        ? "Edit UOM text..."
                        : "Add new UOM..."
                    }
                    value={newUom}
                    onChange={(e) => setNewUom(e.target.value)}
                  />
                  <button
                    onClick={handleSaveUom}
                    type="button"
                    className={`${editingUomIndex !== null ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-200 text-slate-700 hover:bg-slate-300"} px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors`}
                  >
                    {editingUomIndex !== null ? "Save" : "Add"}
                  </button>
                  {editingUomIndex !== null ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUomIndex(null);
                        setNewUom("");
                      }}
                      className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditUom}
                      className="bg-slate-50 border border-slate-200 text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tracking Strategy
                  </label>
                  <select
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.trackingType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trackingType: e.target.value,
                      })
                    }
                  >
                    <option value="Bulk">Bulk (Quantity Only)</option>
                    <option value="Serialized">
                      Serialized (Individual Hex Tags)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mounting Technology
                  </label>
                  <select
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.mountingTechnology}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mountingTechnology: e.target.value,
                      })
                    }
                  >
                    <option value="">â€” Select â€”</option>
                    <option value="SMD">SMD (Surface-Mount Device)</option>
                    <option value="THT">THT (Through-Hole Technology)</option>
                    <option value="COB">COB (Chip-On-Board)</option>
                    <option value="BGA">BGA (Ball Grid Array)</option>
                    <option value="CSP">CSP (Chip Scale Package)</option>
                    <option value="Flip-Chip">Flip-Chip Technology</option>
                    <option value="Press-Fit">Press-Fit Technology</option>
                    <option value="Hybrid">
                      Hybrid Mounting (Mixed Technology)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Min Buffer
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      placeholder="e.g. 100"
                      value={formData.minBufferLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minBufferLevel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Buffer
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-xl border border-slate-200 py-2 px-3 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      placeholder="e.g. 5000"
                      value={formData.maxBufferLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxBufferLevel: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-1 space-y-4">
                <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg">
                  <span className="text-xs font-bold text-indigo-900">
                    Technical Specs (JSON)
                  </span>
                  <button
                    onClick={() =>
                      setTechSpecs([...techSpecs, { name: "", value: "" }])
                    }
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"
                  >
                    + Field
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto overflow-x-hidden pr-2">
                  {techSpecs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Resistance"
                        className="flex-1 min-w-0 rounded-md border border-slate-200 py-1.5 px-2 text-xs bg-white uppercase"
                        value={spec.name}
                        onChange={(e) => {
                          const newSpecs = [...techSpecs];
                          newSpecs[idx].name = e.target.value;
                          setTechSpecs(newSpecs);
                        }}
                      />
                      <input
                        type="text"
                        placeholder="e.g. 10k Ohm"
                        className="flex-1 min-w-0 rounded-md border border-slate-200 py-1.5 px-2 text-xs bg-white uppercase"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...techSpecs];
                          newSpecs[idx].value = e.target.value;
                          setTechSpecs(newSpecs);
                        }}
                      />
                      <button
                        onClick={() =>
                          setTechSpecs(techSpecs.filter((_, i) => i !== idx))
                        }
                        type="button"
                        className="text-slate-400 hover:text-red-500 font-bold px-1"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-slate-200">
              {saveError && (
                <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {saveError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSaveError("");
                  }}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveComponent}
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors disabled:opacity-60"
                >
                  {isSaving
                    ? "Processing..."
                    : isEditing
                      ? "Update Master"
                      : "Save Component Master"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-5xl shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Import Components via CSV
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Review and confirm all rows before uploading. Rows with errors
                  will be skipped.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Template
                </button>
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvRows([]);
                    setCsvError("");
                    setUploadResult(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {uploadResult && (
              <div
                className={`mb-4 p-3 rounded-xl text-sm font-semibold ${uploadResult.errors?.length ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
              >
                âœ“ {uploadResult.created} row(s) created successfully.
                {uploadResult.errors?.length > 0 &&
                  ` ${uploadResult.errors.length} row(s) failed.`}
              </div>
            )}
            {csvError && (
              <div className="mb-4 p-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
                {csvError}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-left font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Item Code</th>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Tracking</th>
                    <th className="py-2 px-3">Mounting</th>
                    <th className="py-2 px-3">HSN</th>
                    <th className="py-2 px-3">Make</th>
                    <th className="py-2 px-3">UOM</th>
                    <th className="py-2 px-3">Min Stock</th>
                    <th className="py-2 px-3">Max Stock</th>
                    <th className="py-2 px-3">Tech Specs</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {csvRows.map((row) => (
                    <tr
                      key={row._rowNum}
                      className={row._error ? "bg-red-50" : "hover:bg-slate-50"}
                    >
                      <td className="py-2 px-3 text-slate-400">
                        {row._rowNum}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-600">
                        {row.itemCode}
                      </td>
                      <td className="py-2 px-3">{row.itemName}</td>
                      <td className="py-2 px-3">{row.category}</td>
                      <td className="py-2 px-3">{row.trackingType}</td>
                      <td className="py-2 px-3">{row.mountingTechnology}</td>
                      <td className="py-2 px-3">{row.hsnCode}</td>
                      <td className="py-2 px-3">{row.make}</td>
                      <td className="py-2 px-3">{row.baseUom}</td>
                      <td className="py-2 px-3">{row.minStockLevel}</td>
                      <td className="py-2 px-3">{row.maxStockLevel}</td>
                      <td
                        className="py-2 px-3 max-w-xs truncate text-slate-400"
                        title={row.technicalSpecs}
                      >
                        {row.technicalSpecs}
                      </td>
                      <td className="py-2 px-3">
                        {row._error ? (
                          <span className="text-red-500 font-bold">
                            {row._error}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">
                            âœ“ Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-emerald-600">
                  {csvRows.filter((r) => !r._error).length} valid
                </span>
                {csvRows.some((r) => r._error) && (
                  <span className="font-bold text-red-500 ml-2">
                    {csvRows.filter((r) => r._error).length} invalid (skipped)
                  </span>
                )}{" "}
                of {csvRows.length} total rows
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCsvModal(false);
                    setCsvRows([]);
                    setCsvError("");
                    setUploadResult(null);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                {!uploadResult && (
                  <button
                    onClick={handleCsvUpload}
                    disabled={isUploading}
                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors disabled:opacity-60"
                  >
                    {isUploading
                      ? "Uploading..."
                      : `Upload ${csvRows.filter((r) => !r._error).length} Items`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search components..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.35a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.44a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.35a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.35a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.44a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-4">
              <div className="mb-3">
                <label className="flex items-center text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={mergeDescMake}
                    onChange={() => setMergeDescMake(!mergeDescMake)}
                    className="mr-2 rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                  />
                  Merge Description & Make
                </label>
                <p className="text-xs text-slate-500 ml-5">
                  Combines item name, description, and make into one column.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Visible Columns
                </p>
                {Object.keys(visibleColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center text-sm text-slate-700 mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col]: !prev[col],
                        }))
                      }
                      className="mr-2 rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    {col
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <table className="w-full text-sm mt-4 border border-slate-100 rounded-xl overflow-hidden">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            {visibleColumns.itemCode && (
              <th className="py-2 px-3">Item Code</th>
            )}

            {mergeDescMake &&
              (visibleColumns.itemName ||
                visibleColumns.make ||
                visibleColumns.description) && (
                <th className="py-2 px-3">Component Profile</th>
              )}

            {!mergeDescMake && visibleColumns.itemName && (
              <th className="py-2 px-3">Item Name</th>
            )}
            {!mergeDescMake && visibleColumns.description && (
              <th className="py-2 px-3">Description</th>
            )}
            {!mergeDescMake && visibleColumns.make && (
              <th className="py-2 px-3">Make</th>
            )}

            {visibleColumns.category && <th className="py-2 px-3">Category</th>}
            {visibleColumns.trackingType && (
              <th className="py-2 px-3">Tracking</th>
            )}
            {visibleColumns.baseUom && <th className="py-2 px-3">UOM</th>}
            {visibleColumns.hsnCode && <th className="py-2 px-3">HSN</th>}
            {visibleColumns.mountingTechnology && (
              <th className="py-2 px-3">Mounting</th>
            )}
            {visibleColumns.bufferLevels && (
              <th className="py-2 px-3">Min / Max Buffer</th>
            )}
            {visibleColumns.techSpecs && (
              <th className="py-2 px-3">Technical Specs</th>
            )}

            <th className="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {isLoadingItems ? (
            <tr>
              <td colSpan="12" className="py-12 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-medium">Loading components...</p>
                </div>
              </td>
            </tr>
          ) : filteredItems.length === 0 ? (
            <tr>
              <td colSpan="12" className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No components found.</p>
                <p className="text-xs">Try adjusting your search or filters.</p>
              </td>
            </tr>
          ) : (
            filteredItems.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50 transition-colors"
              >
                {visibleColumns.itemCode && (
                  <td className="py-2 px-3 font-mono font-bold text-indigo-600">
                    {item.itemCode}
                  </td>
                )}

                {mergeDescMake &&
                  (visibleColumns.itemName ||
                    visibleColumns.make ||
                    visibleColumns.description) && (
                    <td className="py-2 px-3">
                      {visibleColumns.itemName && (
                        <div className="font-semibold text-slate-900">
                          {item.itemName}
                        </div>
                      )}
                      {visibleColumns.description && item.description && (
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 uppercase">
                          {item.description}
                        </div>
                      )}
                      {visibleColumns.make && item.make && (
                        <div className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1 uppercase font-bold">
                          {item.make}
                        </div>
                      )}
                    </td>
                  )}

                {!mergeDescMake && visibleColumns.itemName && (
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {item.itemName}
                  </td>
                )}
                {!mergeDescMake && visibleColumns.description && (
                  <td className="py-2 px-3 text-xs text-slate-500 uppercase">
                    {item.description}
                  </td>
                )}
                {!mergeDescMake && visibleColumns.make && (
                  <td className="py-2 px-3 text-xs text-indigo-600 uppercase font-bold">
                    {item.make}
                  </td>
                )}

                {visibleColumns.category && (
                  <td className="py-2 px-3 text-slate-500 text-xs font-medium uppercase">
                    {item.category}
                  </td>
                )}

                {visibleColumns.trackingType && (
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold rounded px-2 py-1 w-max inline-block uppercase ${item.trackingType === "Serialized" ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-500"}`}
                    >
                      {item.trackingType}
                    </span>
                  </td>
                )}

                {visibleColumns.baseUom && (
                  <td className="py-2 px-3 text-slate-500 text-xs uppercase">
                    {item.baseUom}
                  </td>
                )}

                {visibleColumns.hsnCode && (
                  <td className="py-2 px-3 text-slate-500 text-xs font-mono">
                    {item.hsnCode || "-"}
                  </td>
                )}

                {visibleColumns.mountingTechnology && (
                  <td className="py-2 px-3">
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold uppercase">
                      {item.mountingTechnology || "N/A"}
                    </span>
                  </td>
                )}

                {visibleColumns.bufferLevels && (
                  <td className="py-2 px-3">
                    <span className="text-red-500 font-bold">
                      {item.minStockLevel || 0}
                    </span>{" "}
                    /{" "}
                    <span className="text-emerald-500 font-bold">
                      {item.maxStockLevel || 0}
                    </span>
                  </td>
                )}

                {visibleColumns.techSpecs && (
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap gap-1">
                      {item.technicalSpecs &&
                        Object.entries(item.technicalSpecs)
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded uppercase"
                            >
                              {k}: {v}
                            </span>
                          ))}
                      {item.technicalSpecs &&
                        Object.keys(item.technicalSpecs).length > 3 && (
                          <span className="text-[9px] text-slate-400">
                            +{Object.keys(item.technicalSpecs).length - 3} more
                          </span>
                        )}
                    </div>
                  </td>
                )}
                <td className="py-2 px-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit Compound"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Forever"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ComponentConfig;
