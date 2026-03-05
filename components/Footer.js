import { Info } from "lucide-react";
import { version } from "@/package.json";
import PoweredLogo from "./Powered";
import Link from "next/link";
import DBStatus from "./DBStatus";
import { currentYearIST } from "@/lib/dateUtils";

export default function Footer() {
    const year = currentYearIST();

    return (
        <footer className="w-full bg-white border-t border-slate-100 py-3 px-6 mt-auto">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center text-xs text-slate-500 font-medium">
                {/* Left — Active Factory */}
                <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Active: Bengaluru Factory</span>
                    <span className="text-slate-300">|</span>
                    <span>Store: Main Raw Material</span>
                </div>

                {/* Center — Live DB Status */}
                <DBStatus />

                {/* Right — Version & Powered By */}
                <div className="flex items-center space-x-2 text-slate-400">
                    <Link
                        href="/releases"
                        className="text-slate-400 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors font-semibold"
                        title="View Release Notes"
                    >
                        v{version}
                    </Link>
                    <span className="text-slate-300">|</span>
                    <span>&copy; {year} Techser Industries</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                        <span className="text-slate-400 text-xs text-nowrap">powered by</span>
                        <PoweredLogo />
                    </span>
                </div>
            </div>
        </footer>
    );
}

