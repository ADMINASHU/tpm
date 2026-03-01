"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    PackageSearch,
    Wrench,
    Truck,
    LineChart,
    Settings,
    LogOut,
    FileBadge
} from "lucide-react";
import clsx from "clsx";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Procurement", href: "/procurement", icon: FileBadge },
    { name: "Inventory", href: "/inventory", icon: PackageSearch },
    { name: "Production", href: "/production", icon: Wrench },
    { name: "Logistics", href: "/logistics", icon: Truck },
    { name: "Finance", href: "/finance", icon: LineChart },
    { name: "Setup", href: "/setup", icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center mr-6">
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                Techser ERP
                            </span>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:space-x-2 items-center">
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={clsx(
                                            "inline-flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                                            isActive
                                                ? "text-indigo-700 bg-indigo-50 shadow-sm ring-1 ring-indigo-100"
                                                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-slate-900 leading-tight">{session?.user?.name || "User"}</div>
                            <div className="text-xs font-medium text-slate-500">{session?.user?.role || "Role"}</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => signOut()}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
