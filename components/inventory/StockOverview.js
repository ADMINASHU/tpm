"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getISODateIST } from "@/lib/dateUtils";

function StockOverview({ pageName = "Inventory" }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupByMake, setGroupByMake] = useState(false);

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory/transactions?summary=true");
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching stock summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedItems = useMemo(() => {
    if (!groupByMake) return [];

    const groups = {};
    filteredItems.forEach(item => {
      const make = item.make || item.productRatings || "General";
      if (!groups[make]) {
        groups[make] = {
          make,
          totalQuantity: 0,
          totalValue: 0,
          items: []
        };
      }

      const qty = Number(item.currentQuantity || 0);
      const price = Number(item.averageUnitCost || 0);

      groups[make].totalQuantity += qty;
      groups[make].totalValue += (qty * price);
      groups[make].items.push(item);
    });

    return Object.values(groups).sort((a, b) => b.totalValue - a.totalValue);
  }, [filteredItems, groupByMake]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Stock Inventory Overview
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Stock Overview" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Total Active SKUs:{" "}
            <span className="font-bold text-slate-900 text-lg">
              {items.length}
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setGroupByMake(!groupByMake)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors border ${groupByMake ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            Condition: {groupByMake ? 'Grouped by Make' : 'Individual SKUs'}
          </button>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
              placeholder="Search item code, name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <th className="py-4 px-6">{groupByMake ? 'Make Strategy' : 'Identity'}</th>
              <th className="py-4 px-6">{groupByMake ? 'Unique SKUs' : 'Category & Make'}</th>
              {!groupByMake && <th className="py-4 px-6 text-right">Avg Unit Cost</th>}
              <th className="py-4 px-6 text-right">Qty Available</th>
              <th className="py-4 px-6 text-right">Est. Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">
                      Calculating stock levels...
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-20 text-center text-slate-400 italic"
                >
                  No transaction-based stock found.
                </td>
              </tr>
            ) : groupByMake ? (
              groupedItems.map((group) => (
                <tr key={group.make} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 text-sm uppercase tracking-wider">{group.make}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{group.items.length} SKUs</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-base font-black text-indigo-600">
                      {Number(group.totalQuantity).toLocaleString()}
                      <span className="text-[10px] ml-1 font-bold text-slate-400 uppercase tracking-tighter">Units</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-sm font-bold text-slate-700">
                      ₹{Number(group.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              filteredItems.map((item) => {
                const qty = Number(item.currentQuantity || 0);
                const price = Number(item.averageUnitCost || 0);
                const totalValue = qty * price;

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-indigo-600 text-[10px] uppercase tracking-tighter">
                          {item.itemCode}
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5">
                          {item.itemName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                          {item.category?.replace('_', ' ')}
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${item.type === 'product' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.type}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                          {item.make || item.productRatings || "General"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-xs font-bold text-slate-500">
                        ₹{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`text-base font-black ${qty <= 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                          }`}
                      >
                        {qty.toLocaleString()}
                        <span className="text-[10px] ml-1 font-bold text-slate-400 uppercase tracking-tighter">
                          {item.baseUom || "Units"}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-xs font-bold text-slate-800">
                        ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default StockOverview;
