"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, Search, ArrowRight, QrCode, Database } from "lucide-react";

const PAGE_HEADERS = {
  build: {
    title: "New Assembly Build",
    subtitle:
      "Scan Hex Tags and bind components into a finished product with auto-serial.",
  },
  bom: {
    title: "BOM Configuration",
    subtitle: "Define ratio mappings for spare parts and finished products.",
  },
  genealogy: {
    title: "Genealogy Trace",
    subtitle:
      "Trace all components, suppliers, and operators via serial number.",
  },
  products: {
    title: "Product Config",
    subtitle: "Define finished goods properties, variants, and base pricing.",
  },
  components: {
    title: "Component Config",
    subtitle: "Manage raw material specs, buffer levels, and tech attributes.",
  },
  spares: {
    title: "Spare Parts Config",
    subtitle: "Configure field-replaceable units and service kits.",
  },
};

function ProductionContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "build";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (
      [
        "build",
        "bom",
        "genealogy",
        "products",
        "components",
        "spares",
      ].includes(tabFromUrl)
    )
      setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.build;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
        </div>

        {/* Tab switcher — mobile only */}
        <div className="md:hidden flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          {[
            "build",
            "bom",
            "genealogy",
            "products",
            "components",
            "spares",
          ].map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tabKey
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {PAGE_HEADERS[tabKey].title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "build" && <NewBuild />}
          {activeTab === "bom" && <BOMConfig />}
          {activeTab === "genealogy" && <GenealogyTrace />}
          {activeTab === "products" && <ProductConfig />}
          {activeTab === "components" && <ComponentConfig />}
          {activeTab === "spares" && <SpareParts Config />}
        </div>
      </div>
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense>
      <ProductionContent />
    </Suspense>
  );
}

function BOMConfig() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [targetProduct, setTargetProduct] = useState("");
  const [materials, setMaterials] = useState([]);

  const handleAddMaterial = (e) => {
    e.preventDefault();
    setMaterials([...materials, { name: "New Component", qty: 1 }]);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Database className="mr-2 text-indigo-600 h-6 w-6" />
          Master BOM Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define ratio mappings for Spare Parts (PCBs) and Finished Products.
        </p>
      </div>

      <div
        className={`bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 transition-all ${isInitialized ? "opacity-50 pointer-events-none" : ""}`}
      >
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Create New BOM
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={targetProduct}
            onChange={(e) => setTargetProduct(e.target.value)}
            placeholder="Target Product Name"
            className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
          />
          <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600">
            <option>Finished_Product</option>
            <option>Spare_Part</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              if (targetProduct) setIsInitialized(true);
            }}
            className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${
              targetProduct
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            disabled={!targetProduct}
          >
            Initialize BOM Recipe
          </button>
        </div>
      </div>

      {isInitialized && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-indigo-50 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recipe: <span className="text-indigo-600">{targetProduct}</span>
              </h3>
              <p className="text-sm text-slate-500">
                Add required components and quantities for one unit.
              </p>
            </div>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              + Add Item
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-indigo-50/50 rounded-xl border border-dashed border-indigo-100 mb-6">
              <Database className="w-8 h-8 text-indigo-300 mb-2" />
              <p className="text-sm text-indigo-900 font-semibold mb-1">
                BOM is empty
              </p>
              <p className="text-xs text-indigo-700/70 max-w-xs">
                Click "Add Item" to start appending components and raw materials
                to this recipe.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-12 gap-3 px-3">
                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Item Code
                </span>
                <span className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </span>
                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Legend (e.g. C12)
                </span>
                <span className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Qty Req
                </span>
                <span className="col-span-1"></span>
              </div>
              {materials.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2 pl-3 rounded-lg border border-slate-100 group"
                >
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="COMP-001"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 uppercase"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Component description"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="R1, C2 (optional)"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 uppercase"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      defaultValue={m.qty}
                      min="1"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() =>
                        setMaterials(materials.filter((_, idx) => idx !== i))
                      }
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setIsInitialized(false);
                setMaterials([]);
                setTargetProduct("");
              }}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Discard Draft
            </button>
            <button className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm rounded-xl transition-colors">
              Save Parent BOM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
            <span className="text-sm font-bold text-slate-900">₹ 0.00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-600">
              Assigned Labor
            </span>
            <span className="text-sm font-bold text-emerald-600">
              ₹ 450.00/hr
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-600">
              Prev. Month Overhead Factor
            </span>
            <span className="text-sm font-bold text-rose-600">
              + ₹ 145.00/unit
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Est. Transfer Price
            </span>
            <span className="text-3xl font-black text-indigo-700">
              ₹ 595.00
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

function GenealogyTrace() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Search className="mr-2 text-indigo-600 h-6 w-6" />
            Serial Number Genealogy
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Trace all internal components, suppliers, and assigned operator via
            Serial Number.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            placeholder="Enter Serial Number..."
          />
        </div>
      </div>

      {/* Mock Traced Data */}
      <div className="mt-8 border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">
              Product:{" "}
              <span className="text-indigo-600">
                Model X Server (B26020001)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Manufactured on 2026-02-28 • Operator: John Doe
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            Passed QC
          </span>
        </div>
        <div className="p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Component Traceability Tree
          </h4>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Database className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Mainboard PCBA</div>
                  <div className="font-mono text-xs text-indigo-600">
                    HX-MB-9012
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  Supplier: Global Tech (GRN-442) • Received: 2026-02-20
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Database className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">
                    Power Supply Unit
                  </div>
                  <div className="font-mono text-xs text-indigo-600">
                    HX-PSU-4411
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  Supplier: Electro Components (GRN-391) • Received: 2026-02-15
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductConfig() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Finished Goods Catalog
        </h2>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
          + Add Product Model
        </button>
      </div>
      <p className="text-slate-500 text-sm">
        Define top-level products that map to BOMs for assembly.
      </p>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
        <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          No products defined yet. Add your first manufacturing model to begin.
        </p>
      </div>
    </div>
  );
}

function ComponentConfig() {
  const [showForm, setShowForm] = useState(false);
  const [techSpecs, setTechSpecs] = useState([{ name: "Value", value: "" }]);

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const csvInputRef = useState(null);

  // Form Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Items List State
  const [itemsList, setItemsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch("/api/production/items");
      const json = await res.json();
      if (json.success) {
        setItemsList(json.items);
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

    if (autoDesc) {
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
      const res = await fetch("/api/production/items", {
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
        if (rest.itemCode) rest.itemCode = rest.itemCode.toLowerCase();
        if (rest.itemName) rest.itemName = rest.itemName.toLowerCase();
        if (rest.category) rest.category = rest.category.toLowerCase();
        if (rest.make) rest.make = rest.make.toLowerCase();
        if (rest.description) rest.description = rest.description.toLowerCase();
        if (rest.baseUom) rest.baseUom = rest.baseUom.toLowerCase();

        if (typeof rest.technicalSpecs === "string") {
          rest.technicalSpecs = rest.technicalSpecs.toLowerCase();
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
      setUploadResult(json.results);
      if (json.success) fetchItems();
    } catch {
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

  return (
    <div className="space-y-6">
      {/* Hidden CSV File Input */}
      <input
        type="file"
        accept=".csv"
        className="hidden"
        id="csv-upload-input"
        onChange={handleCsvFile}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Raw Materials & Components Master
        </h2>
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
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
                    <option value="">— Select —</option>
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
                ✓ {uploadResult.created} row(s) created successfully.
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
                            ✓ Ready
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

      <table className="w-full text-sm mt-4 border border-slate-100 rounded-xl overflow-hidden">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <th className="py-3 px-4">Item Code</th>
            <th className="py-3 px-4">Description / Make</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Tracking</th>
            <th className="py-3 px-4">Min / Max Buffer</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {isLoadingItems ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-medium">Loading components...</p>
                </div>
              </td>
            </tr>
          ) : itemsList.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No components found.</p>
                <p className="text-xs">
                  Add your first component or import a CSV kit.
                </p>
              </td>
            </tr>
          ) : (
            itemsList.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                  {item.itemCode}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">
                    {item.itemName}
                  </div>
                  {item.description && (
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </div>
                  )}
                  {item.make && (
                    <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 uppercase">
                      Make: {item.make}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-500 text-xs font-medium">
                  {item.category}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs font-bold rounded px-2 py-1 w-max inline-block ${item.trackingType === "Serialized" ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-500"}`}
                  >
                    {item.trackingType}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-red-500 font-bold">
                    {item.minStockLevel || 0}
                  </span>{" "}
                  /{" "}
                  <span className="text-emerald-500 font-bold">
                    {item.maxStockLevel || 0}
                  </span>{" "}
                  {item.baseUom}
                </td>
                <td className="py-3 px-4 text-right">
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

function SpareParts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Service & Spare Kits
        </h2>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
          + Add Spare Kit
        </button>
      </div>
      <p className="text-slate-500 text-sm">
        Configure subsets of components meant for field repairs instead of new
        builds.
      </p>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
        <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          Spare parts catalog is currently empty.
        </p>
      </div>
    </div>
  );
}
