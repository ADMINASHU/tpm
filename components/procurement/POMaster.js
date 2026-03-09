"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  Clock,
  ArrowRight,
  Eye,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Printer,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import POPrintTemplate from "./POPrintTemplate";

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(dateStr));

export default function POMaster() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // 'list', 'detail'
  const [selectedPO, setSelectedPO] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procurement/orders");
      const data = await res.json();
      if (data.success) {
        setPos(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-slate-100 text-slate-600";
      case "Issued":
        return "bg-amber-100 text-amber-700";
      case "Fulfilled":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const calculateTotal = (items) => {
    let rawTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.agreedRate;
      const calcTax = lineTotal * (item.taxPercent / 100);
      rawTotal += lineTotal;
      taxTotal += calcTax;
    });

    return {
      subtotal: rawTotal,
      tax: taxTotal,
      grandTotal: rawTotal + taxTotal,
    };
  };

  const handleEditChange = (index, field, value) => {
    const updatedItems = [...editForm.items];
    updatedItems[index][field] = value;
    setEditForm({ ...editForm, items: updatedItems });
  };

  const saveChanges = async () => {
    setSubmitting(true);
    try {
      // Recalculate total amount before saving
      const totals = calculateTotal(editForm.items);

      const payload = {
        items: editForm.items,
        totalAmount: totals.grandTotal,
      };

      const res = await fetch(`/api/procurement/orders/${selectedPO._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Purchase order updated successfully",
        });
        setSelectedPO(data.data);
        setIsEditing(false);
        fetchPOs(); // Refresh list background
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update PO",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "An error occurred" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePO = async (id) => {
    if (
      !confirm(
        "Are you sure you want to cancel and delete this Purchase Order?",
      )
    )
      return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/procurement/orders/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: "Purchase Order deleted successfully",
        });
        setViewMode("list");
        fetchPOs();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!printRef.current) return null;
    try {
      // We use onclone to remove global stylesheets that might contain modern CSS (like 'lab()' or 'oklch()')
      // which html2canvas 1.4.1 doesn't support. Since POPrintTemplate uses inline styles,
      // it will still render correctly without the global Tailwind CSS.
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const styleSheets = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]',
          );
          styleSheets.forEach((s) => s.remove());
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      return pdf;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      return null;
    }
  };

  const downloadPO = async () => {
    setSubmitting(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(`PurchaseOrder_${selectedPO.poNumber}.pdf`);
        setMessage({ type: "success", text: "PDF downloaded successfully" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to generate PDF" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const emailVendor = async (id) => {
    setSubmitting(true);
    try {
      // Generate PDF first to attach to email
      const pdf = await generatePDF();
      let pdfBase64 = null;
      if (pdf) {
        pdfBase64 = pdf.output("datauristring").split(",")[1];
      }

      const res = await fetch(`/api/procurement/orders/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf: pdfBase64 }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: "Purchase Order sent to vendor with PDF attachment",
        });
        fetchPOs(); // Refresh to get updated status
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to send email",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Connection error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPOs = pos.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center justify-between mb-4 sticky top-4 z-50 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {viewMode === "list" ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by PO Number or Vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Issued">Issued</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Order details
                  </th>
                  <th className="text-left py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Vendor
                  </th>
                  <th className="text-center py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Total Amount
                  </th>
                  <th className="text-center py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-12 text-center text-slate-500 font-medium"
                    >
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                    <tr
                      key={po._id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedPO(po);
                        setViewMode("detail");
                      }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-black text-indigo-900 group-hover:text-indigo-600 transition-colors">
                              {po.poNumber}
                            </div>
                            <div className="text-xs font-semibold text-slate-400 mt-0.5">
                              {formatDate(po.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-slate-800">
                          {po.supplierId?.name || "Unknown Supplier"}
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          {po.items?.length || 0} line items
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${getStatusColor(
                            po.status,
                          )}`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="text-base font-black text-slate-800">
                          ₹{po.totalAmount?.toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPO(po);
                            setViewMode("detail");
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* DETAIL VIEW */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            className="border border-indigo-100 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm"
            style={{
              background:
                "linear-gradient(to right, #f5f7ff, #ffffff, #f5f7ff)",
            }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setViewMode("list");
                  setSelectedPO(null);
                  setIsEditing(false);
                }}
                className="p-2 hover:bg-indigo-100 rounded-xl transition-colors text-indigo-600"
                title="Back to List"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedPO.poNumber}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${getStatusColor(
                      selectedPO.status,
                    )}`}
                  >
                    {selectedPO.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Vendor: {selectedPO.supplierId?.name || "Unknown"} •{" "}
                  {formatDate(selectedPO.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm(JSON.parse(JSON.stringify(selectedPO)));
                    }}
                    className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-200 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePO(selectedPO._id)}
                    className="px-5 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-[11px] uppercase hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    disabled={submitting}
                    className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View PO
                  </button>

                  <button
                    onClick={() => emailVendor(selectedPO._id)}
                    disabled={submitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase shadow hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Email Vendor
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[11px] uppercase hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={submitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase shadow hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    {submitting ? (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                  Line Items
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4 text-right">Rate</th>
                        <th className="py-3 px-4 text-right">Tax (%)</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(isEditing ? editForm.items : selectedPO.items).map(
                        (item, idx) => {
                          const lineTotal = item.quantity * item.agreedRate;
                          const taxAmt = lineTotal * (item.taxPercent / 100);
                          const grossTotal = lineTotal + taxAmt;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-800 uppercase text-xs">
                                  {item.itemName}
                                </div>
                                {item.supplierItemName && (
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    Vendor SKU: {item.supplierItemName}
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleEditChange(
                                        idx,
                                        "quantity",
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-20 px-2 py-1 bg-slate-50 border rounded-lg text-right font-bold text-indigo-600 outline-none focus:border-indigo-500"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-700">
                                    {item.quantity}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={item.agreedRate}
                                    onChange={(e) =>
                                      handleEditChange(
                                        idx,
                                        "agreedRate",
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-24 px-2 py-1 bg-slate-50 border rounded-lg text-right font-bold text-slate-700 outline-none focus:border-indigo-500"
                                  />
                                ) : (
                                  <span className="text-slate-600 font-medium">
                                    ₹{item.agreedRate}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right text-slate-500 text-xs">
                                {item.taxPercent}%
                              </td>
                              <td className="py-4 px-4 text-right font-black text-indigo-700">
                                ₹
                                {grossTotal.toLocaleString("en-IN", {
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-100/50">
                <h5 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-4">
                  Order Summary
                </h5>

                <div className="space-y-3">
                  {(() => {
                    const totals = calculateTotal(
                      isEditing ? editForm.items : selectedPO.items,
                    );
                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium">
                            Subtotal
                          </span>
                          <span className="text-slate-800 font-bold">
                            ₹
                            {totals.subtotal.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium">
                            Estimated Tax
                          </span>
                          <span className="text-slate-800 font-bold">
                            ₹
                            {totals.tax.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-indigo-200/50 flex justify-between items-center">
                          <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                            Grand Total
                          </span>
                          <span className="text-xl font-black text-indigo-700">
                            ₹
                            {totals.grandTotal.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Vendor Details
                </h5>
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-slate-800">
                    {selectedPO.supplierId?.name || "Unknown Vendor"}
                  </p>
                  <p className="text-slate-600">
                    {selectedPO.supplierId?.primaryContactName}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {selectedPO.supplierId?.primaryContactEmail}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {selectedPO.supplierId?.primaryContactPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hidden PDF Template for generation */}
      {selectedPO && (
        <POPrintTemplate ref={printRef} po={selectedPO} hidden={true} />
      )}

      {/* Preview Modal */}
      {showPreview && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900">
                  Purchase Order Preview
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {selectedPO.poNumber}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadPO}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 flex justify-center">
              <div className="shadow-2xl scale-[0.85] origin-top transition-transform transform-gpu">
                <POPrintTemplate po={selectedPO} hidden={false} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase hover:bg-slate-300 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
