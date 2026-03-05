"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Truck, MapPin, RefreshCw } from "lucide-react";

const PAGE_HEADERS = {
  transfer: {
    title: "Stock Transfer",
    subtitle:
      "Move components or finished goods between logical factory stores.",
  },
  dispatch: {
    title: "External Dispatch",
    subtitle: "Track outbound shipments and external delivery workflows.",
  },
};

function LogisticsContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "transfer";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (["transfer", "dispatch"].includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const { title, subtitle } = PAGE_HEADERS[activeTab] || PAGE_HEADERS.transfer;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
        </div>

        {/* Tab switcher — mobile only */}
        <div className="md:hidden flex space-x-1 p-1 bg-slate-200/50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("transfer")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "transfer"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Internal Stock Transfer
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "dispatch"
                ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            External Dispatch
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {activeTab === "transfer" ? <StockTransfer /> : <ExternalDispatch />}
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

function StockTransfer() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <RefreshCw className="mr-2 text-indigo-600 h-6 w-6" />
          Initiate Stock Transfer
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Move components or finished goods between logical factory stores.
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Source Store
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                <option>Raw Material Store (Bengaluru)</option>
                <option>Production Store (Bengaluru)</option>
                <option>Finished Goods (Bengaluru)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Destination Store
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select className="block w-full pl-10 rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
                <option>Production Store (Bengaluru)</option>
                <option>Raw Material Store (Bengaluru)</option>
                <option>Finished Goods (Bengaluru)</option>
                <option>Service Center (Bengaluru)</option>
              </select>
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item to Transfer
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Scan Hex Tag or search Bulk Name..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity
            </label>
            <input
              type="number"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item Condition
            </label>
            <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option value="NEW">New (Pristine)</option>
              <option value="REFURBISHED">Refurbished / Repaired</option>
              <option value="FAULTY">Faulty / Rejected</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            Commit Transfer
          </button>
        </div>
      </form>
    </div>
  );
}

function ExternalDispatch() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Truck className="mr-2 text-indigo-600 h-6 w-6" />
          Create Dispatch Order
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Record outbound shipment of finished goods or spare parts to a
          customer or service center.
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Customer / Consignee
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Dispatch From (Store)
            </label>
            <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Finished Goods (Bengaluru)</option>
              <option>Production Store (Bengaluru)</option>
              <option>Raw Material Store (Bengaluru)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. 12 Industrial Area, Pune, Maharashtra"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item / Serial No.
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Scan Serial or enter Bulk Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Mode of Dispatch
            </label>
            <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Own Vehicle</option>
              <option>Third-Party Courier</option>
              <option>Customer Pickup</option>
              <option>Air Freight</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Vehicle / Tracking No.
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. KA01AB1234 or AWB-00912"
            />
          </div>
          {/* Add Logistics Surcharge Calculation fields */}
          <div className="col-span-2 pt-4 border-t border-slate-100 mt-4">
            <h3 className="text-sm font-semibold leading-6 text-slate-900 mb-4 flex items-center gap-2">
              Logistics Costs (Surcharge Calculation)
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Fuel (₹)
                </label>
                <input
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Toll (₹)
                </label>
                <input
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Driver Allow. (₹)
                </label>
                <input
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Dispatch Notes
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm resize-none"
              placeholder="Any special handling instructions or reference PO number..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            <Truck className="w-4 h-4 mr-2" /> Confirm Dispatch
          </button>
        </div>
      </form>
    </div>
  );
}
