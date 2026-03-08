"use client";

import { useState, useEffect } from "react";
import {
    History, Search, Filter, ArrowUpRight, ArrowDownLeft,
    RefreshCw, Package, User, Calendar, FileText, Plus, X, CheckCircle2, AlertCircle
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { formatDateTimeIST, formatDateIST, formatTimeIST } from "@/lib/dateUtils";

function TransactionLog({ pageName = "Inventory" }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [showOpeningModal, setShowOpeningModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this log? This will reverse the stock balance adjustment.")) return;
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/inventory/transactions/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                fetchTransactions();
            } else {
                alert(json.error || "Failed to delete logic");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting log");
        } finally {
            setIsDeleting(null);
        }
    }

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
                <div className="flex items-center gap-3">
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

                    <button
                        onClick={() => setShowOpeningModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Record Opening Stock
                    </button>
                </div>
            </div>

            {/* Opening Stock Modal */}
            {showOpeningModal && (
                <OpeningStockModal
                    onClose={() => setShowOpeningModal(false)}
                    onSuccess={() => {
                        setShowOpeningModal(false);
                        fetchTransactions();
                    }}
                />
            )}

            {/* Edit Log Modal */}
            {editingLog && (
                <EditLogModal
                    log={editingLog}
                    onClose={() => setEditingLog(null)}
                    onSuccess={() => {
                        setEditingLog(null);
                        fetchTransactions();
                    }}
                />
            )}

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
                            <th className="py-4 px-6 text-right">Actions</th>
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
                                                {formatDateIST(log.date || log.createdAt)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium lowercase italic">
                                                {log.date ? 'Log Date' : 'Recorded at'} {formatTimeIST(log.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{log.masterName}</span>
                                            <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-2">
                                                {log.masterCode}
                                                {log.entityTag && (
                                                    <span className="text-slate-400 font-medium lowercase">
                                                        ({log.entityTag})
                                                    </span>
                                                )}
                                            </span>
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
                                    <td className="py-4 px-6 text-right font-medium text-xs">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setEditingLog(log)}
                                                className="text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(log._id)}
                                                disabled={isDeleting === log._id}
                                                className="text-rose-600 hover:text-rose-800 transition-colors bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
                                            >
                                                {isDeleting === log._id ? '...' : 'Delete'}
                                            </button>
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

function OpeningStockModal({ onClose, onSuccess }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (searchQuery.length > 1) {
            const delayDebounce = setTimeout(() => {
                fetchItems();
            }, 300);
            return () => clearTimeout(delayDebounce);
        }
    }, [searchQuery]);

    const fetchItems = async () => {
        try {
            const query = encodeURIComponent(searchQuery);
            // Fetch from Configs
            const [compRes, spareRes, prodRes] = await Promise.all([
                fetch(`/api/production/config/components?search=${query}`),
                fetch(`/api/production/config/spares?search=${query}`),
                fetch(`/api/production/config/products?search=${query}`)
            ]);

            const [compData, spareData, prodData] = await Promise.all([
                compRes.json(),
                spareRes.json(),
                prodRes.json()
            ]);

            let combined = [];
            if (compData.success) {
                combined = [...combined, ...compData.data.map(c => ({ ...c, configModel: "ComponentConfig", type: 'config', displayName: c.itemName }))];
            }
            if (spareData.success) {
                combined = [...combined, ...spareData.data.map(s => ({ ...s, configModel: "SpareConfig", type: 'config', displayName: s.itemName }))];
            }
            if (prodData.success) {
                combined = [...combined, ...prodData.data.map(p => ({ ...p, configModel: "ProductConfig", type: 'config', displayName: p.productName, itemCode: p.serialNumber }))];
            }

            setItems(combined);
        } catch (err) {
            console.error("Search error", err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedItem || !quantity) return;
        setIsSaving(true);
        setError("");

        try {
            const payload = {
                configId: selectedItem._id,
                configModel: selectedItem.configModel,
                type: "OPENING_STOCK",
                quantity: Number(quantity),
                unitPrice: unitPrice ? Number(unitPrice) : undefined,
                date,
                notes: "Manual Opening Stock Entry",
                reference: "MANUAL_ENTRY",
                entityTag: (selectedItem.trackingType === "Serialized" || selectedItem.configModel === "ProductConfig") ? selectedItem.itemCode : undefined
            };

            const res = await fetch("/api/inventory/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                onSuccess();
            } else {
                setError(json.error || "Failed to save transaction");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-600" /> Record Opening Stock
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    {!selectedItem ? (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Component / Spare / Product</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm shadow-sm"
                                    placeholder="Type to search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                                {items.map(item => (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => setSelectedItem(item)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{item.displayName || item.itemName}</span>
                                            <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase">{item.itemCode}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.configModel === 'ProductConfig' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {item.configModel === "SpareConfig" ? "Spare" : item.configModel === "ProductConfig" ? "Product" : "Component"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 font-mono">Selected Item</p>
                                    <p className="text-sm font-black text-indigo-900">{selectedItem.displayName || selectedItem.itemName}</p>
                                    <p className="text-[11px] font-mono text-indigo-600 mt-0.5">{selectedItem.itemCode}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedItem(null)} className="text-[10px] font-bold text-indigo-600 hover:underline">Change</button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opening Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        className="block w-full px-4 py-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (₹)</label>
                                    <input
                                        type="number"
                                        className="block w-full px-4 py-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                        placeholder="0.00"
                                        value={unitPrice}
                                        onChange={(e) => setUnitPrice(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="block w-full px-4 py-2.5 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-100">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={!selectedItem || !quantity || isSaving}
                            className="flex-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Opening Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditLogModal({ log, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState(log.quantity.toString() || "");
    const [type, setType] = useState(log.type || "ADJUSTMENT");
    const [reference, setReference] = useState(log.reference || "");
    const [notes, setNotes] = useState(log.notes || "");
    const [date, setDate] = useState((log.date || log.createdAt).toString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const payload = {
                type,
                quantity: Number(quantity),
                reference,
                notes,
                date
            };

            const res = await fetch(`/api/inventory/transactions/${log._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                onSuccess();
            } else {
                setError(json.error || "Failed to update transaction");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600" /> Edit Transaction Log
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 font-mono">Linked Master Configuration</p>
                        <p className="text-sm font-black text-indigo-900">{log.masterName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono text-indigo-600">{log.masterCode}</span>
                            {log.entityTag && (
                                <span className="text-[10px] text-slate-400 font-medium">Instance: {log.entityTag}</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Type</label>
                            <select
                                className="block rounded-xl border border-slate-200 py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="OPENING_STOCK">Opening Stock</option>
                                <option value="GRN">Goods Receipt (GRN)</option>
                                <option value="STOCK_TRANSFER_IN">Stock Transfer In</option>
                                <option value="STOCK_TRANSFER_OUT">Stock Transfer Out</option>
                                <option value="PRODUCTION_OUTPUT">Production Build</option>
                                <option value="PRODUCTION_CONSUMPTION">Production Consumption</option>
                                <option value="ADJUSTMENT">Adjustment</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity (+ / -)</label>
                            <input
                                type="number"
                                required
                                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                required
                                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference Doc</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm uppercase"
                                placeholder="PO-1234, INV-99"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes / Reason</label>
                        <textarea
                            className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                            rows={2}
                            placeholder="Reason for adjustment..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-100">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={!quantity || isSaving}
                            className="flex-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                        >
                            {isSaving ? "Updating..." : "Update Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransactionLog;
