"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, Search, ArrowRight, QrCode, Database } from "lucide-react";

const PAGE_HEADERS = {
    build: { title: "New Assembly Build", subtitle: "Scan Hex Tags and bind components into a finished product with auto-serial." },
    bom: { title: "BOM Configuration", subtitle: "Define ratio mappings for spare parts and finished products." },
    genealogy: { title: "Genealogy Trace", subtitle: "Trace all components, suppliers, and operators via serial number." },
    products: { title: "Product Config", subtitle: "Define finished goods properties, variants, and base pricing." },
    components: { title: "Component Config", subtitle: "Manage raw material specs, buffer levels, and tech attributes." },
    spares: { title: "Spare Parts Config", subtitle: "Configure field-replaceable units and service kits." },
};

function ProductionContent() {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab") || "build";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    useEffect(() => {
        if (["build", "bom", "genealogy", "products", "components", "spares"].includes(tabFromUrl)) setActiveTab(tabFromUrl);
    }, [tabFromUrl]);

    const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.build;

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
                </div>

                {/* Tab switcher — mobile only */}
                <div className="md:hidden flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
                    {["build", "bom", "genealogy", "products", "components", "spares"].map(tabKey => (
                        <button key={tabKey} onClick={() => setActiveTab(tabKey)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tabKey ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}>
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
    return <Suspense><ProductionContent /></Suspense>;
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
                <p className="text-sm text-slate-500 mt-1">Define ratio mappings for Spare Parts (PCBs) and Finished Products.</p>
            </div>

            <div className={`bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 transition-all ${isInitialized ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Create New BOM</h3>
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
                        className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${targetProduct ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-slate-200 text-slate-400 cursor-not-allowed"
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
                            <h3 className="text-lg font-bold text-slate-900">Recipe: <span className="text-indigo-600">{targetProduct}</span></h3>
                            <p className="text-sm text-slate-500">Add required components and quantities for one unit.</p>
                        </div>
                        <button onClick={handleAddMaterial} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                            + Add Item
                        </button>
                    </div>

                    {materials.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center bg-indigo-50/50 rounded-xl border border-dashed border-indigo-100 mb-6">
                            <Database className="w-8 h-8 text-indigo-300 mb-2" />
                            <p className="text-sm text-indigo-900 font-semibold mb-1">BOM is empty</p>
                            <p className="text-xs text-indigo-700/70 max-w-xs">Click "Add Item" to start appending components and raw materials to this recipe.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-6">
                            <div className="grid grid-cols-12 gap-3 px-3">
                                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Code</span>
                                <span className="col-span-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</span>
                                <span className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Qty Req</span>
                                <span className="col-span-1"></span>
                            </div>
                            {materials.map((m, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2 pl-3 rounded-lg border border-slate-100 group">
                                    <div className="col-span-2">
                                        <input type="text" placeholder="COMP-001" className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 uppercase" />
                                    </div>
                                    <div className="col-span-6">
                                        <input type="text" placeholder="Component description" className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" defaultValue={m.qty} min="1" className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600" />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button onClick={() => { setIsInitialized(false); setMaterials([]); setTargetProduct(""); }} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Discard Draft</button>
                        <button className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm rounded-xl transition-colors">Save Parent BOM</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function NewBuild() {
    const [components, setComponents] = useState([]);
    const [scannedTag, setScannedTag] = useState("");

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
                    <p className="text-sm text-slate-500 mt-1">Select BOM and scan Hex Tags to bind components into a finished product.</p>
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
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                        ADD
                    </button>
                </form>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[300px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Scanned Entities ({components.length})</h3>
                    {components.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 h-48">
                            <QrCode className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No tracking entries logged yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {components.map((c, i) => (
                                <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 flex items-center justify-between group">
                                    <span className="font-mono text-sm font-bold text-slate-700">{c}</span>
                                    <button type="button" onClick={() => setComponents(components.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 hidden group-hover:block transition-colors text-xs font-bold">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Real-Time Costing & Auto-SN</h3>

                <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 bg-white rounded-lg p-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Target Smart Serial</span>
                        <span className="text-sm font-mono font-bold text-indigo-600">B26020001 (Auto-gen)</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200 mt-4">
                        <span className="text-sm font-semibold text-slate-600">Base BOM Cost</span>
                        <span className="text-sm font-bold text-slate-900">₹ 0.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-semibold text-slate-600">Assigned Labor</span>
                        <span className="text-sm font-bold text-slate-900 text-emerald-600">₹ 450.00/hr</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm font-semibold text-slate-600">Prev. Month Overhead Factor</span>
                        <span className="text-sm font-bold text-slate-900 text-rose-600">+ ₹ 145.00/unit</span>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Est. Transfer Price</span>
                        <span className="text-3xl font-black text-indigo-700">₹ 595.00</span>
                    </div>
                    <button
                        disabled={components.length === 0}
                        className="w-full flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
                    <p className="text-sm text-slate-500 mt-1">Trace all internal components, suppliers, and assigned operator via Serial Number.</p>
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
        </div>
    );
}

function ProductConfig() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Finished Goods Catalog</h2>
                <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
                    + Add Product Model
                </button>
            </div>
            <p className="text-slate-500 text-sm">Define top-level products that map to BOMs for assembly.</p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No products defined yet. Add your first manufacturing model to begin.</p>
            </div>
        </div>
    );
}

function ComponentConfig() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Raw Materials & Variables</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all">
                        Import CSV
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
                        + Add Component
                    </button>
                </div>
            </div>
            <p className="text-slate-500 text-sm">Register electronic components, hardware, and packaging. Sets indent trigger levels.</p>
            <table className="w-full text-sm mt-4">
                <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-3">Component Code</th><th className="pb-3">Description</th><th className="pb-3">Min Buffer</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-indigo-600">RES-10K-001</td>
                        <td className="py-3 font-semibold text-slate-900">10k Ohm Resistor 1/4W</td>
                        <td className="py-3 text-red-500 font-bold">1,000 unit</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-indigo-600">CAP-22U-002</td>
                        <td className="py-3 font-semibold text-slate-900">22uF Electrolytic Cap</td>
                        <td className="py-3 text-red-500 font-bold">500 unit</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function SpareParts() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Service & Spare Kits</h2>
                <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm">
                    + Add Spare Kit
                </button>
            </div>
            <p className="text-slate-500 text-sm">Configure subsets of components meant for field repairs instead of new builds.</p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center py-12">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Spare parts catalog is currently empty.</p>
            </div>
        </div>
    );
}
