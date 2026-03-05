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

export default function GuidePage() {
    return (
        <div className="flex-1 p-8 bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">User Guide</h1>
                        <Breadcrumb pageName="System" subPageName="User Guide" />
                        <p className="text-slate-500 mt-2 text-sm font-medium max-w-2xl">
                            Operational handbook for the Techser Plant Management System.
                            Follow these workflows to ensure data integrity and manufacturing precision.
                        </p>
                    </div>
                </div>

                {/* Core Rules Section */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/60">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                            Core Operating Rules
                        </h2>
                    </div>
                    <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "No Indent, No PO",
                                desc: "All procurement must start with an approved Indent. Rate locking happens during PO generation.",
                                icon: FileBadge,
                                color: "violet"
                            },
                            {
                                title: "Hex-Tag Strategy",
                                desc: "High-value components (PCBs, Transformers) get individual Hex Tags. Small items use Bulk Qty.",
                                icon: QrCode,
                                color: "emerald"
                            },
                            {
                                title: "Factory Isolation",
                                desc: "Users only see data for their assigned factory. No cross-factory stock or user visibility.",
                                icon: Users,
                                color: "amber"
                            }
                        ].map((rule, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`p-2.5 rounded-xl bg-${rule.color}-50 ring-1 ring-${rule.color}-100 shrink-0 h-fit`}>
                                    <rule.icon className={`h-5 w-5 text-${rule.color}-600`} aria-hidden="true" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{rule.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rule.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Workflows */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Module Workflows</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {modules.map((m) => (
                            <ModuleCard key={m.title} module={m} />
                        ))}
                    </div>
                </div>

                {/* Role Reference */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/60">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role Access Matrix</h2>
                    </div>
                    <div className="px-6 py-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {[
                            { role: "Admin", desc: "Full Master Access" },
                            { role: "Manager", desc: "Approvals & Reports" },
                            { role: "Store", desc: "GRN & Inventory" },
                            { role: "Operator", desc: "Assembly Builds" },
                            { role: "Finance", desc: "Ledger & Aging" },
                            { role: "Logistics", desc: "Transfers & Dispatch" },
                        ].map(({ role, desc }) => (
                            <div key={role} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100 transition-transform hover:-translate-y-0.5">
                                <p className="text-xs font-bold text-slate-900">{role}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-[11px] font-medium text-slate-400 pb-4">
                    Proprietary Software of Techser Plant Management &bull; Internal Documentation v2.0
                </p>
            </div>
        </div>
    );
}

function ModuleCard({ module }) {
    const [open, setOpen] = useState(false);
    const Icon = module.icon;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-indigo-100">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl bg-${module.color}-50 ring-1 ring-${module.color}-100`}>
                        <Icon className={`h-5 w-5 text-${module.color}-600`} aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">{module.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{module.summary}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden md:flex gap-1.5">
                        {module.roles.map((r) => (
                            <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                {r}
                            </span>
                        ))}
                    </div>
                    <div className={`p-1 rounded-lg transition-colors ${open ? 'bg-indigo-50' : ''}`}>
                        {open ? <ChevronDown className="h-4 w-4 text-indigo-600" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </div>
                </div>
            </button>

            {open && (
                <div className="border-t border-slate-50 px-6 py-6 bg-slate-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Standard Workflow</p>
                            <ol className="space-y-4">
                                {module.steps.map((step, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <span className={`shrink-0 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors`}>
                                            0{i + 1}
                                        </span>
                                        <span className="text-sm text-slate-600 leading-relaxed pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="space-y-4">
                            {module.tip && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Best Practice</p>
                                    </div>
                                    <p className="text-sm text-emerald-700 leading-relaxed italic border-l-2 border-emerald-200 pl-3">{module.tip}</p>
                                </div>
                            )}

                            {module.warning && (
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                                        <p className="text-xs font-bold text-rose-900 uppercase tracking-wide">Critical Warning</p>
                                    </div>
                                    <p className="text-sm text-rose-700 leading-relaxed border-l-2 border-rose-200 pl-3">{module.warning}</p>
                                </div>
                            )}

                            {!module.tip && !module.warning && (
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="h-4 w-4 text-indigo-600" />
                                        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">System Note</p>
                                    </div>
                                    <p className="text-sm text-indigo-700 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                                        Data captured here impacts the global dashboard and real-time inventory valuations.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
