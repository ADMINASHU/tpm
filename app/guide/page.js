"use client";

import { useState } from "react";
import {
    BookOpen, LayoutDashboard, PackageSearch, Wrench, Truck,
    LineChart, Settings, FileBadge, QrCode, ChevronDown, ChevronRight,
    Info, AlertTriangle, CheckCircle2, Users
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const modules = [
    {
        icon: LayoutDashboard,
        color: "indigo",
        title: "Dashboard",
        path: "/dashboard",
        summary: "Birds-eye view of factory KPIs.",
        steps: [
            "View Transfer Price trend (rolling overhead + BOM cost over time).",
            "Monitor Accounts Payable liability buckets (0–30, 31–60, 61–90, 90+ days).",
            "Check critical stat cards: inventory value, pending QC, overhead/unit.",
        ],
        roles: ["Admin", "Manager", "Finance"],
    },
    {
        icon: FileBadge,
        color: "violet",
        title: "Procurement",
        path: "/procurement",
        summary: "'No Indent, No PO' — all purchases must start with an Indent.",
        steps: [
            "Go to Procurement → Create Indent. Fill Department, Item Name, Qty, and Tracking Type.",
            "Submit for Approval. A Manager/Admin must review pending indents.",
            "Once approved, click 'Approve & Gen PO'. The system auto-fetches agreed rates from the Supplier catalogue.",
            "PO is issued to the vendor. Finance logs the invoice upon GRN.",
        ],
        roles: ["Store", "Manager", "Admin"],
        warning: "Never issue a PO verbally. All purchases must have an approved Indent Number."
    },
    {
        icon: PackageSearch,
        color: "emerald",
        title: "Inventory",
        path: "/inventory",
        summary: "Two-track system: Hex Tags for high-value items, Bulk Qty for small components.",
        steps: [
            "Quick GRN: Enter vendor invoice details, item name, quantity, and purchase price. The system auto-generates Hex Tags for tagged items.",
            "Hex Tag Indexing: Scan the QR sticker on a received component to link it to its technical specifications.",
            "All GRNs are linked to a PO and auto-tagged with Factory ID for strict isolation.",
        ],
        roles: ["Store", "Admin"],
        tip: "Resistors, capacitors, and small consumables use Bulk Qty tracking. PCBs and transformers get individual Hex Tags."
    },
    {
        icon: Wrench,
        color: "amber",
        title: "Production",
        path: "/production",
        summary: "BOM-based assembly with auto Smart Serial Number generation.",
        steps: [
            "BOM Config: First define the Bill of Materials for each product (which components in what ratio).",
            "New Assembly Build: Select the BOM, then scan or enter each component's Hex Tag or Bulk barcode.",
            "The system calculates real-time transfer price = Base BOM Cost + Labor + Previous Month Rolling Overhead.",
            "Click 'Finalize Build' — system auto-generates Smart Serial (e.g., B26030001) and deducts stock.",
            "Genealogy Trace: Enter any Serial Number to see its complete component family tree.",
        ],
        roles: ["Operator", "Manager", "Admin"],
        tip: "Smart Serial format: [Factory Code][Year][Month][Sequence]. B=Bengaluru, P=Parwanoo."
    },
    {
        icon: Truck,
        color: "sky",
        title: "Logistics",
        path: "/logistics",
        summary: "Manage stock movement between internal stores.",
        steps: [
            "Go to Logistics → Internal Stock Transfer.",
            "Select Source Store (e.g., Raw Material Store) and Destination Store (e.g., Production Store).",
            "Scan Hex Tag or search Bulk item by name.",
            "Select Item Condition: New / Refurbished / Faulty. This is critical for quality tracking.",
            "Click Commit Transfer — stock levels update instantly in both stores.",
        ],
        roles: ["Store", "Logistics", "Admin"],
        warning: "Faulty items must be transferred to the Service Center store. Never mix faulty stock with production inventory."
    },
    {
        icon: LineChart,
        color: "rose",
        title: "Finance",
        path: "/finance",
        summary: "Accounts Payable aging, ledger entries, and monthly true-up.",
        steps: [
            "View the AP Aging Table — color-coded overdue buckets (0–30, 31–60, 61–90, 90+ days).",
            "Click 'Run Aging Report Email' to dispatch the daily aging summary to Admin inboxes.",
            "Ledger entries are auto-created on GRN, transfers, and production finalization.",
        ],
        roles: ["Finance", "Admin"],
        tip: "Automated daily aging emails fire at midnight via the Cron job at /api/cron/aging-report."
    },
    {
        icon: Settings,
        color: "slate",
        title: "Setup",
        path: "/setup",
        summary: "Admin-only area: configure factories, users, and system access.",
        steps: [
            "Factory Config: Edit factory name, location code, and store definitions.",
            "Users & Roles: Create users and assign them to a factory + role. Roles: Admin, Manager, Store, Operator, Finance, Logistics.",
            "API Access: View/rotate CRON_SECRET and integration API tokens.",
        ],
        roles: ["Admin"],
        warning: "Only Admins can access this section. All user access is siloed — users only see data for their assigned factory."
    },
];

const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

const iconColorMap = {
    indigo: "text-indigo-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    rose: "text-rose-600",
    slate: "text-slate-600",
};

function ModuleCard({ module }) {
    const [open, setOpen] = useState(false);
    const Icon = module.icon;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ring-1 ${colorMap[module.color]}`}>
                        <Icon className={`h-5 w-5 ${iconColorMap[module.color]}`} aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">{module.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{module.summary}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex gap-1">
                        {module.roles.map((r) => (
                            <span key={r} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {r}
                            </span>
                        ))}
                    </div>
                    {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-slate-100 px-6 py-5 space-y-4">
                    <ol className="space-y-3">
                        {module.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-700">
                                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-1 ${colorMap[module.color]}`}>
                                    {i + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>

                    {module.tip && (
                        <div className="flex gap-2.5 items-start bg-blue-50 rounded-xl p-4 text-sm text-blue-800 ring-1 ring-blue-100">
                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{module.tip}</span>
                        </div>
                    )}

                    {module.warning && (
                        <div className="flex gap-2.5 items-start bg-amber-50 rounded-xl p-4 text-sm text-amber-800 ring-1 ring-amber-100">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{module.warning}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function GuidePage() {
    return (
        <div className="flex-1 p-8 bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto space-y-8">

                <Breadcrumb pageName="System" subPageName="Guide" />

                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="h-7 w-7 text-indigo-200" aria-hidden="true" />
                        <h1 className="text-2xl font-bold">User Guide</h1>
                    </div>
                    <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">
                        Welcome to the <strong className="text-white">Techser Plant Management App</strong>. This guide explains
                        each module and the step-by-step workflow. Expand any module below to see instructions.
                    </p>

                    {/* Key rules */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { icon: CheckCircle2, text: "All purchases need an approved Indent first" },
                            { icon: QrCode, text: "High-value items tracked by 4-digit Hex Tag" },
                            { icon: Users, text: "Data strictly isolated per factory — no cross-access" },
                        ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-center gap-2 bg-indigo-500/30 rounded-xl px-4 py-3 text-sm text-white">
                                <Icon className="h-4 w-4 text-indigo-200 shrink-0" aria-hidden="true" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Role Reference */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Role Access Reference</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { role: "Admin", desc: "Full access to all modules & setup" },
                            { role: "Manager", desc: "Approvals, production, reports" },
                            { role: "Store", desc: "GRN, inventory, transfers" },
                            { role: "Operator", desc: "Production builds only" },
                            { role: "Finance", desc: "Ledger, AP aging, finance" },
                            { role: "Logistics", desc: "Stock transfers & dispatch" },
                        ].map(({ role, desc }) => (
                            <div key={role} className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100">
                                <p className="text-sm font-bold text-slate-900">{role}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Guides */}
                <div>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Module Guides</h2>
                    <div className="space-y-3">
                        {modules.map((m) => (
                            <ModuleCard key={m.title} module={m} />
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 pb-4">
                    Techser Plant Management App · For support contact your factory Admin
                </p>
            </div>
        </div>
    );
}
