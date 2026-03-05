"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";

// Lazy-load each tab for code splitting — only fetched when the tab is active
const NewBuild = dynamic(() => import("@/components/production/NewBuild"), {
  loading: () => <TabLoader />,
});
const BOMConfig = dynamic(() => import("@/components/production/BOMConfig"), {
  loading: () => <TabLoader />,
});
const GenealogyTrace = dynamic(
  () => import("@/components/production/GenealogyTrace"),
  { loading: () => <TabLoader /> }
);
const ProductConfig = dynamic(
  () => import("@/components/production/ProductConfig"),
  { loading: () => <TabLoader /> }
);
const ComponentConfig = dynamic(
  () => import("@/components/production/ComponentConfig"),
  { loading: () => <TabLoader /> }
);
const SpareParts = dynamic(
  () => import("@/components/production/SpareParts"),
  { loading: () => <TabLoader /> }
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
  build: {
    title: "New Assembly Build",
    subtitle:
      "Scan Hex Tags and bind components into a finished product with auto-serial.",
  },
  bom: {
    title: "BOM Configuration",
    subtitle: "Define ratio mappings for spare parts and finished products.",
  },
  genealogy: {
    title: "Genealogy Trace",
    subtitle:
      "Trace all components, suppliers, and operators via serial number.",
  },
  products: {
    title: "Product Config",
    subtitle: "Define finished goods properties, variants, and base pricing.",
  },
  components: {
    title: "Component Config",
    subtitle: "Manage raw material specs, buffer levels, and tech attributes.",
  },
  spares: {
    title: "Spare Parts Config",
    subtitle: "Configure field-replaceable units and service kits.",
  },
};

const TABS = ["build", "bom", "genealogy", "products", "components", "spares"];

function ProductionContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "build";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (TABS.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.build;

  return (
    <div className="flex-1 p-4 md:py-6 md:px-8">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">

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

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
          {activeTab === "build" && <NewBuild pageName="Production" />}
          {activeTab === "bom" && <BOMConfig pageName="Production" />}
          {activeTab === "genealogy" && <GenealogyTrace pageName="Production" />}
          {activeTab === "products" && <ProductConfig pageName="Production" />}
          {activeTab === "components" && <ComponentConfig pageName="Production" />}
          {activeTab === "spares" && <SpareParts pageName="Production" />}
        </div>
      </div>
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense>
      <ProductionContent />
    </Suspense>
  );
}
