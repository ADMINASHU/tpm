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

    // Read preference + listen for live changes from Settings page
    useEffect(() => {
        setVisible(loadPref("showDBStatus", true));
        const handler = () => setVisible(loadPref("showDBStatus", true));
        window.addEventListener("tpm_prefs_changed", handler);
        return () => window.removeEventListener("tpm_prefs_changed", handler);
    }, []);

    useEffect(() => {
        if (!visible) return;
        async function check() {
            try {
                const res = await fetch("/api/health", { cache: "no-store" });
                const data = await res.json();
                setStatus(data.status);
                setNode(data.node);
            } catch {
                setStatus("error");
                setNode("—");
            }
        }
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [visible]);

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
        <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
                Database: {label}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center space-x-1">
                <Server className="w-4 h-4 text-slate-400" />
                <span>MongoDB: {node}</span>
            </span>
        </div>
    );
}
