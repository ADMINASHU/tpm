"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, ChevronDown, ChevronRight, Sparkles, Wrench, Bug, BookOpen } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import releases from "@/lib/releases";
import { formatDateIST } from "@/lib/dateUtils";

function ReleaseSection({ label, icon: Icon, color, items }) {
    const [open, setOpen] = useState(false);

    const colorCls = {
        emerald: "text-emerald-600 bg-emerald-50 ring-emerald-100",
        rose: "text-rose-600 bg-rose-50 ring-rose-100",
        amber: "text-amber-600 bg-amber-50 ring-amber-100",
    }[color];

    const dotCls = {
        emerald: "bg-emerald-400",
        rose: "bg-rose-400",
        amber: "bg-amber-400",
    }[color];

    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ring-1 ${colorCls}`}>
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 bg-white ring-1 ring-slate-200 px-2.5 py-0.5 rounded-full">
                        {items.length}
                    </span>
                    {open
                        ? <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />}
                </div>
            </button>

            {open && items.length > 0 && (
                <ul className="divide-y divide-slate-50 bg-white">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 px-5 py-3 text-sm text-slate-600">
                            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
                            {item}
                        </li>
                    ))}
                </ul>
            )}

            {open && items.length === 0 && (
                <p className="px-5 py-3 text-sm text-slate-400 bg-white">None for this release.</p>
            )}
        </div>
    );
}

function ReleaseCard({ release }) {
    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${release.latest ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-100"}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900">v{release.version}</h2>
                    {release.latest && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100 ring-1 ring-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            <Sparkles className="w-3 h-3" aria-hidden="true" /> Latest
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    {formatDateIST(release.date)}
                </div>
            </div>

            {/* Sections */}
            <div className="p-5 space-y-2.5">
                <ReleaseSection label="Improvements" icon={Sparkles} color="emerald" items={release.improvements} />
                <ReleaseSection label="Fixes" icon={Bug} color="rose" items={release.fixes} />
                <ReleaseSection label="Patches" icon={Wrench} color="amber" items={release.patches} />
            </div>
        </div>
    );
}

export default function ReleasesPage() {
    const sortedReleases = useMemo(() => [...releases].reverse(), []);

    return (
        <div className="flex-1 p-8 bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto space-y-8">


                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Release Notes
                        </h2>

                        <Breadcrumb pageName="System" subPageName="Releases" />
                        <p className="text-slate-500 text-sm">History of improvements, fixes, and updates.</p>
                    </div>
                    <Link
                        href="/guide"
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl ring-1 ring-indigo-100 transition-colors"
                    >
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        View User Guide
                    </Link>
                </div>

                {/* Title */}


                {/* Release cards — latest first */}
                <div className="space-y-5">
                    {sortedReleases.map((r) => (
                        <ReleaseCard key={r.version} release={r} />
                    ))}
                </div>
            </div>
        </div>
    );
}
