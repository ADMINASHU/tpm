"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Settings, Users, Info, Building, Plus, Server, Activity, GitBranch, Terminal } from "lucide-react";
import { version } from "@/package.json";

const tabs = [
    { id: "factory", label: "Factory Config", icon: Building },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "system", label: "System Info", icon: Info },
];

// ── Factory Config ──────────────────────────────────────────
const EMPTY_FACTORY = { name: "", code: "", location: "", stores: "" };

function FactoryModal({ mode, factory, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === "edit"
            ? { name: factory.name, code: factory.code, location: factory.location, stores: (factory.stores || []).join(", ") }
            : { ...EMPTY_FACTORY }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const field = (label, key, placeholder = "") => (
        <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <input
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
        </label>
    );

    const submit = async () => {
        setLoading(true); setError("");
        try {
            const url = mode === "edit" ? `/api/factories/${factory._id}` : "/api/factories";
            const method = mode === "edit" ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            onSaved();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                        {mode === "edit" ? `Edit — ${factory.name}` : "Add New Factory"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {field("Plant Name", "name", "e.g. Bengaluru Plant")}
                    <div className="grid grid-cols-2 gap-4">
                        {field("Code (2-5 chars)", "code", "e.g. BLR")}
                        {field("City, State", "location", "e.g. Bengaluru, Karnataka")}
                    </div>
                    <label className="block space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Logical Stores</span>
                        <span className="text-xs text-slate-400 ml-2">(comma-separated)</span>
                        <input
                            type="text"
                            value={form.stores}
                            placeholder="e.g. Raw Material, Production, Finished Goods"
                            onChange={(e) => setForm({ ...form, stores: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                        />
                    </label>
                    {error && <p className="text-xs font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                    <button
                        onClick={submit} disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Factory"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FactoryConfig() {
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [expanded, setExpanded] = useState(null);

    const fetchFactories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/factories");
            const data = await res.json();
            setFactories(data.factories || []);
        } catch {
            setFactories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFactories(); }, []);

    const deleteFactory = async (id) => {
        if (!confirm("Delete this factory? All associated data may be affected.")) return;
        await fetch(`/api/factories/${id}`, { method: "DELETE" });
        fetchFactories();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Registered Factories</h2>
                <button
                    onClick={() => setModal({ mode: "add" })}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Factory
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-400 animate-pulse py-4">Loading factories…</p>
            ) : factories.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No factories found. Add one to get started.</p>
            ) : (
                <div className="space-y-3">
                    {factories.map((f) => (
                        <div key={f._id} className="border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
                            <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                                        {f.code}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                                        <p className="text-xs text-slate-500">{f.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setExpanded(expanded === f._id ? null : f._id)}
                                        className="text-xs font-semibold text-slate-500 bg-white ring-1 ring-slate-200 px-3 py-1 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:ring-indigo-200 transition"
                                    >
                                        {f.stores?.length || 0} Stores {expanded === f._id ? "▲" : "▼"}
                                    </button>
                                    <button onClick={() => setModal({ mode: "edit", factory: f })} className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteFactory(f._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                                </div>
                            </div>
                            {expanded === f._id && (
                                <div className="px-5 py-3 bg-white border-t border-slate-100">
                                    {f.stores?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {f.stores.map((s) => (
                                                <span key={s} className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">{s}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400">No logical stores defined.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <FactoryModal
                    mode={modal.mode}
                    factory={modal.factory}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchFactories(); }}
                />
            )}
        </div>
    );
}


// ── Users & Roles ───────────────────────────────────────────
const ROLES = ["Admin", "Manager", "Store", "Operator", "Finance", "Logistics"];
const FACTORIES = [
    { _id: "blr", code: "BLR", name: "Bengaluru Plant" },
    { _id: "pwn", code: "PWN", name: "Parwanoo Plant" },
];
const roleColors = {
    Admin: "bg-indigo-100 text-indigo-700",
    Manager: "bg-violet-100 text-violet-700",
    Store: "bg-emerald-100 text-emerald-700",
    Operator: "bg-amber-100 text-amber-700",
    Finance: "bg-rose-100 text-rose-700",
    Logistics: "bg-sky-100 text-sky-700",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "Operator", factoryId: "blr" };

function UserModal({ mode, user, onClose, onSaved }) {
    const [form, setForm] = useState(
        mode === "edit"
            ? { name: user.name, email: user.email, password: "", role: user.role, factoryId: user.factoryId?._id || user.factoryId || "blr" }
            : { ...EMPTY_FORM }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const field = (label, key, type = "text", placeholder = "") => (
        <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />
        </label>
    );

    const submit = async () => {
        setLoading(true); setError("");
        try {
            const url = mode === "edit" ? `/api/users/${user._id}` : "/api/users";
            const method = mode === "edit" ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            onSaved();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                        {mode === "edit" ? `Edit — ${user.name}` : "Add New User"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {field("Full Name", "name", "text", "e.g. Ravi Kumar")}
                    {field("Email", "email", "email", "e.g. ravi@techser.com")}
                    {field(mode === "edit" ? "New Password (leave blank to keep)" : "Password", "password", "password", "••••••••")}

                    <label className="block space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role</span>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                    </label>

                    <label className="block space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Factory</span>
                        <select
                            value={form.factoryId}
                            onChange={(e) => setForm({ ...form, factoryId: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            {FACTORIES.map((f) => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
                        </select>
                    </label>

                    {error && <p className="text-xs font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                    <button
                        onClick={submit} disabled={loading}
                        className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Create User"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UsersRoles() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | { mode: "add" } | { mode: "edit", user }

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data.users || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const deleteUser = async (id) => {
        if (!confirm("Delete this user?")) return;
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        fetchUsers();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">System Users</h2>
                <button
                    onClick={() => setModal({ mode: "add" })}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-400 animate-pulse py-4">Loading users…</p>
            ) : users.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No users found.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="pb-3">Name</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Role</th>
                            <th className="pb-3">Factory</th>
                            <th className="pb-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 font-semibold text-slate-900">{u.name}</td>
                                <td className="py-3.5 text-slate-500">{u.email}</td>
                                <td className="py-3.5">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>{u.role}</span>
                                </td>
                                <td className="py-3.5 text-slate-500">{u.factoryId?.code || u.factoryId || "—"}</td>
                                <td className="py-3.5 text-right space-x-3">
                                    <button onClick={() => setModal({ mode: "edit", user: u })} className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                                    <button onClick={() => deleteUser(u._id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Available Roles</h3>
                <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                        <span key={r} className={`text-xs font-bold px-3 py-1.5 rounded-full ${roleColors[r]}`}>{r}</span>
                    ))}
                </div>
            </div>

            {modal && (
                <UserModal
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSaved={() => { setModal(null); fetchUsers(); }}
                />
            )}
        </div>
    );
}

// ── System Info ──────────────────────────────────────────────
function SystemInfo() {
    const env = process.env.NODE_ENV || "development";
    const envColor = env === "production" ? "emerald" : "amber";

    const row = (label, value, mono = false) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">System Info</h2>
                <p className="text-sm text-slate-500 mt-1">Read-only runtime and environment details.</p>
            </div>

            {/* App Info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-1">
                {row("App Version", `v${version}`)}
                {row("Environment", (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-${envColor}-100 text-${envColor}-700 uppercase`}>
                        {env}
                    </span>
                ))}
                {row("Framework", "Next.js 16 (App Router)")}
                {row("Database", "MongoDB via Mongoose")}
                {row("Auth", "NextAuth.js v4 — JWT Strategy")}
            </div>

            {/* API Endpoints */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" /> Internal API Endpoints
                </h3>
                <div className="space-y-2">
                    {[
                        { method: "GET", path: "/api/health", desc: "Live MongoDB ping — used by footer status" },
                        { method: "GET", path: "/api/cron/aging-report", desc: "AP aging scan — requires Bearer CRON_SECRET header" },
                        { method: "POST", path: "/api/auth/[...nextauth]", desc: "NextAuth credentials — managed by next-auth" },
                    ].map(({ method, path, desc }) => (
                        <div key={path} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
                            <span className={`shrink-0 text-xs font-black px-2 py-0.5 rounded-md ${method === "GET" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                                }`}>{method}</span>
                            <div>
                                <code className="text-xs font-mono text-indigo-600">{path}</code>
                                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secrets note */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Server className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                    <span className="font-bold">Secrets are managed in <code>.env.local</code></span> —
                    MONGODB_URI, NEXTAUTH_SECRET, CRON_SECRET. Never manage secrets through a UI.
                </p>
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────
export default function SetupPage() {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl || "factory");

    // Keep in sync when navigating via dropdown links
    useEffect(() => {
        if (tabFromUrl && ["factory", "users", "system"].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const pageHeaders = {
        factory: { title: "Factory Configuration", subtitle: "Manage plant locations and their logical stores.", icon: Building },
        users: { title: "User Management", subtitle: "Configure employee accounts, roles and permissions.", icon: Users },
        system: { title: "System Information", subtitle: "Read-only runtime environment and API endpoint reference.", icon: Info },
    };
    const { title, subtitle, icon: PageIcon } = pageHeaders[activeTab] || pageHeaders.factory;
    const panels = { factory: <FactoryConfig />, users: <UsersRoles />, system: <SystemInfo /> };

    return (
        <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <PageIcon className="w-7 h-7 text-indigo-600" /> {title}
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
                </div>

                {/* Tabs — hidden on desktop (use navbar dropdown), visible on mobile */}
                <div className="md:hidden flex space-x-1 p-1 bg-slate-100 rounded-xl w-fit">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === id
                                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
                    {panels[activeTab]}
                </div>
            </div>
        </div>
    );
}

