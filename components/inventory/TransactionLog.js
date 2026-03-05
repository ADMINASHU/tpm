"use client";

import { useState, useEffect } from "react";
import {
    History, Search, Filter, ArrowUpRight, ArrowDownLeft,
    RefreshCw, Package, User, Calendar, FileText
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function TransactionLog({ pageName = "Inventory" }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/inventory/transactions");
            const json = await res.json();
            if (json.success) {
                setTransactions(json.transactions || []);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredLogs = transactions.filter(log => {
        const searchLow = searchTerm.toLowerCase();
        const itemName = log.item?.itemName?.toLowerCase() || "";
        const itemCode = log.item?.itemCode?.toLowerCase() || "";
        const reference = log.reference?.toLowerCase() || "";

        const matchesSearch =
            itemName.includes(searchLow) ||
            itemCode.includes(searchLow) ||
            reference.includes(searchLow);

        const matchesType = typeFilter === "ALL" || log.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const getTxTypeBadge = (type) => {
        const styles = {
            OPENING_STOCK: "bg-blue-50 text-blue-700 border-blue-100",
            GRN: "bg-emerald-50 text-emerald-700 border-emerald-100",
            STOCK_TRANSFER_IN: "bg-indigo-50 text-indigo-700 border-indigo-100",
            STOCK_TRANSFER_OUT: "bg-amber-50 text-amber-700 border-amber-100",
            PRODUCTION_CONSUMPTION: "bg-rose-50 text-rose-700 border-rose-100",
            PRODUCTION_OUTPUT: "bg-purple-50 text-purple-700 border-purple-100",
            ADJUSTMENT: "bg-slate-50 text-slate-700 border-slate-100",
        };
        return styles[type] || "bg-slate-50 text-slate-500 border-slate-100";
    };

    const getTxIcon = (type) => {
        if (type.includes("IN") || type === "GRN" || type === "PRODUCTION_OUTPUT" || type === "OPENING_STOCK") {
            return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />;
        }
        return <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="h-6 w-6 text-indigo-600" />
                        Transaction Logs
                    </h2>
                    <Breadcrumb pageName={pageName} subPageName="Transaction Logs" />
                </div>
                <button
                    onClick={fetchTransactions}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Refresh Logs"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
                        placeholder="Search by item name, code or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        className="block rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">All Transaction Types</option>
                        <option value="OPENING_STOCK">Opening Stock</option>
                        <option value="GRN">Goods Receipt (GRN)</option>
                        <option value="STOCK_TRANSFER_IN">Stock Transfer In</option>
                        <option value="STOCK_TRANSFER_OUT">Stock Transfer Out</option>
                        <option value="PRODUCTION_OUTPUT">Production Build</option>
                        <option value="PRODUCTION_CONSUMPTION">Production Consumption</option>
                        <option value="ADJUSTMENT">Adjustments</option>
                    </select>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                            <th className="py-4 px-6">Timestamp</th>
                            <th className="py-4 px-6">Item Identity</th>
                            <th className="py-4 px-6 text-center">Type</th>
                            <th className="py-4 px-6 text-right">Movement</th>
                            <th className="py-4 px-6 text-right">Balance After</th>
                            <th className="py-4 px-6">Reference & User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-slate-400 font-medium">Loading audit trail...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-slate-400 italic">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 font-bold">
                                                {new Date(log.date || log.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium lowercase italic">
                                                {log.date ? 'Log Date' : 'Recorded at'} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{log.item?.itemName}</span>
                                            <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase">{log.item?.itemCode}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTxTypeBadge(log.type)}`}>
                                            {log.type.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className={`py-4 px-6 text-right font-black flex items-center justify-end gap-1.5 ${log.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {getTxIcon(log.type)}
                                        {log.quantity >= 0 ? '+' : ''}{log.quantity.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                                        {log.balanceAfter.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <FileText className="w-3 h-3" />
                                                <span className="font-semibold">{log.reference || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                <User className="w-3 h-3" />
                                                <span>{log.performedBy?.name || "System"}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TransactionLog;
