"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";

const QuickGRN = dynamic(() => import("@/components/inventory/QuickGRN"), { loading: () => <TabLoader /> });
const HexIndexing = dynamic(() => import("@/components/inventory/HexIndexing"), { loading: () => <TabLoader /> });
const StockOverview = dynamic(() => import("@/components/inventory/StockOverview"), { loading: () => <TabLoader /> });
const TagGenerator = dynamic(() => import("@/components/inventory/TagGenerator"), { loading: () => <TabLoader /> });
const QualityControl = dynamic(() => import("@/components/inventory/QualityControl"), { loading: () => <TabLoader /> });

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
  grn: { title: "Quick GRN", subtitle: "Fast goods receipt entry — generates Hex Tags for all received units." },
  stock: { title: "Stock Overview", subtitle: "Live view of all raw materials and identified components." },
  qc: { title: "Quality Control", subtitle: "Audit incoming GRNs, accept items, or process Return to Vendor (RTV)." },
  hex: { title: "Hex Tag Indexing", subtitle: "Scan unindexed tags and link them to exact technical specifications." },
  tags: { title: "Tag Generator", subtitle: "Print bulk Hex Tags or specific component QR barcodes." },
};

const TABS = ["grn", "qc", "hex", "stock", "tags"];

function InventoryContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "grn";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (TABS.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.grn;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <Breadcrumb pageName="Inventory" subPageName={title} subtitle={subtitle} />

        {/* Tab switcher — mobile only */}
        <div className="md:hidden flex flex-wrap gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          {TABS.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tabKey
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
            >
              {PAGE_HEADERS[tabKey].title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "grn" && <QuickGRN />}
          {activeTab === "qc" && <QualityControl />}
          {activeTab === "hex" && <HexIndexing />}
          {activeTab === "stock" && <StockOverview />}
          {activeTab === "tags" && <TagGenerator />}
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}
