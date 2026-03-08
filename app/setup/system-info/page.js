"use client";

import { useEffect, useState } from "react";
import { version } from "@/package.json";
import { Monitor, Cpu, Database, Globe, Zap, HardDrive, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";

export default function SystemInfo() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSystem = async () => {
        setLoading(true);
        const data = {
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
                online: navigator.onLine ? "Online" : "Offline",
            },
            storage: {
                localStorage: "Checking...",
                sessionStorage: "Checking...",
                indexedDB: "Checking...",
            },
            screen: {
                resolution: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                colorDepth: `${window.screen.colorDepth}-bit`,
                pixelRatio: window.devicePixelRatio,
            },
            hardware: {
                cpu: navigator.hardwareConcurrency || "N/A",
                memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "N/A",
            },
            network: {
                type: navigator.connection?.effectiveType?.toUpperCase() || "N/A",
                downlink: navigator.connection?.downlink ? `${navigator.connection.downlink} Mbps` : "N/A",
                rtt: navigator.connection?.rtt ? `${navigator.connection.rtt} ms` : "N/A",
            }
        };

        // Detailed Storage Check
        try {
            localStorage.setItem("_test", "1");
            localStorage.removeItem("_test");
            data.storage.localStorage = "Functional";
        } catch { data.storage.localStorage = "Blocked"; }

        try {
            sessionStorage.setItem("_test", "1");
            sessionStorage.removeItem("_test");
            data.storage.sessionStorage = "Functional";
        } catch { data.storage.sessionStorage = "Blocked"; }

        if (window.indexedDB) data.storage.indexedDB = "Functional";
        else data.storage.indexedDB = "Not Supported";

        setInfo(data);
        setTimeout(() => setLoading(false), 500);
    };

    useEffect(() => {
        checkSystem();
    }, []);

    const InfoCard = ({ title, icon: Icon, children, color = "blue" }) => (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-2xl bg-${color}-50 text-${color}-600`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-wider text-[11px] text-slate-500">{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const InfoItem = ({ label, value, status }) => (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">{value}</span>
                {status === "pass" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                {status === "fail" && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Monitor className="w-8 h-8 text-blue-600" />
                        System Diagnostics
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Techser Plant Management Environment</p>
                </div>
                <button
                    onClick={checkSystem}
                    disabled={loading}
                    className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard title="Browser & Env" icon={Globe} color="blue">
                    <InfoItem label="User Agent" value={info?.browser.userAgent.split(' ').slice(-2).join(' ')} />
                    <InfoItem label="Language" value={info?.browser.language.toUpperCase()} />
                    <InfoItem label="Cookies" value={info?.browser.cookies} status={info?.browser.cookies === "Enabled" ? "pass" : "fail"} />
                    <InfoItem label="Network" value={info?.browser.online} status={info?.browser.online === "Online" ? "pass" : "fail"} />
                </InfoCard>

                <InfoCard title="Storage Engines" icon={HardDrive} color="emerald">
                    <InfoItem label="Local Storage" value={info?.storage.localStorage} status={info?.storage.localStorage === "Functional" ? "pass" : "fail"} />
                    <InfoItem label="Session Storage" value={info?.storage.sessionStorage} status={info?.storage.sessionStorage === "Functional" ? "pass" : "fail"} />
                    <InfoItem label="IndexedDB" value={info?.storage.indexedDB} status={info?.storage.indexedDB === "Functional" ? "pass" : "fail"} />
                </InfoCard>

                <InfoCard title="Network Stack" icon={Zap} color="amber">
                    <InfoItem label="Effective Type" value={info?.network.type} />
                    <InfoItem label="Speed (Downlink)" value={info?.network.downlink} />
                    <InfoItem label="Latency (RTT)" value={info?.network.rtt} />
                </InfoCard>

                <InfoCard title="Display & Viewport" icon={Monitor} color="purple">
                    <InfoItem label="Resolution" value={info?.screen.resolution} />
                    <InfoItem label="Viewport" value={info?.screen.viewport} status={parseInt(info?.screen.viewport) >= 1024 ? "pass" : "fail"} />
                    <InfoItem label="Color Depth" value={info?.screen.colorDepth} />
                    <InfoItem label="Pixel Ratio" value={info?.screen.pixelRatio} />
                </InfoCard>

                <InfoCard title="Hardware Profile" icon={Cpu} color="slate">
                    <InfoItem label="Logical CPU Cores" value={info?.hardware.cpu} />
                    <InfoItem label="Est. System Memory" value={info?.hardware.memory} />
                </InfoCard>

                <InfoCard title="App Context" icon={Database} color="rose">
                    <InfoItem label="Version" value={version} />
                    <InfoItem label="Framework" value="Next.js 16.1.6" />
                    <InfoItem label="Render Mode" value="Hybrid/SSR" />
                </InfoCard>
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h4 className="text-lg font-black uppercase tracking-tight mb-2">Technical Report</h4>
                        <p className="text-xs font-medium text-slate-400 max-w-xl">
                            This page provides real-time diagnostics of your browser environment to ensure optimal performance of the Techser ERP system. If any red indicators appear, please update or configure your browser.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <code className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold text-blue-300">
                            ID: {typeof window !== 'undefined' ? btoa(navigator.userAgent).slice(0, 10).toUpperCase() : 'N/A'}
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}
