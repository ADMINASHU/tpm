import { Database, Server, Info } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-slate-100 py-3 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-500 font-medium">
                <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Active: Bengaluru Factory</span>
                    <span className="text-slate-300">|</span>
                    <span>Store: Main Raw Material</span>
                </div>

                <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Database: Connected</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center space-x-1">
                        <Server className="w-4 h-4 text-slate-400" />
                        <span>MongoDB Node: Primary</span>
                    </span>
                </div>

                <div className="text-slate-400">
                    v1.0.4 | &copy; 2024 Techser Plant Management
                </div>
            </div>
        </footer>
    );
}
