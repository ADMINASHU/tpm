"use client";

import { useState } from "react";
import { Truck, Search, MapPin, RefreshCw } from "lucide-react";

export default function LogisticsPage() {
    const [activeTab, setActiveTab] = useState("transfer");

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Logistics & Storage</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Manage inter-store transfers, multi-location logic, and item health conditions.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("transfer")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "transfer"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        Internal Stock Transfer
                    </button>
                    <button
                        onClick={() => setActiveTab("dispatch")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "dispatch"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        External Dispatch
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {activeTab === "transfer" ? <StockTransfer /> : <div className="text-slate-500">External Dispatch tracking in configuration...</div>}
                </div>
            </div>
        </div>
    );
}

function StockTransfer() {
    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <RefreshCw className="mr-2 text-indigo-600 h-6 w-6" />
                    Initiate Stock Transfer
                </h2>
                <p className="text-sm text-slate-500 mt-1">Move components or finished goods between logical factory stores.</p>
            </div>

            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Source Store</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                                <option>Raw Material Store (Bengaluru)</option>
                                <option>Production Store (Bengaluru)</option>
                                <option>Finished Goods (Bengaluru)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Destination Store</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                                <option>Production Store (Bengaluru)</option>
                                <option>Raw Material Store (Bengaluru)</option>
                                <option>Finished Goods (Bengaluru)</option>
                                <option>Service Center (Bengaluru)</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Item to Transfer</label>
                        <input type="text" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Scan Hex Tag or search Bulk Name..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Quantity</label>
                        <input type="number" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="1" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Item Condition</label>
                        <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                            <option value="NEW">New (Pristine)</option>
                            <option value="REFURBISHED">Refurbished / Repaired</option>
                            <option value="FAULTY">Faulty / Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all">
                        Commit Transfer
                    </button>
                </div>
            </form>
        </div>
    );
}
