"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Mail } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const AgingTab = dynamic(() => import("@/components/finance/AgingTab"), { loading: () => <TabLoader /> });
const LedgerTab = dynamic(() => import("@/components/finance/LedgerTab"), { loading: () => <TabLoader /> });
const CostingTab = dynamic(() => import("@/components/finance/CostingTab"), { loading: () => <TabLoader /> });

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
  aging: { title: "AP Aging Report", subtitle: "Track overdue vendor invoices and payment obligations." },
  ledger: { title: "Ledger Book", subtitle: "General ledger with running balance across all transactions." },
  costing: { title: "Financial Costing Engine", subtitle: "Configure overheads, view variances, and control ledger categories." },
};

function FinanceContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "aging";
  const { title, subtitle } = PAGE_HEADERS[tab] || PAGE_HEADERS.aging;

  return (
    <div className="flex-1 p-8">
      <Breadcrumb pageName="Finance" subPageName={title} subtitle={subtitle} />
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-end items-start">
          {tab === "aging" && (
            <button
              type="button"
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
            >
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Trigger Aging Email
            </button>
          )}
        </div>
        {tab === "aging" && <AgingTab />}
        {tab === "ledger" && <LedgerTab />}
        {tab === "costing" && <CostingTab />}
      </div>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense>
      <FinanceContent />
    </Suspense>
  );
}
