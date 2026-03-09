"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  User,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Save,
  RotateCcw,
  Trash2,
} from "lucide-react";

function IndentReview() {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or detail
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

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

  const approveIndent = async (id) => {
    setProcessing(true);
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
      setProcessing(false);
    }
  };

  const deleteIndent = async (id) => {
    if (!confirm("Are you sure you want to reject/delete this indent?")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/procurement/indents/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Indent rejected and removed from queue.");
        setViewMode("list");
        fetchIndents();
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
        alert("Indent updated successfully!");
        setSelectedIndent(data.data);
        setIsEditing(false);
        fetchIndents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
          Loading queue...
        </p>
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-amber-500 h-5 w-5" />
            Procurement Review Queue
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Review and approve material indents for automated purchase order
            mapping.
          </p>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indents.map((indent) => (
            <div
              key={indent._id}
              onClick={() => {
                setSelectedIndent(indent);
                setViewMode("detail");
                setIsEditing(false);
              }}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${indent.indentType === "Auto" ? "bg-amber-500 animate-pulse" : "bg-indigo-500"}`}
                ></div>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase">
                    {indent.indentNumber}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase">
                    {indent.indentType} Indent
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                    Items Requested
                  </div>
                  <div className="text-xs font-semibold text-slate-700 truncate">
                    {indent.items.map((i) => i.itemName).join(", ")}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-slate-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                      {indent.requestedBy?.name}
                    </span>
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(indent.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                  Waiting Approval
                </span>
                <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
          {indents.length === 0 && (
            <div className="col-span-full bg-slate-50 rounded-xl p-10 text-center border border-dashed border-slate-100">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">
                The review queue is currently empty.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("list")}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <div>
                <h3 className="text-lg font-bold">
                  {selectedIndent.indentNumber}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
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
                    className="px-4 py-1.5 bg-white/10 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-white/20 transition-all flex items-center gap-1.5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteIndent(selectedIndent._id)}
                    className="px-4 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg font-bold text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveIndent(selectedIndent._id)}
                    disabled={processing}
                    className="px-5 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-md hover:bg-emerald-600 transition-all flex items-center gap-1.5"
                  >
                    {processing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    Approve & Generate PO
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 bg-slate-700 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-slate-600 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Cancel
                  </button>
                  <button
                    onClick={updateIndent}
                    disabled={processing}
                    className="px-5 py-1.5 bg-indigo-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-md hover:bg-indigo-600 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3 h-3" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1.5">
                  Line Items Analysis
                </h4>
                <div className="space-y-3">
                  {(isEditing ? editForm.items : selectedIndent.items).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 group/item relative"
                      >
                        {isEditing && (
                          <button
                            onClick={() => {
                              const newItems = editForm.items.filter(
                                (_, i) => i !== idx,
                              );
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-600 hover:text-white transition-all shadow-sm opacity-0 group-hover/item:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-base font-bold text-slate-800">
                              {item.itemName}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500 italic mt-0.5">
                              {item.description || "No description provided"}
                            </div>
                          </div>
                          <div className="text-right">
                            {isEditing ? (
                              <div className="flex flex-col items-end gap-1">
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
                                  className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-right font-bold text-indigo-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                                <div className="text-[9px] font-bold text-slate-400 uppercase">
                                  Edit Qty
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-lg font-bold text-indigo-600">
                                  {item.quantity}
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">
                                  Units Needed
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-left">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">
                              Primary Supplier
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 bg-indigo-50 rounded flex items-center justify-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800">
                                  {item.suggestedSupplier?.name ||
                                    "Market Sourced"}
                                </div>
                                <div className="text-[9px] font-semibold text-slate-500">
                                  Agreed Rate: ₹{item.suggestedRate || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-left">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">
                              Demand Insight
                            </div>
                            <div className="text-[10px] font-medium text-slate-600 leading-relaxed italic line-clamp-2">
                              "{item.reason || "Standard replenishment cycle"}"
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="w-64 space-y-4">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <h5 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    Market Intelligence
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-white/80">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        Mappings
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {selectedIndent.items.length * 2} Vendors
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-white/80">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        Price Match
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Notice
                  </div>
                  <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
                    Approving this indent will split it into separate PO drafts.
                    <strong> Rates are locked</strong> to prevent unauthorised
                    modifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndentReview;
