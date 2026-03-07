"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Settings2, Columns } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getISODateIST } from "@/lib/dateUtils";

function ProductConfig({ pageName = "Production" }) {
  const [itemsList, setItemsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    serialNumber: "", // System Serial Number (Rating Plate)
    productName: "",
    productRatings: "", // Full system capacity
    dcBus: "", // Internal DC bus voltage details
    phase: "", // Input/Output phase configuration
    modelAndSeries: "", // Catalogue classification
    specsDetails: "", // Engineering specifications
    status: "Available",
    laborCost: 0,
    overheadCost: 0,
    transferPrice: 0,
  });

  // UI State for Columns
  const [visibleColumns, setVisibleColumns] = useState({
    serialNumber: true,
    productName: true,
    ratings: true,
    config: true,
    model: true,
    status: true,
    actions: true,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/production/products");
      const json = await res.json();
      if (json.success) {
        setItemsList(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredItems = useMemo(() => {
    if (!itemsList) return [];
    const s = searchTerm.toLowerCase();
    return itemsList.filter((item) => {
      return (
        item.serialNumber?.toLowerCase().includes(s) ||
        item.productName?.toLowerCase().includes(s) ||
        item.modelAndSeries?.toLowerCase().includes(s)
      );
    });
  }, [itemsList, searchTerm]);

  const handleAddNew = () => {
    setFormData({
      serialNumber: "",
      productName: "",
      productRatings: "",
      dcBus: "",
      phase: "",
      modelAndSeries: "",
      specsDetails: "",
      status: "Available",
      laborCost: 0,
      overheadCost: 0,
      transferPrice: 0,
    });
    setIsEditing(false);
    setEditingId(null);
    setSaveError("");
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData({
      serialNumber: item.serialNumber || "",
      productName: item.productName || "",
      productRatings: item.productRatings || "",
      dcBus: item.dcBus || "",
      phase: item.phase || "",
      modelAndSeries: item.modelAndSeries || "",
      specsDetails: item.specsDetails || "",
      status: item.status || "Available",
      laborCost: item.laborCost || 0,
      overheadCost: item.overheadCost || 0,
      transferPrice: item.transferPrice || 0,
    });

    setIsEditing(true);
    setEditingId(item._id);
    setSaveError("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product configuration?",
      )
    )
      return;
    try {
      const res = await fetch(`/api/production/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      const payload = { ...formData };
      let url = "/api/production/products";
      let method = "POST";

      if (isEditing) {
        method = "PUT";
        payload._id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save product configuration.");
      }

      fetchProducts();
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Finished Goods Catalog
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Product Config" />
        </div>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Add Product Model
          </button>
        )}
      </div>

      <p className="text-slate-500 text-sm">
        Define top-level finished products, their engineering specifications,
        and system ratings.
      </p>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="block w-full pl-9 pr-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-medium transition-all"
              placeholder="Search serial no, product name, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border text-sm border-slate-100 rounded-2xl shadow-sm overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading product catalog...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Settings2 className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                No finished products found.
              </p>
              <p className="text-slate-400 mt-1 max-w-sm">
                {searchTerm
                  ? "Try adjusting your search filters."
                  : "Start by registering a new product model."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                  {visibleColumns.serialNumber && (
                    <th className="py-4 px-6 whitespace-nowrap">
                      Serial Number
                    </th>
                  )}
                  {visibleColumns.productName && (
                    <th className="py-4 px-6">Product Name</th>
                  )}
                  {visibleColumns.ratings && (
                    <th className="py-4 px-6">Ratings</th>
                  )}
                  {visibleColumns.config && (
                    <th className="py-4 px-6">DC Bus / Phase</th>
                  )}
                  {visibleColumns.model && (
                    <th className="py-4 px-6">Model Series</th>
                  )}
                  {visibleColumns.status && (
                    <th className="py-4 px-6 text-center">Status</th>
                  )}
                  {visibleColumns.actions && (
                    <th className="py-4 px-6 text-right w-24">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {visibleColumns.serialNumber && (
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          {item.serialNumber}
                        </span>
                      </td>
                    )}

                    {visibleColumns.productName && (
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {item.specsDetails}
                        </div>
                      </td>
                    )}

                    {visibleColumns.ratings && (
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">
                          {item.productRatings || "-"}
                        </span>
                      </td>
                    )}

                    {visibleColumns.config && (
                      <td className="py-4 px-6">
                        <div className="text-xs font-medium text-slate-600">
                          {item.dcBus || "-"}{" "}
                          <span className="text-slate-400 mx-1">|</span>{" "}
                          {item.phase || "-"}
                        </div>
                      </td>
                    )}

                    {visibleColumns.model && (
                      <td className="py-4 px-6">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                          {item.modelAndSeries || "-"}
                        </div>
                      </td>
                    )}

                    {visibleColumns.status && (
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            item.status === "Available"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.status === "Buffer"
                                ? "bg-amber-100 text-amber-700"
                                : item.status === "Consumed"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.status || "Available"}
                        </span>
                      </td>
                    )}

                    {visibleColumns.actions && (
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white border text-sm border-slate-200 rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-4xl my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 pb-2 border-b-2 border-indigo-600 inline-block">
                {isEditing ? "Edit Product Model" : "New Product Registration"}
              </h3>
            </div>

            {saveError && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-medium border border-rose-100 flex items-start gap-3">
                <span className="shrink-0">⚠️</span> {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h4 className="font-bold text-slate-800">
                    Identity & Naming
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    System Serial Number (Rating Plate)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TS-ONL-5KVA-001"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-mono uppercase bg-white"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serialNumber: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5KVA Online UPS"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Model & Series (Catalogue)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ProLine Series XT"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.modelAndSeries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modelAndSeries: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h4 className="font-bold text-slate-800">
                    Engineering Specifications
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Ratings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 KVA / 4 KW"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                    value={formData.productRatings}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productRatings: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      DC Bus (VDC)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 192 VDC"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.dcBus}
                      onChange={(e) =>
                        setFormData({ ...formData, dcBus: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Phase (In/Out)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1Ph In / 1Ph Out"
                      className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                      value={formData.phase}
                      onChange={(e) =>
                        setFormData({ ...formData, phase: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Specs Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Granular technical specifications or features"
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white resize-none"
                    value={formData.specsDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, specsDetails: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Master Status
                  </label>
                  <select
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-medium bg-white"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Buffer">Buffer (Pending Trial)</option>
                    <option value="Available">Available (Active)</option>
                    <option value="Consumed">Consumed (Discontinued)</option>
                    <option value="Scrapped">Scrapped</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Update Product Config"
                    : "Save Product Config"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProductConfig;
