"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
    const { status: sessionStatus } = useSession();
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

    if (!visible || sessionStatus !== "authenticated") return null;

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
            {/* Global Alert Overlay - Centered Modal */}
            {status === 'error' && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" />

                    {/* Modal Card */}
                    <div className="relative bg-white rounded-[2rem] shadow-[0_32px_96px_rgba(0,0,0,0.3)] overflow-hidden max-w-sm w-full animate-in zoom-in-95 fade-in duration-300 border border-slate-200">
                        {/* Red Header Section */}
                        <div className="bg-red-600 p-8 flex flex-col items-center text-center text-white relative">
                            {/* Decorative background ping */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full animate-ping duration-[3000ms]" />

                            <div className="bg-white/20 p-5 rounded-full mb-6 relative z-10">
                                <Database className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-3 relative z-10">Database Offline</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest relative z-10">Connection Lost</p>
                        </div>

                        {/* Body Section */}
                        <div className="p-8 bg-white flex flex-col gap-6">
                            <div className="text-center space-y-3">
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                    Slow network or server instability detected.
                                </p>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                    We are unable to sync with the central server. Please check your internet or switch to a faster network.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all active:scale-[0.97] shadow-xl shadow-red-200/50 flex items-center justify-center gap-3 group"
                                >
                                    Reconnect Now
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </button>

                                <div className="flex items-center justify-center gap-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="flex h-1.5 w-1.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                    </span>
                                    Background auto-retry active
                                </div>
                            </div>
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
