"use client";

import { useState } from "react";
import { Wrench, Search, ArrowRight, QrCode, FileText, Database } from "lucide-react";

export default function ProductionPage() {
    const [activeTab, setActiveTab] = useState("build");

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Production Engine</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Manage product BOM configurations, builds, and genealogy traces.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("bom")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "bom"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        BOM Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab("build")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "build"
                            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        New Assembly Build
                    </button>
                    <button
                        onClick={() => setActiveTab("genealogy")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "genealogy"
                            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        Genealogy Trace
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {activeTab === "bom" && <BOMConfig />}
                    {activeTab === "build" && <NewBuild />}
                    {activeTab === "genealogy" && <GenealogyTrace />}
                </div>
            </div>
        </div>
    );
}

function BOMConfig() {
    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <Database className="mr-2 text-indigo-600 h-6 w-6" />
                    Master BOM Configuration
                </h2>
                <p className="text-sm text-slate-500 mt-1">Define ratio mappings for Spare Parts (PCBs) and Finished Products.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Create New BOM</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Target Product Name" className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600" />
                    <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600">
                        <option>Finished_Product</option>
                        <option>Spare_Part</option>
                    </select>
                </div>
                <div className="mt-4 flex justify-end">
                    <button className="bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-lg">Initialize BOM Recipe</button>
                </div>
            </div>
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
