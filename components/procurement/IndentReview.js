"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  ShoppingCart,
  Zap,
  PackageCheck,
  Trash2,
  Save,
  RotateCcw,
  ClipboardCheck,
  TriangleAlert,
  User,
  Clock,
} from "lucide-react";

const formatDate = (d) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(d));

function IndentReview() {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [message, setMessage] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    fetchIndents();
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/factories"); // This returns { factories: [...] }
      const data = await res.json();
      if (data.factories && data.factories.length > 0) {
        // Since the user is logged into a specific factory, we can find it by looking for the one that has stores
        // Or if we have access to session, we can filter by session.user.factoryId
        // For now, let's assume we take the first factory's stores if it's the only one
        const factory = data.factories[0];
        if (factory && factory.stores) {
          setStores(factory.stores);
          if (factory.stores.length > 0)
            setSelectedStore(factory.stores[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

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

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const approveIndent = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/procurement/po/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indentId: id, storeName: selectedStore }),
      });

      const data = await res.json();
      if (data.success) {
        showMsg(
          "success",
          `✅ ${data.count} Purchase Order${data.count !== 1 ? "s" : ""} generated and placed in Draft. Check the 'Purchase Orders' tab.`,
        );
        setViewMode("list");
        fetchIndents();
      } else {
        showMsg("error", data.error || "Failed to generate POs");
      }
    } catch (err) {
      console.error(err);
      showMsg("error", "Connection error");
    } finally {
      setProcessing(false);
    }
  };

  const deleteIndent = async (id) => {
    if (!confirm("Reject and permanently delete this indent?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/procurement/indents/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "Indent rejected and removed from queue.");
        setViewMode("list");
        fetchIndents();
      } else {
        showMsg("error", data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const updateIndent = async () => {
    setProcessing(true);
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
        showMsg("success", "Indent updated successfully.");
        setSelectedIndent(data.data);
        setIsEditing(false);
        fetchIndents();
      } else {
        showMsg("error", data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
          Loading approval queue...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Toast */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center justify-between sticky top-4 z-50 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 opacity-60 hover:opacity-100"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === "list" ? (
        <>
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                PO Generation Queue
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review finalized material indents and{" "}
                <strong>approve them to generate Purchase Orders</strong>. Each
                indent is split per vendor automatically.
              </p>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
              {indents.length} Awaiting
            </span>
          </div>

          {/* Info Banner */}
          <div
            className="px-8 py-5 border-b border-indigo-100 flex justify-between items-center text-sm text-indigo-800"
            style={{
              background:
                "linear-gradient(to right, #f5f7ff, #ffffff, #f5f7ff)",
            }}
          >
            <Zap className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="font-medium">
              When you <strong>Approve &amp; Generate PO</strong>, the system
              automatically groups line items by suggested vendor and creates
              individual Draft Purchase Orders. Head to the{" "}
              <strong>Purchase Orders</strong> tab to review and send them.
            </p>
          </div>

          {/* Indent Table */}
          {indents.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-200">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-base mb-1">
                Queue is clear!
              </p>
              <p className="text-slate-400 text-sm">
                Raise a new indent from the{" "}
                <strong>Material Requisitions</strong> tab to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Indent
                    </th>
                    <th className="py-4 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Items
                    </th>
                    <th className="py-4 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Requested By
                    </th>
                    <th className="py-4 px-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="py-4 px-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {indents.map((indent) => (
                    <tr
                      key={indent._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-black text-indigo-700 text-sm">
                          {indent.indentNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(indent.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-xs font-medium text-slate-700 truncate">
                          {indent.items.map((i) => i.itemName).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {indent.items.length} line items
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {indent.requestedBy?.name || "System"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${indent.indentType === "Auto" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {indent.indentType === "Auto" && (
                            <Zap className="w-2.5 h-2.5" />
                          )}
                          {indent.indentType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedIndent(indent);
                              setViewMode("detail");
                              setIsEditing(false);
                            }}
                            className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px] uppercase hover:bg-slate-200 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => approveIndent(indent._id)}
                            disabled={processing}
                            className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg font-bold text-[11px] uppercase shadow hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                          >
                            {processing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Generate PO
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ── DETAIL / REVIEW VIEW ── */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Detail Header */}
          <div
            className="border border-indigo-100 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm"
            style={{
              background:
                "linear-gradient(to right, #f5f7ff, #ffffff, #f5f7ff)",
            }}
          >
            <div className="flex items-center gap-4 text-slate-900">
              <button
                onClick={() => {
                  setViewMode("list");
                  setSelectedIndent(null);
                  setIsEditing(false);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                title="Back to List"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h3 className="text-xl font-black">
                  {selectedIndent.indentNumber}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {selectedIndent.indentType} Indent · Dept:{" "}
                  {selectedIndent.department} ·{" "}
                  {formatDate(selectedIndent.createdAt)}
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
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-200 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteIndent(selectedIndent._id)}
                    className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-[11px] uppercase hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveIndent(selectedIndent._id)}
                    disabled={processing}
                    className="px-5 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[11px] uppercase shadow hover:bg-emerald-600 transition-all flex items-center gap-2"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    Approve &amp; Generate PO
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={updateIndent}
                    disabled={processing}
                    className="px-5 py-2 bg-indigo-500 text-white rounded-xl font-bold text-[11px] uppercase shadow hover:bg-indigo-600 transition-all flex items-center gap-2"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Store Selection & Approval Notice */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Delivery Store Location
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                >
                  {stores.map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  {stores.length === 0 && (
                    <option value="">No stores configured</option>
                  )}
                </select>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * Address:{" "}
                  {stores.find((s) => s.name === selectedStore)?.address ||
                    "Select a store"}
                </p>
              </div>

              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <TriangleAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="font-medium">
                  Clicking <strong>Approve &amp; Generate PO</strong> will split
                  this indent into separate Draft Purchase Orders grouped by
                  vendor. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Line Items (
                {(isEditing ? editForm.items : selectedIndent.items).length})
              </h4>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-6 text-left">Item</th>
                  <th className="py-3 px-6 text-left hidden md:table-cell">
                    Suggested Vendor / Logic
                  </th>
                  <th className="py-3 px-6 text-right w-36">Qty</th>
                  {isEditing && (
                    <th className="py-3 px-6 text-center w-16">Del</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(isEditing ? editForm.items : selectedIndent.items).map(
                  (item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/30 group/row transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 uppercase text-xs tracking-tight">
                          {item.itemName}
                        </div>
                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                          {item.description || "No description"}
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <div className="text-xs font-semibold text-slate-700">
                          {item.suggestedSupplier?.name ||
                            "Open market / auto-assign"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">
                          {item.reason || "Standard replenishment"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editForm.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-20 px-2 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-right font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all"
                          />
                        ) : (
                          <span className="font-black text-indigo-700 text-base">
                            {item.quantity}
                            <span className="text-[9px] ml-1 font-bold text-slate-400 uppercase tracking-tighter">
                              units
                            </span>
                          </span>
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => {
                              const newItems = editForm.items.filter(
                                (_, i) => i !== idx,
                              );
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors opacity-0 group-hover/row:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndentReview;
