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
  FileBadge,
  BookOpen,
  ChevronDown,
  Building,
  Users,
  Info,
  ClipboardList,
  FileCheck,
  QrCode,
  Package,
  Layers,
  RefreshCw,
  Truck as TruckOut,
  BarChart2,
  BookOpenCheck,
  GitBranch,
  SlidersHorizontal,
  UserCircle2,
  Factory,
  Menu,
  X,
  History,
  FileSearch,
} from "lucide-react";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import Logo from "./Logo";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Procurement",
    href: "/procurement",
    icon: FileBadge,
    children: [
      {
        name: "Create Indent",
        href: "/procurement?tab=indent",
        icon: ClipboardList,
      },
      {
        name: "PO Gen & Approvals",
        href: "/procurement?tab=po",
        icon: FileCheck,
      },
      {
        name: "Purchase Orders",
        href: "/procurement?tab=orders",
        icon: PackageSearch,
      },
      {
        name: "Supplier Config",
        href: "/procurement?tab=suppliers",
        icon: Factory,
      },
    ],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: PackageSearch,
    children: [
      { name: "Quick GRN", href: "/inventory?tab=grn", icon: Package },
      { name: "Quality Control", href: "/inventory?tab=qc", icon: FileSearch },
      { name: "Stock Overview", href: "/inventory?tab=stock", icon: Layers },
      { name: "Transaction Logs", href: "/inventory?tab=logs", icon: History },
      { name: "Hex Tag Index", href: "/inventory?tab=hex", icon: QrCode },
      { name: "Tag Generator", href: "/inventory?tab=tags", icon: Settings },
    ],
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
    children: [
      {
        name: "Assembly Production",
        href: "/production?tab=assembly",
        icon: ClipboardList,
      },
      {
        name: "BOM Configuration",
        href: "/production?tab=bom",
        icon: GitBranch,
      },
      {
        name: "Genealogy Trace",
        href: "/production?tab=genealogy",
        icon: QrCode,
      },
      {
        name: "Product Config",
        href: "/production?tab=products",
        icon: Package,
      },
      {
        name: "Component Config",
        href: "/production?tab=components",
        icon: Settings,
      },
      {
        name: "Spare Parts Config",
        href: "/production?tab=spares",
        icon: Wrench,
      },
    ],
  },
  {
    name: "Logistics",
    href: "/logistics",
    icon: Truck,
    children: [
      {
        name: "Stock Transfer",
        href: "/logistics?tab=transfer",
        icon: RefreshCw,
      },
      {
        name: "External Dispatch",
        href: "/logistics?tab=dispatch",
        icon: TruckOut,
      },
    ],
  },
  {
    name: "Finance",
    href: "/finance",
    icon: LineChart,
    children: [
      { name: "AP Aging", href: "/finance?tab=aging", icon: BarChart2 },
      { name: "Ledger Book", href: "/finance?tab=ledger", icon: BookOpenCheck },
    ],
  },
  {
    name: "Setup",
    href: "/setup",
    icon: SlidersHorizontal,
    children: [
      { name: "Factory Config", href: "/setup?tab=factory", icon: Factory },
      { name: "Users & Roles", href: "/setup?tab=users", icon: UserCircle2 },
      { name: "System Info", href: "/setup/system-info", icon: Info },
    ],
  },
];

// ── Avatar / User Dropdown ──────────────────────────────────
function AvatarMenu({ session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const name = session?.user?.name || "User";
  const role = session?.user?.role || "Role";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="User menu"
      >
        {/* Avatar circle only */}
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-sm ring-2 ring-white">
          {initials}
        </div>
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-100/50 z-50 overflow-hidden">
          {/* User header */}
          <div className="px-4 py-4 bg-linear-to-br from-indigo-50 to-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-black shadow">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{name}</p>
                <p className="text-xs text-indigo-600 font-semibold">{role}</p>
              </div>
            </div>
          </div>

          {/* Guide & Preferences Section */}
          <div className="py-1">
            <Link
              href="/guide"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              User Guide
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              System Preferences
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavDropdown({ item, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);
  const Icon = item.icon;

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
          isActive
            ? "text-indigo-700 bg-indigo-50 shadow-sm ring-1 ring-indigo-100"
            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50",
        )}
      >
        <Icon className="w-4 h-4" />
        {item.name}
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 pt-2 w-52 z-50"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 ring-1 ring-slate-100/50 py-1.5">
            {/* Top arrow */}
            <div className="absolute top-2 left-5 w-3 h-3 bg-white border-l border-t border-slate-100 rotate-45" />
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors mx-1 rounded-lg"
                >
                  <ChildIcon className="w-4 h-4 text-slate-400" />
                  {child.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile Drawer ────────────────────────────────────────────
function MobileDrawer({ open, onClose, pathname }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-linear-to-r from-indigo-50 to-slate-50">
          <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            Techser ERP
          </span>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
                {/* Sub-links */}
                {item.children && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          <ChildIcon className="w-3.5 h-3.5 text-slate-400" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left — Hamburger (mobile only) + Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Logo />
            </div>

            {/* Right — Desktop nav links + Avatar */}
            <div className="flex items-center gap-1">
              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1 mr-2">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;

                  if (item.children) {
                    return (
                      <NavDropdown
                        key={item.name}
                        item={item}
                        isActive={isActive}
                      />
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "inline-flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                        isActive
                          ? "text-indigo-700 bg-indigo-50 shadow-sm ring-1 ring-indigo-100"
                          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50",
                      )}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Avatar (always visible) */}
              <AvatarMenu session={session} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
