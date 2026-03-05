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
        <div className="flex items-center text-[10px] font-medium text-slate-400 mt-0.5 ml-1">
            <LayoutDashboard className="w-3 h-3 text-slate-300" aria-hidden="true" />
            <ChevronRight className="w-3 h-3 text-slate-200 mx-1" aria-hidden="true" />
            <span className="hover:text-slate-600 cursor-pointer transition-colors uppercase tracking-wider">
                {pageName}
            </span>
            {subPageName && (
                <>
                    <ChevronRight className="w-3 h-3 text-slate-200 mx-1" aria-hidden="true" />
                    <span className="font-semibold text-indigo-500/80 uppercase tracking-wider" title={subtitle}>
                        {subPageName}
                    </span>
                </>
            )}
        </div>
    );
}
