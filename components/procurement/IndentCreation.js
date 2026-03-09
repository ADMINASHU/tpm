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
  ShieldCheck,
  RotateCcw,
  Save,
  Trash2,
  Clock,
  User,
  History,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function IndentCreation({ pageName = "Procurement" }) {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [department, setDepartment] = useState("Production");
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or detail
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Current Item Input State (temporary)
  const [currentItem, setCurrentItem] = useState({
    configId: "",
    configModel: "",
    itemName: "",
    itemCode: "",
    quantity: "",
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
    setCurrentItem({
      configId: item._id,
      configModel:
        item.configModel ||
        (item.type === "product" ? "ProductConfig" : "ComponentConfig"),
      itemName: item.itemName || item.productName,
      itemCode: item.itemCode || item.serialNumber,
    });
    setSearchQuery(
      `${item.itemCode || item.serialNumber} - ${item.itemName || item.productName}`,
    );
    setShowDropdown(false);
  };

  const addItemToList = () => {
    if (!currentItem.configId || !currentItem.quantity) return;
    setSelectedItems([
      ...selectedItems,
      { ...currentItem, quantity: Number(currentItem.quantity) },
    ]);
    setCurrentItem({
      configId: "",
      configModel: "",
      itemName: "",
      itemCode: "",
      quantity: "",
    });
    setSearchQuery("");
  };

  const removeItem = (idx) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const deleteIndent = async (id) => {
    if (!confirm("Are you sure you want to reject/delete this indent?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/procurement/indents/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Indent rejected successfully" });
        setViewMode("list");
        fetchIndents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateIndent = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/procurement/indents/${selectedIndent._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: editForm.items }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Indent updated successfully" });
        setSelectedIndent(data.data);
        setIsEditing(false);
        fetchIndents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const approveIndent = async (id) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/po/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indentId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Indent approved and POs split successfully!");
        setViewMode("list");
        fetchIndents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setMessage({
        type: "error",
        text: "Please add at least one item to the indent",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/procurement/indents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          indentType: "Manual",
          items: selectedItems.map((item) => ({
            ...item,
            reason: reason, // Assign general reason or specific if needed
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Indent submitted successfully" });
        setIsModalOpen(false);
        fetchIndents();
        setDepartment("Production");
        setSelectedItems([]);
        setReason("");
        setCurrentItem({
          configId: "",
          configModel: "",
          itemName: "",
          itemCode: "",
          quantity: "",
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

      {/* Main Content View Switcher */}
      {viewMode === "list" ? (
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
              <thead className="bg-slate-50/50">
                <tr>
                  {[
                    "Indent Number",
                    "Requested By",
                    "Material Details",
                    "Current Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest"
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
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm ${
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
                            <div className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {ind.indentNumber}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                              {ind.department} •{" "}
                              {new Date(ind.createdAt).toLocaleDateString()}{" "}
                              {new Date(ind.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 font-black text-[10px] shadow-sm">
                            {ind.requestedBy?.name?.charAt(0) || "U"}
                          </div>
                          <div className="text-xs font-bold text-slate-700">
                            {ind.requestedBy?.name || "System"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[10px] font-bold text-slate-600 truncate max-w-[200px] uppercase tracking-tight">
                            {ind.items.map((i) => i.itemName).join(", ")}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                              {ind.items.reduce((a, b) => a + b.quantity, 0)}{" "}
                              units
                            </span>
                            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                              {ind.items.length} SKU(s)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${
                            ind.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20"
                              : ind.status === "PO Generated"
                                ? "bg-sky-50 text-sky-600 ring-sky-500/20"
                                : "bg-amber-50 text-amber-600 ring-amber-500/20"
                          }`}
                        >
                          {ind.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedIndent(ind);
                            setViewMode("detail");
                            setIsEditing(false);
                          }}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                        >
                          <ExternalLink className="w-4 h-4" />
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
                All requisitions have been processed or none have been raised
                yet.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* DETAIL VIEW SECTION */
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-5 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h3 className="text-xl font-black">
                  {selectedIndent.indentNumber}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {selectedIndent.indentType} Source •{" "}
                  {selectedIndent.department}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm({ ...selectedIndent });
                    }}
                    className="px-5 py-2 bg-white/10 text-white rounded-xl font-bold text-[11px] uppercase hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteIndent(selectedIndent._id)}
                    className="px-5 py-2 bg-rose-500/10 text-rose-500 rounded-xl font-bold text-[11px] uppercase hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                  {selectedIndent.status === "Approval Pending" && (
                    <button
                      onClick={() => approveIndent(selectedIndent._id)}
                      disabled={submitting}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[11px] uppercase shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve & Map PO
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 bg-slate-700 text-white rounded-xl font-bold text-[11px] uppercase hover:bg-slate-600 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={updateIndent}
                    disabled={submitting}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold text-[11px] uppercase shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start gap-10">
              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-6">
                    Line Items Detail
                  </h4>
                  <div className="space-y-4">
                    {(isEditing ? editForm.items : selectedIndent.items).map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-2xl p-5 border border-slate-200 group/item relative"
                        >
                          {isEditing && (
                            <button
                              onClick={() => {
                                const newItems = editForm.items.filter(
                                  (_, i) => i !== idx,
                                );
                                setEditForm({ ...editForm, items: newItems });
                              }}
                              className="absolute -top-2 -right-2 p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-600 hover:text-white transition-all shadow-md opacity-0 group-hover/item:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                {item.itemName}
                              </div>
                              <div className="text-xs font-medium text-slate-500 italic mt-1 bg-white/50 w-fit px-2 py-0.5 rounded-lg">
                                {item.description || "System identified need"}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {isEditing ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...editForm.items];
                                      newItems[idx].quantity = Number(
                                        e.target.value,
                                      );
                                      setEditForm({
                                        ...editForm,
                                        items: newItems,
                                      });
                                    }}
                                    className="w-24 px-3 py-1.5 bg-white border-2 border-slate-200 rounded-xl text-right font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                  />
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    Edit Qty
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-2xl font-black text-indigo-600 leading-none">
                                    {item.quantity}
                                  </div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Units
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                                Preferred Source
                              </div>
                              <div className="text-xs font-black text-slate-800 uppercase">
                                {item.suggestedSupplier?.name ||
                                  "Open Sourcing"}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                Est. Rate: ₹{item.suggestedRate || "Market"}
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-amber-500" />
                                Logic
                              </div>
                              <div className="text-[10px] font-bold text-slate-600 leading-tight line-clamp-2">
                                {item.reason ||
                                  "Inventory fell below minimum safety threshold."}
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="w-72 space-y-6">
                <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-100/50 shadow-inner">
                  <h5 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    Requisition Trail
                  </h5>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-400 mt-1.5 ring-4 ring-indigo-50 shrink-0"></div>
                      <div>
                        <div className="text-[11px] font-black text-slate-800 uppercase">
                          Draft Created
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {new Date(selectedIndent.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5 ring-4 ring-slate-50 shrink-0"></div>
                      <div>
                        <div className="text-[11px] font-black text-slate-400 uppercase">
                          Verification
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 italic">
                          Awaiting procurement lead
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-black text-amber-700 uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    Audit Note
                  </div>
                  <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed uppercase tracking-tight">
                    This request represents a <strong>factory claim</strong>.
                    Ensure quantities align with monthly production caps before
                    finalizing mapping.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

            <div className="p-8 max-h-[85vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest pl-1">
                    Requesting Department
                  </label>
                  <div className="relative">
                    <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
                    >
                      <option>Production Store</option>
                      <option>Raw Material Store</option>
                      <option>Projects / Setup</option>
                    </select>
                  </div>
                </div>

                {/* Multi-Item Area */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      Add Line Items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    <div className="md:col-span-4 relative" ref={dropdownRef}>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {isSearching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          ) : (
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search Item..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>

                      {showDropdown && (
                        <div className="absolute z-50 mt-1 w-[150%] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                            {searchResults.map((item) => (
                              <div
                                key={item._id}
                                onClick={() => selectItem(item)}
                                className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-all flex items-center gap-3"
                              >
                                <div className="p-2 bg-slate-100 rounded text-slate-500">
                                  <Tag className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-800 text-xs truncate uppercase tracking-tight">
                                    {item.itemCode || item.serialNumber}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {item.itemName || item.productName}
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold text-indigo-600 shrink-0">
                                  Qty: {item.currentQuantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={currentItem.quantity}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addItemToList}
                      disabled={!currentItem.configId || !currentItem.quantity}
                      className="md:col-span-1 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Staged Items List */}
                  {selectedItems.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                      {selectedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-xs uppercase tracking-tight">
                              {item.itemCode}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate uppercase mt-0.5">
                              {item.itemName}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-indigo-600 min-w-12 text-right">
                              {item.quantity} U
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest pl-1">
                    Requisition Reason / Note
                  </label>
                  <textarea
                    rows="2"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly explain why these items are needed..."
                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || selectedItems.length === 0}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 uppercase tracking-widest active:scale-95"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ClipboardList className="w-5 h-5" />
                    )}
                    Generate Material Indent
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
