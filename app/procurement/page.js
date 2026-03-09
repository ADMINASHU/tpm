"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";

const IndentCreation = dynamic(
  () => import("@/components/procurement/IndentCreation"),
  { loading: () => <TabLoader /> },
);
const IndentReview = dynamic(
  () => import("@/components/procurement/IndentReview"),
  { loading: () => <TabLoader /> },
);
const SupplierConfig = dynamic(
  () => import("@/components/procurement/SupplierConfig"),
  { loading: () => <TabLoader /> },
);

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

const PAGE_HEADERS = {
  indent: {
    title: "Create Indent",
    subtitle:
      "Raise material requisitions for components reaching minimum buffer levels.",
  },
  po: {
    title: "PO Gen & Approvals",
    subtitle:
      "Review approved indents and generate purchase orders from vendor catalogs.",
  },
  suppliers: {
    title: "Supplier Config",
    subtitle: "Manage approved vendor list, contacts, and supply categories.",
  },
};

const TABS = ["indent", "po", "suppliers"];

function ProcurementContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "indent";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (TABS.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.indent;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Tab switcher — mobile only */}
        <div className="md:hidden flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          {TABS.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tabKey
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {PAGE_HEADERS[tabKey].title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "indent" && <IndentCreation pageName="Procurement" />}
          {activeTab === "po" && <IndentReview pageName="Procurement" />}
          {activeTab === "suppliers" && (
            <SupplierConfig pageName="Procurement" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense>
      <ProcurementContent />
    </Suspense>
  );
}
