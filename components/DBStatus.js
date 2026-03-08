"use client";

import { useEffect, useState } from "react";
import { Database, Server } from "lucide-react";

function loadPref(key, fallback = true) {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem("tpm_preferences");
        if (!raw) return fallback;
        const prefs = JSON.parse(raw);
        return key in prefs ? prefs[key] : fallback;
    } catch {
        return fallback;
    }
}

export default function DBStatus() {
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState("checking");
    const [node, setNode] = useState("...");
    const [connectionInfo, setConnectionInfo] = useState({
        downlink: null,
        effectiveType: null,
        rtt: null,
        isSlow: false
    });

    // Read preference + listen for live changes from Settings page
    useEffect(() => {
        setVisible(loadPref("showDBStatus", true));
        const handler = () => setVisible(loadPref("showDBStatus", true));
        window.addEventListener("tpm_prefs_changed", handler);
        return () => window.removeEventListener("tpm_prefs_changed", handler);
    }, []);

    // Network Information API monitoring
    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateConnection = () => {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                const isSlow = conn.downlink < 1 || ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
                setConnectionInfo({
                    downlink: conn.downlink,
                    effectiveType: conn.effectiveType,
                    rtt: conn.rtt,
                    isSlow
                });
            }
        };

        updateConnection();
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            conn.addEventListener("change", updateConnection);
            return () => conn.removeEventListener("change", updateConnection);
        }
    }, []);

    useEffect(() => {
        if (!visible) return;

        async function check() {
            if (!navigator.onLine) {
                setStatus("error");
                setNode("Offline");
                return;
            }

            try {
                const res = await fetch("/api/health", { cache: "no-store", signal: AbortSignal.timeout?.(4000) });
                const data = await res.json();
                setStatus(data.status);
                setNode(data.node);
            } catch {
                setStatus("error");
                setNode("Disconnected");
            }
        }

        const handleOnline = () => {
            setStatus("checking");
            check();
        };
        const handleOffline = () => {
            setStatus("error");
            setNode("Offline");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial check
        check();

        // Polling: 1 minute, ONLY if network is slow
        let interval;
        if (connectionInfo.isSlow) {
            interval = setInterval(check, 60000);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (interval) clearInterval(interval);
        };
    }, [visible, connectionInfo.isSlow]);

    if (!visible) return null;

    const dot = {
        connected: "bg-emerald-400",
        checking: "bg-amber-400 animate-pulse",
        error: "bg-red-500",
        no_uri: "bg-slate-300",
    }[status] || "bg-slate-300";

    const label = {
        connected: "Connected",
        checking: "Checking...",
        error: "Disconnected",
        no_uri: "No URI",
    }[status] || "Unknown";

    return (
        <div className="flex items-center space-x-3">
            {/* Global Alert Overlay */}
            {status === 'error' && (
                <div className="fixed inset-x-0 top-0 z-[9999] bg-red-600 text-white py-3 px-6 shadow-2xl animate-in slide-in-from-top duration-500">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full animate-pulse">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider">Database Connection Lost</h4>
                                <p className="text-[11px] font-medium opacity-90">Slow network or server instability detected. Please check your internet or switch to a faster connection.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                            >
                                Reconnect Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DB Link */}
            <div className="flex items-center space-x-2 text-nowrap">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
                    <span className="text-nowrap">Database: {label}</span>
                </span>
            </div>

            <span className="text-slate-300">|</span>

            {/* Cluster Node */}
            <div className="flex items-center space-x-1">
                <Server className="w-4 h-4 text-slate-400" />
                <span className="text-nowrap italic">Node: {node}</span>
            </div>

            {/* Network Alert (Only shown if slow) */}
            {connectionInfo.isSlow && (
                <>
                    <span className="text-slate-300">|</span>
                    <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-tight ${status !== 'connected'
                        ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}>
                        <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                        </span>
                        <span>
                            {status !== 'connected'
                                ? "Database Disconnected: Slow network, please change to fast connection!"
                                : `Slow Network: ${connectionInfo.effectiveType?.toUpperCase()}. Connect to fast network.`}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
