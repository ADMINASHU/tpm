"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { version } from "@/package.json";
import { Monitor, AlertTriangle, CheckCircle, XCircle, Layout, Database } from "lucide-react";

export default function CompatibilityCheck() {
    const { status: sessionStatus } = useSession();
    const [issues, setIssues] = useState([]);
    const [ignored, setIgnored] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (sessionStatus !== "authenticated") return;
        setMounted(true);
        checkCompatibility();

        // Listen for window resize
        const handleResize = () => checkCompatibility();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const checkCompatibility = () => {
        const foundIssues = [];

        // 1. Storage Check
        try {
            localStorage.setItem("__test__", "1");
            localStorage.removeItem("__test__");
        } catch (e) {
            foundIssues.push({
                id: "storage",
                title: "Storage Disabled",
                desc: "LocalStorage is blocked. This app requires it for sessions and preferences.",
                icon: <Database className="w-5 h-5" />
            });
        }

        // 2. Cookie Check
        if (!navigator.cookieEnabled) {
            foundIssues.push({
                id: "cookies",
                title: "Cookies Disabled",
                desc: "Cookies are disabled. You won't be able to stay logged in.",
                icon: <Layout className="w-5 h-5" />
            });
        }

        // 3. Screen Size Check (Complex Dashboard needs width)
        if (window.innerWidth < 1024) {
            foundIssues.push({
                id: "screen",
                title: "Small Screen View",
                desc: "The dashboard is optimized for Desktop (min 1024px). UI may look distorted.",
                icon: <Monitor className="w-5 h-5" />
            });
        }

        setIssues(foundIssues);
    };

    if (!mounted || issues.length === 0 || ignored || sessionStatus !== "authenticated") return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-500" />

            {/* Modal Card */}
            <div className="relative bg-white rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden max-w-md w-full animate-in zoom-in-95 fade-in duration-500 border border-slate-200">
                {/* Amber/Warning Header */}
                <div className="bg-amber-500 p-10 flex flex-col items-center text-center text-white relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full animate-pulse" />

                    <div className="bg-white/20 p-6 rounded-full mb-6 relative z-10 shadow-inner">
                        <AlertTriangle className="w-14 h-14 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2 relative z-10">System Alert</h2>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.3em] relative z-10">Compatibility Issue Detected</p>
                </div>

                {/* Issues List */}
                <div className="p-10 bg-white">
                    <div className="space-y-6 mb-10">
                        {issues.map(issue => (
                            <div key={issue.id} className="flex gap-4 p-4 rounded-3xl bg-amber-50 border border-amber-100 items-start">
                                <div className="bg-amber-500 text-white p-2 rounded-2xl shadow-md">
                                    {issue.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">{issue.title}</h4>
                                    <p className="text-xs font-medium text-amber-700/80 leading-relaxed mt-1">
                                        {issue.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 transition-all active:scale-[0.97] shadow-2xl flex items-center justify-center gap-3"
                        >
                            Re-Check System
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </button>

                        <button
                            onClick={() => setIgnored(true)}
                            className="w-full bg-white text-slate-400 py-4 rounded-[1.5rem] font-bold uppercase tracking-[0.1em] text-[10px] hover:text-slate-600 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-slate-100"
                        >
                            Ignore & Continue Anyway
                            <XCircle className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            Techser Plant Management • v{version}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
