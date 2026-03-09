"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShoppingBag,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function POApproval({ pageName = "Procurement" }) {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/procurement/indents?status=Approval Pending",
      );
      const json = await res.json();
      if (json.success) setIndents(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/procurement/po/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indentId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("PO generated and split successfully!");
        fetchIndents();
      } else {
        alert(data.error || "Approval failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8 select-none">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <FileText className="text-indigo-600 h-5 w-5" />
          PO Mapping & Generation
        </h2>
        <Breadcrumb pageName={pageName} subPageName="PO Approvals" />
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Review pending material indents and trigger{" "}
          <span className="text-indigo-600 font-semibold">
            Auto-PO Splitting
          </span>{" "}
          across pre-mapped vendor catalogs.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Indent Detail",
                  "Origin Dept",
                  "Items Requested",
                  "Suggested Vendor",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading &&
                indents.map((ind) => (
                  <tr
                    key={ind._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:scale-105 transition-transform">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {ind.indentNumber}
                          </div>
                          <div
                            className={`text-[9px] font-semibold uppercase ${ind.indentType === "Auto" ? "text-amber-500" : "text-slate-400"}`}
                          >
                            {ind.indentType} Source
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                        {ind.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-slate-700 truncate">
                        {ind.items.map((i) => i.itemName).join(", ")}
                      </div>
                      <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                        {ind.items.length} SKU(s) • Qty:{" "}
                        {ind.items.reduce(
                          (acc, curr) => acc + curr.quantity,
                          0,
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ind.items[0]?.suggestedSupplier ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[10px] font-bold text-slate-800 uppercase">
                            {ind.items[0].suggestedSupplier.name}
                            {ind.items.length > 1 && (
                              <span className="text-slate-400 ml-1 italic">
                                + {ind.items.length - 1} more
                              </span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-semibold text-slate-400 uppercase italic">
                          Market Requisition
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleApprove(ind._id)}
                        disabled={processingId === ind._id}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {processingId === ind._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        Finalise PO
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Synchronizing Queue...
            </div>
          </div>
        )}

        {!loading && indents.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
              <CheckCircle2 className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Queue Fully Processed
            </h3>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
              All pending indents have been finalized and mapped to purchase
              orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default POApproval;
