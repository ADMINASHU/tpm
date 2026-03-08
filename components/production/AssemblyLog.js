"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    ClipboardList,
    Search,
    Filter,
    Clock,
    Box,
    Cpu,
    User,
    Hash,
    ExternalLink,
    ChevronRight,
    RefreshCcw,
    Calendar,
    Check,
    Trash2
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

import NewBuild from "./NewBuild";
import EditBuild from "./EditBuild";

const AssemblyLog = ({ pageName }) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [showNewBuildModal, setShowNewBuildModal] = useState(false);
    const [editLogData, setEditLogData] = useState(null);

    const [isRetrying, setIsRetrying] = useState(null); // ID of log being retried

    const fetchLogs = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const res = await fetch(`/api/production/assembly-log?search=${searchQuery}`);
            const json = await res.json();
            if (json.success) {
                setLogs(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleDelete = async (logId) => {
        const isCompleted = logs.find(l => l._id === logId)?.status === "Completed";

        let reverse = false;
        if (isCompleted) {
            const choice = window.confirm("Do you want to REVERSE inventory transactions (Restore stock and remove output) while deleting? \n\nClick OK for 'Reverse & Delete' \nClick Cancel for 'Delete Log Only'");
            if (choice) {
                reverse = true;
            } else {
                if (!window.confirm("Are you sure you want to delete only the log record? Stock will NOT be restored.")) return;
            }
        } else {
            if (!window.confirm("Are you sure you want to delete this pending assembly log?")) return;
        }

        try {
            const res = await fetch(`/api/production/assembly-log?logId=${logId}&reverse=${reverse}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                fetchLogs();
                if (reverse) alert("Log deleted and stock successfully reversed.");
            } else {
                alert(json.error || "Failed to delete log");
            }
        } catch (error) {
            console.error("Delete error", error);
            alert("An error occurred while deleting the log.");
        }
    };

    // Initial fetch and manual refresh
    useEffect(() => {
        fetchLogs();
    }, [searchQuery]);

    // Real-time polling (every 10 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs(true); // Silent update
        }, 10000);

        return () => clearInterval(interval);
    }, [searchQuery]);

    const filteredLogs = filterType === "all"
        ? logs
        : logs.filter(log => log.targetType === filterType);

    return (
        <div className="w-full">
            {/* Modal */}
            {showNewBuildModal && (
                <NewBuild
                    onClose={(refresh) => {
                        setShowNewBuildModal(false);
                        if (refresh === true) fetchLogs();
                    }}
                />
            )}

            {editLogData && (
                <EditBuild
                    logData={editLogData}
                    onClose={(refresh) => {
                        setEditLogData(null);
                        if (refresh === true) fetchLogs();
                    }}
                />
            )}

            <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600 h-6 w-6" />
                        Assembly Production
                    </h2>
                    <Breadcrumb pageName={pageName} subPageName="Assembly Logs" />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                    <button
                        onClick={() => setShowNewBuildModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        New Assembly
                    </button>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Serial, BOM, Config..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="Finished_Product">Products</option>
                        <option value="Spare_Part">Spares</option>
                    </select>

                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        title="Refresh logs"
                    >
                        <RefreshCcw className={`h-4 w-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Configuration</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">BOM</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tag</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">BOM Cost</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? "9" : "8"} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm text-slate-400 font-medium">Fetching assembly history...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? "9" : "8"} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <ClipboardList className="h-10 w-10 text-slate-300" />
                                            <p className="text-sm font-semibold text-slate-500 uppercase">No assembly records found</p>
                                            <p className="text-xs text-slate-400">Complete a build to see logs here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col text-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.targetType === "Finished_Product"
                                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                }`}>
                                                {log.targetType.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 leading-tight">{log.configName}</span>
                                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{log.configId || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-slate-700">{log.bomNumber}</span>
                                                <span className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] border border-slate-200 font-mono">
                                                    v{log.bomVersion}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 bg-slate-50 w-fit px-2.5 py-1 rounded-lg border border-slate-100 group-hover:border-indigo-200 group-hover:bg-white transition-all font-mono">
                                                <Hash className="h-3 w-3 text-indigo-500 font-bold" />
                                                <span className="text-sm font-bold text-slate-800">{log.entityTag}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${log.status === "Completed"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    : (log.isReady || log.isStockAvailable)
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse"
                                                        : "bg-rose-100 text-rose-800 border border-rose-200"
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${log.status === "Completed" || log.isReady || log.isStockAvailable ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                                                    {log.isReady ? "Ready to Finalise" : (log.status || "Completed")}
                                                </span>
                                                {log.failureReason && (
                                                    <span
                                                        title={log.failureReason}
                                                        className={`text-[9px] font-medium mt-1.5 max-w-[200px] whitespace-normal line-clamp-2 leading-tight text-center cursor-help ${log.isStockAvailable ? "text-emerald-500" : "text-rose-500"}`}
                                                    >
                                                        {log.failureReason?.split("Missing:")[0].trim()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                ₹{log.totalCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-[10px] font-medium text-slate-400 font-mono tracking-tighter opacity-70">
                                                {log.batchId?.replace('BATCH-', '#')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {log.status === "Pending" ? (
                                                <div className="flex items-center justify-end gap-2 ml-auto">
                                                    <button
                                                        onClick={() => handleRetry(log._id)}
                                                        disabled={isRetrying === log._id}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-2 ${isRetrying === log._id
                                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                            : log.isReady
                                                                ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md active:scale-95 animate-bounce-subtle"
                                                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-95"
                                                            }`}
                                                    >
                                                        {isRetrying === log._id ? (
                                                            <RefreshCcw className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="h-3 w-3" />
                                                        )}
                                                        Reassemble
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(log._id)}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                        title="Delete Log"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3 ml-auto">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 opacity-60 text-[10px] font-bold">
                                                        <Check className="h-3 w-3" />
                                                        Finalized
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(log._id)}
                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                        title="Delete Log"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer info */}
                {!isLoading && filteredLogs.length > 0 && (
                    <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Displaying last {filteredLogs.length} assembly events
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase">
                            Real-time monitoring active
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssemblyLog;
