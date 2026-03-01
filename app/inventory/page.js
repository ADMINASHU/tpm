"use client";

import { useState } from "react";
import { PlusCircle, QrCode, Search, CheckCircle2 } from "lucide-react";

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState("grn");

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Manage your raw materials, Quick GRN, and Hex Tag assignments.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("grn")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "grn"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        Quick GRN
                    </button>
                    <button
                        onClick={() => setActiveTab("indexing")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "indexing"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        Hex Tag Indexing
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {activeTab === "grn" ? <QuickGRN /> : <HexIndexing />}
                </div>
            </div>
        </div>
    );
}

function QuickGRN() {
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <PlusCircle className="mr-2 text-indigo-600 h-6 w-6" />
                    Quick GRN (Buffer Stock)
                </h2>
                <p className="text-sm text-slate-500 mt-1">Fast entry for unloading trucks. Generates Hex Tags for later indexing.</p>
            </div>

            {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center text-emerald-800 text-sm font-semibold">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-emerald-600" />
                    GRN Successfully Recorded! 5 Hex Tags generated.
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Supplier Name</label>
                        <input type="text" required className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="e.g. Acme Corp" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Challan / Invoice No.</label>
                        <input type="text" required className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="INV-2024-001" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Item Description (General)</label>
                        <input type="text" required className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Transformers" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Quantity Received</label>
                        <input type="number" min="1" required className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="5" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button type="submit" className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Process GRN & Generate Tags
                    </button>
                </div>
            </form>
        </div>
    );
}

function HexIndexing() {
    return (
        <div className="max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <QrCode className="mr-2 text-indigo-600 h-6 w-6" />
                        Hex Tag Indexing
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Scan unindexed tags and link them to exact technical specs.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        placeholder="Scan Hex Tag..."
                        autoFocus
                    />
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center py-16">
                <QrCode className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-slate-900 font-semibold mb-1">Awaiting Scanner Input</h3>
                <p className="text-slate-500 text-sm max-w-sm">Please scan a printed 4-digit Hex Tag to begin indexing and assign technical specifications.</p>
            </div>
        </div>
    );
}
