"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  Search,
  ClipboardList,
  CheckCircle2,
  Package,
  Factory,
  Zap,
  ArrowRight,
  AlertCircle,
  Loader2,
  Tag,
  Hash,
  X,
  Filter,
  MoreVertical,
  Calendar,
  ShoppingBag,
  ExternalLink,
  ShieldCheck, // Added ShieldCheck as it's used in the table
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function IndentCreation({ pageName = "Procurement" }) {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [formData, setFormData] = useState({
    department: "Production Store",
    configId: "",
    configModel: "",
    itemName: "",
    itemCode: "",
    quantity: "",
    reason: "",
    trackingType: "Bulk",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procurement/indents");
      const json = await res.json();
      if (json.success) setIndents(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/inventory/transactions?summary=true&search=${encodeURIComponent(searchQuery)}`,
      );
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.data);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectItem = (item) => {
    setFormData({
      ...formData,
      configId: item._id,
      configModel:
        item.configModel ||
        (item.type === "product" ? "ProductConfig" : "ComponentConfig"),
      itemName: item.itemName,
      itemCode: item.itemCode,
      trackingType: item.trackingType || "Bulk",
    });
    setSearchQuery(`${item.itemCode} - ${item.itemName}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.configId || !formData.quantity) {
      setMessage({
        type: "error",
        text: "Please select an item and enter quantity",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/indents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: formData.department,
          indentType: "Manual",
          items: [
            {
              configId: formData.configId,
              configModel: formData.configModel,
              itemName: formData.itemName,
              quantity: Number(formData.quantity),
              reason: formData.reason,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Indent submitted successfully" });
        setIsModalOpen(false);
        fetchIndents();
        setFormData({
          department: "Production Store",
          configId: "",
          configModel: "",
          itemName: "",
          itemCode: "",
          quantity: "",
          reason: "",
          trackingType: "Bulk",
        });
        setSearchQuery("");
      } else {
        setMessage({ type: "error", text: data.error || "Submission failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error" });
    } finally {
      setSubmitting(false);
    }
  };

  const triggerAutoIndent = async () => {
    try {
      const res = await fetch("/api/procurement/auto-indent", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(`Generated ${data.count} auto-indents for deficient items.`);
        fetchIndents();
      }
    } catch (err) {
      console.error("Auto-indent trigger failed", err);
    }
  };

  return (
    <div className="max-w-full animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600 h-5 w-5" />
            Material Requisitions
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Indent Management" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerAutoIndent}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-tight hover:bg-slate-50 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Auto-replenish
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-tight shadow-md hover:bg-indigo-700 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Raise New Indent
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm"
              : "bg-rose-50 text-rose-800 border border-rose-100 shadow-sm"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-semibold text-xs">{message.text}</span>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="ml-auto bg-white/50 hover:bg-white p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Indent Pipeline
            </span>
          </div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {indents.length} entries
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-white">
                {[
                  "Indent ID",
                  "Requested By",
                  "Line Items",
                  "Status",
                  "Vendor Mapping",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {!loading &&
                indents.map((ind) => (
                  <tr
                    key={ind._id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                            ind.indentType === "Auto"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-indigo-50 text-indigo-600"
                          }`}
                        >
                          {ind.indentType === "Auto" ? (
                            <Zap className="w-4 h-4" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-600">
                            {ind.indentNumber}
                          </div>
                          <div className="text-[9px] font-semibold text-slate-400 uppercase">
                            {ind.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold text-[9px]">
                          {ind.requestedBy?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-700">
                            {ind.requestedBy?.name}
                          </div>
                          <div className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                            {new Date(ind.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="text-xs font-medium text-slate-600 truncate">
                        {ind.items.map((i) => i.itemName).join(", ")}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-semibold text-[9px] text-slate-400">
                        <span className="bg-slate-100 px-1 rounded uppercase">
                          {ind.items.reduce((a, b) => a + b.quantity, 0)} units
                        </span>
                        <span>•</span>
                        <span>{ind.items.length} SKU(s)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                          ind.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : ind.status === "PO Generated"
                              ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                              : "bg-amber-50 text-amber-700 ring-amber-600/20"
                        }`}
                      >
                        {ind.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {[1, 2].map((v) => (
                            <div
                              key={v}
                              className="h-5 w-5 rounded bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                            >
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                            </div>
                          ))}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">
                          Verified Mapping
                        </div>
                      </div>
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
              Loading indent pipeline...
            </div>
          </div>
        )}

        {!loading && indents.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 h-16 w-16 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
              <Hash className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Queue Empty
            </h3>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
              All requisitions have been processed or none have been raised yet.
            </p>
          </div>
        )}
      </div>

      {/* Modal Requisition Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-400">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-indigo-600 h-5 w-5" />
                <h3 className="text-lg font-black text-slate-800">
                  New Material Indent
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Req. Department
                    </label>
                    <div className="relative">
                      <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className="block w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
                      >
                        <option>Production Store</option>
                        <option>Raw Material Store</option>
                        <option>Projects / Setup</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 relative" ref={dropdownRef}>
                    <label className="text-xs font-semibold text-slate-700">
                      Item Search
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {isSearching ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : (
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() =>
                          searchQuery.length >= 2 && setShowDropdown(true)
                        }
                        placeholder="Code or Description"
                        className="block w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all shadow-sm"
                      />
                    </div>

                    {showDropdown && (
                      <div className="absolute z-50 mt-1 w-[150%] -left-[25%] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-[250px] overflow-y-auto p-1.5 space-y-0.5">
                          {searchResults.map((item) => (
                            <div
                              key={item._id}
                              onClick={() => selectItem(item)}
                              className="p-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer border border-transparent hover:border-indigo-100 transition-all group flex items-center gap-3"
                            >
                              <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-xs font-bold">
                                {item.type === "product" ? (
                                  <Tag className="w-4 h-4" />
                                ) : (
                                  <Package className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800 text-xs truncate">
                                    {item.itemCode || item.serialNumber}
                                  </span>
                                  <span
                                    className={`text-[8px] font-bold px-1 rounded-full ${
                                      item.type === "product"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-100 text-emerald-700"
                                    } uppercase`}
                                  >
                                    {item.type}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5 uppercase tracking-tighter">
                                  {item.itemName || item.productName} •{" "}
                                  {item.description}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className={`text-[10px] font-bold ${
                                    item.currentQuantity <
                                    (item.minStockLevel || 0)
                                      ? "text-rose-600"
                                      : "text-slate-700"
                                  }`}
                                >
                                  Qty: {item.currentQuantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 py-2 px-4 text-base font-bold text-slate-800 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <label className="text-xs font-semibold text-slate-700">
                      Tracking Profile
                    </label>
                    <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                      {["Bulk", "Serialized"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, trackingType: type })
                          }
                          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            formData.trackingType === type
                              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Reason / Scope
                  </label>
                  <textarea
                    rows="2"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Enter requisition reason..."
                    className="block w-full rounded-xl border border-slate-200 py-2 px-3 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ClipboardList className="w-4 h-4" />
                    )}
                    Submit Indent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndentCreation;
