"use client";

import { LayoutDashboard, ChevronRight } from "lucide-react";

/**
 * Reusable Breadcrumb component for standardized page headers.
 * 
 * @param {string} pageName - The name of the main module (e.g., "Production").
 * @param {string} subPageName - The name of the current sub-section or tab (e.g., "Component Config").
 * @param {string} [subtitle] - Optional subtitle for accessibility/tooltips.
 */
export default function Breadcrumb({ pageName, subPageName, subtitle }) {
    return (
        <div className="flex items-center text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm w-fit mb-6">
            <LayoutDashboard className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <ChevronRight className="w-4 h-4 text-slate-300 mx-1.5" aria-hidden="true" />
            <span className="hover:text-slate-900 cursor-pointer transition-colors">
                {pageName}
            </span>
            {subPageName && (
                <>
                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1.5" aria-hidden="true" />
                    <span className="font-bold text-indigo-700" title={subtitle}>
                        {subPageName}
                    </span>
                </>
            )}
        </div>
    );
}
