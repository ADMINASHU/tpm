"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    SlidersHorizontal, Database, Monitor, Bell,
    Moon, Globe, ShieldCheck, ToggleLeft, ToggleRight
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

// ── Reusable Toggle Row ──────────────────────────────────────
function ToggleRow({ label, description, value, onChange, icon: Icon, color = "indigo" }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-50 ring-1 ring-${color}-100`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!value)}
                className="shrink-0 ml-4"
                aria-label={`Toggle ${label}`}
            >
                {value
                    ? <ToggleRight className={`w-8 h-8 text-${color}-600 transition-all`} aria-hidden="true" />
                    : <ToggleLeft className="w-8 h-8 text-slate-300 transition-all" aria-hidden="true" />
                }
            </button>
        </div>
    );
}

// ── Settings Section Card ────────────────────────────────────
function Section({ title, children }) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/60">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
            </div>
            <div className="px-6">{children}</div>
        </div>
    );
}

// ── Default Preferences ──────────────────────────────────────
const DEFAULTS = {
    showDBStatus: true,
    showFactoryInfo: true,
    compactFooter: false,
    enableSounds: false,
};

const STORAGE_KEY = "tpm_preferences";

export function loadPrefs() {
    if (typeof window === "undefined") return DEFAULTS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
        return DEFAULTS;
    }
}

function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event("tpm_prefs_changed"));
}

// ── Main Page ────────────────────────────────────────────────
export default function SettingsPage() {
    const [prefs, setPrefs] = useState(DEFAULTS);
    const [saved, setSaved] = useState(false);
    const savedTimerRef = useRef(null);

    useEffect(() => {
        setPrefs(loadPrefs());
        return () => {
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        };
    }, []);

    const update = useCallback((key) => (val) => {
        setPrefs(prev => {
            const next = { ...prev, [key]: val };
            savePrefs(next);
            return next;
        });
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    }, []);

    return (
        <div className="flex-1 p-8 bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <SlidersHorizontal className="w-7 h-7 text-indigo-600" aria-hidden="true" />
                            System Preferences
                        </h1>
                        <Breadcrumb pageName="System" subPageName="Preferences" />
                        <p className="text-slate-500 mt-1.5 text-sm">
                            Customize how the application looks and behaves. Preferences are saved locally per device.
                        </p>
                    </div>
                    {saved && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full animate-pulse">
                            ✓ Saved
                        </span>
                    )}
                </div>

                {/* Footer Display */}
                <Section title="Footer & Status Bar">
                    <ToggleRow
                        label="Show Database Status"
                        description="Displays live MongoDB connection status in the footer."
                        icon={Database}
                        color="emerald"
                        value={prefs.showDBStatus}
                        onChange={update("showDBStatus")}
                    />
                    <ToggleRow
                        label="Show Factory Info"
                        description="Shows the active factory and store name in the footer."
                        icon={Globe}
                        color="indigo"
                        value={prefs.showFactoryInfo}
                        onChange={update("showFactoryInfo")}
                    />
                    <ToggleRow
                        label="Compact Footer"
                        description="Reduces footer height for more screen real estate."
                        icon={Monitor}
                        color="slate"
                        value={prefs.compactFooter}
                        onChange={update("compactFooter")}
                    />
                </Section>

                {/* UX */}
                <Section title="User Experience">
                    <ToggleRow
                        label="Enable UI Sounds"
                        description="Play subtle sounds on form submit, alerts, and confirmations."
                        icon={Bell}
                        color="amber"
                        value={prefs.enableSounds}
                        onChange={update("enableSounds")}
                    />
                </Section>

                {/* Security (read-only info) */}
                <Section title="Security">
                    <div className="py-4 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-rose-50 ring-1 ring-rose-100">
                            <ShieldCheck className="w-4 h-4 text-rose-600" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Session Protection</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                All routes protected via NextAuth JWT. Session expires after inactivity. Managed by Admin in Setup → Users & Roles.
                            </p>
                        </div>
                    </div>
                </Section>

                <p className="text-center text-xs text-slate-400">
                    Preferences are stored in your browser&apos;s local storage and apply to this device only.
                </p>
            </div>
        </div>
    );
}
