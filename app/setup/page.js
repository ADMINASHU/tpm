"use client";

import { Settings, Users, Key, Building } from "lucide-react";

export default function SetupPage() {
    return (
        <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Setup</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Configure enterprise parameters, roles, and global settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                        <Building className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">Factory Config</h3>
                        <p className="text-sm text-slate-500 mt-1">Manage locations and data silios.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                        <Users className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">Users & Roles</h3>
                        <p className="text-sm text-slate-500 mt-1">Configure employee permissions.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                        <Key className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">API Access</h3>
                        <p className="text-sm text-slate-500 mt-1">Webhook and integration keys.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
