"use client";

import { useState } from "react";
import { CopyPlus, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function ProcurementPage() {
    const [activeTab, setActiveTab] = useState("indent");

    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Procurement & Vendors</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Manage strict "No Indent, No PO" workflows, vendor lists, and product indenting.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab("indent")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "indent"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        Create Indent
                    </button>
                    <button
                        onClick={() => setActiveTab("approval")}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "approval"
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                    >
                        PO Gen & Approvals
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    {activeTab === "indent" ? <IndentCreation /> : <POApproval />}
                </div>
            </div>
        </div>
    );
}

function IndentCreation() {
    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <CopyPlus className="mr-2 text-indigo-600 h-6 w-6" />
                    Raise Requisition (Indent)
                </h2>
                <p className="text-sm text-slate-500 mt-1">Material requisition for components reaching minimum buffer levels.</p>
            </div>

            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Requesting Department</label>
                        <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                            <option>Production Store</option>
                            <option>Raw Material Store</option>
                            <option>Projects / Setup</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Item Required</label>
                        <input type="text" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="e.g. 10k Ohm Resistors" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Quantity Requested</label>
                        <input type="number" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="1000" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">Tracking Type Needed</label>
                        <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                            <option>Bulk (Quantity only)</option>
                            <option>Hex Tag (QR individual)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all">
                        Submit Indent for Approval
                    </button>
                </div>
            </form>
        </div>
    );
}

function POApproval() {
    const pendingIndents = [
        { id: "IND-2024-081", dept: "Raw Material", item: "Capacitors 20uF", qty: 500, state: "Pending" },
        { id: "IND-2024-082", dept: "Production", item: "PCB Alpha-X", qty: 25, state: "Pending" }
    ];

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <FileText className="mr-2 text-indigo-600 h-6 w-6" />
                        Pending Indents & PO Generation
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Review indents and automatically generate PO from pre-negotiated Vendor catalogs.</p>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Indent No</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Item Requested</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {pendingIndents.map((ind, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-indigo-600">{ind.id}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 font-medium">{ind.dept}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-semibold">{ind.item}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{ind.qty}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <button className="flex items-center text-emerald-600 font-bold hover:text-emerald-700">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Gen PO
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
