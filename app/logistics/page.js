"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";

const StockTransfer = dynamic(() => import("@/components/logistics/StockTransfer"), { loading: () => <TabLoader /> });
const ExternalDispatch = dynamic(() => import("@/components/logistics/ExternalDispatch"), { loading: () => <TabLoader /> });

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
  transfer: { title: "Stock Transfer", subtitle: "Move components or finished goods between logical factory stores." },
  dispatch: { title: "External Dispatch", subtitle: "Track outbound shipments and external delivery workflows." },
};

const TABS = ["transfer", "dispatch"];

function LogisticsContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "transfer";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (TABS.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.transfer;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

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
          {activeTab === "transfer" ? (
            <StockTransfer pageName="Logistics" />
          ) : (
            <ExternalDispatch pageName="Logistics" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogisticsPage() {
  return (
    <Suspense>
      <LogisticsContent />
    </Suspense>
  );
}
