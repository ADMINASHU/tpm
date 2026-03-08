"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Search,
  Database,
  TrendingUp,
  Check,
  AlertCircle,
  Trash2,
  Edit,
  X,
  Plus,
  ArrowLeft,
  History,
  DollarSign,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
} from "recharts";

function SupplierConfig({ pageName = "Procurement" }) {
  // Main View States
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  // Supplier Form State
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    supplierCode: "",
    contactEmail: "",
    gstNumber: "",
    address: "",
    contactPerson: "",
    phone: "",
    jurisdiction: "",
    priceBasis: "",
    packingInstructions: "",
    inspectionTerms: "",
    paymentTerms: "",
    paymentTermsDays: 30,
    status: "Approved",
  });

  // Rate Card Management States
  const [selectedSupplier, setSelectedSupplier] = useState(null); // Supplier object
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isMapItemModalOpen, setIsMapItemModalOpen] = useState(false);

  // Map Item Form State
  const [rateForm, setRateForm] = useState({
    itemId: "",
    itemName: "",
    itemCode: "",
    category: "",
    searchQuery: "",
    supplierItemName: "",
    hsnCode: "",
    currency: "INR",
    agreedRate: "",
    leadTime: 7,
    isPreferred: false,
    showDropdown: false,
  });

  // Search Items List
  const [itemsList, setItemsList] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Price Trend Modal
  const [trendItem, setTrendItem] = useState(null); // { item, history }
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/config/component");
      const json = await res.json();
      if (json.success && json.data) {
        setAvailableCategories(json.data.categories || []);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/procurement/suppliers");
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/procurement/suppliers/${editingId}`
        : "/api/procurement/suppliers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
      const data = await res.json();

      if (data.success) {
        setSaveMessage({
          type: "success",
          text: isEditing
            ? "Supplier updated successfully!"
            : "Supplier registered successfully!",
        });
        fetchSuppliers();
        setNewSupplier({
          name: "",
          supplierCode: "",
          contactEmail: "",
          gstNumber: "",
          address: "",
          contactPerson: "",
          phone: "",
          jurisdiction: "",
          priceBasis: "",
          packingInstructions: "",
          inspectionTerms: "",
          paymentTerms: "",
          paymentTermsDays: 30,
          status: "Approved",
        });
        setShowForm(false);
        setIsEditing(false);
        setEditingId(null);
      } else {
        setSaveMessage({
          type: "error",
          text: data.error || "Execution failed",
        });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Connection error" });
    }
  };

  const handleEdit = (supplier) => {
    setNewSupplier({
      name: supplier.name || "",
      supplierCode: supplier.supplierCode || "",
      contactEmail: supplier.contactEmail || "",
      gstNumber: supplier.gstNumber || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      jurisdiction: supplier.jurisdiction || "",
      priceBasis: supplier.priceBasis || "",
      packingInstructions: supplier.packingInstructions || "",
      inspectionTerms: supplier.inspectionTerms || "",
      paymentTerms: supplier.paymentTerms || "",
      paymentTermsDays: supplier.paymentTermsDays || 30,
      status: supplier.status || "Approved",
    });
    setEditingId(supplier._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This will also remove all mapped items and rates.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/procurement/suppliers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: "success", text: "Supplier removed" });
        fetchSuppliers();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Search Items Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger search if query exists OR if a category is selected (to show items in that category)
      if (rateForm.searchQuery.length > 1 || rateForm.category) {
        searchItems();
      } else if (!rateForm.searchQuery && !rateForm.category) {
        setItemsList([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rateForm.searchQuery, rateForm.category]);

  const searchItems = async () => {
    try {
      setIsLoadingItems(true);
      const query = encodeURIComponent(rateForm.searchQuery || "");

      // Search from both ComponentConfig and SpareConfig
      const [compRes, spareRes] = await Promise.all([
        fetch(`/api/production/config/components?search=${query}`),
        fetch(`/api/production/config/spares?search=${query}`)
      ]);

      const compData = await compRes.json();
      const spareData = await spareRes.json();

      let combined = [];
      if (compData.success) {
        combined = [...combined, ...compData.data.map(c => ({ ...c, configModel: "ComponentConfig" }))];
      }
      if (spareData.success) {
        combined = [...combined, ...spareData.data.map(s => ({ ...s, configModel: "SpareConfig" }))];
      }

      // Filter by category if selected
      if (rateForm.category) {
        combined = combined.filter(c => c.category?.toLowerCase() === rateForm.category.toLowerCase());
      }

      setItemsList(combined);
    } catch (error) {
      console.error("Item search failed:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleMapItem = async () => {
    if (!rateForm.itemId || !rateForm.agreedRate) return;
    try {
      const res = await fetch(
        `/api/procurement/suppliers/${selectedSupplier._id}/rates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            configId: rateForm.configId,
            configModel: rateForm.configModel,
            agreedRate: parseFloat(rateForm.agreedRate),
            supplierItemName: rateForm.supplierItemName,
            hsnCode: rateForm.hsnCode,
            currency: rateForm.currency,
            leadTime: parseInt(rateForm.leadTime),
            isPreferred: rateForm.isPreferred,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setIsMapItemModalOpen(false);
        // Refresh supplier details to show new rate
        const updatedSupplier = data.data;
        setSelectedSupplier(updatedSupplier);
        setSuppliers(
          suppliers.map((s) =>
            s._id === updatedSupplier._id ? updatedSupplier : s,
          ),
        );
        setRateForm({
          configId: "",
          configModel: "",
          itemName: "",
          itemCode: "",
          searchQuery: "",
          supplierItemName: "",
          hsnCode: "",
          currency: "INR",
          agreedRate: "",
          leadTime: 7,
          isPreferred: false,
          showDropdown: false,
        });
      }
    } catch (error) {
      console.error("Failed to map item:", error);
    }
  };

  const handleDeleteRate = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this item mapping?"))
      return;

    try {
      const res = await fetch(
        `/api/procurement/suppliers/${selectedSupplier._id}/rates?configId=${configId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (data.success) {
        const updatedSupplier = data.data;
        setSelectedSupplier(updatedSupplier);
        setSuppliers(
          suppliers.map((s) =>
            s._id === updatedSupplier._id ? updatedSupplier : s,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to delete rate:", error);
    }
  };

  const stars = (n) =>
    "★".repeat(Math.round(n || 0)) + "☆".repeat(5 - Math.round(n || 0));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600 h-6 w-6" />
            Approved Supplier Directory
          </h2>
          <Breadcrumb pageName={pageName} subPageName="Supplier Config" />
        </div>
        {!isRateModalOpen && (
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setNewSupplier({
                name: "",
                supplierCode: "",
                contactEmail: "",
                gstNumber: "",
                address: "",
                contactPerson: "",
                phone: "",
                jurisdiction: "",
                priceBasis: "",
                packingInstructions: "",
                inspectionTerms: "",
                paymentTerms: "",
                paymentTermsDays: 30,
                status: "Approved",
              });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        )}
      </div>

      {saveMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${saveMessage.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
        >
          {saveMessage.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {saveMessage.text}
          <button
            onClick={() => setSaveMessage({ type: "", text: "" })}
            className="ml-auto opacity-50 hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Supplier Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowForm(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {isEditing ? "Edit Supplier Profile" : "Register New Supplier"}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <form
                    onSubmit={handleSaveSupplier}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                  >
                    {/* Basic Information Section */}
                    <div className="md:col-span-2">
                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Basic Identity</h4>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, name: e.target.value })
                        }
                        placeholder="Legal Entity Name"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="md:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Supplier Code
                      </label>
                      <input
                        type="text"
                        value={newSupplier.supplierCode}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            supplierCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g. VEND-001"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border font-mono uppercase"
                        required
                      />
                    </div>

                    <div className="md:col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        GST / Tax ID
                      </label>
                      <input
                        type="text"
                        value={newSupplier.gstNumber}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            gstNumber: e.target.value,
                          })
                        }
                        placeholder="GSTIN Number"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>

                    {/* Contact Information Section */}
                    <div className="md:col-span-2 pt-2">
                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Contact Details</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={newSupplier.contactPerson}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                        }
                        placeholder="Name of Key Contact"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        value={newSupplier.contactEmail}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            contactEmail: e.target.value,
                          })
                        }
                        placeholder="sales@vendor.com"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={newSupplier.phone}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, phone: e.target.value })
                        }
                        placeholder="+91-XXXXXXXXXX"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={newSupplier.jurisdiction}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, jurisdiction: e.target.value })
                        }
                        placeholder="e.g. Bangalore"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Full Registered Address
                      </label>
                      <textarea
                        rows="2"
                        value={newSupplier.address}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, address: e.target.value })
                        }
                        placeholder="Office No, Street, City, ZIP..."
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border resize-none"
                      />
                    </div>

                    {/* Procurement Terms Section */}
                    <div className="md:col-span-2 pt-2">
                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Commercial & Logistics</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Price Basis
                      </label>
                      <input
                        type="text"
                        value={newSupplier.priceBasis}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, priceBasis: e.target.value })
                        }
                        placeholder="e.g. FOR Destination / Ex-Works"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Payment Terms (Days)
                      </label>
                      <input
                        type="number"
                        value={newSupplier.paymentTermsDays}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            paymentTermsDays: parseInt(e.target.value),
                          })
                        }
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Packing Instructions
                      </label>
                      <textarea
                        rows="2"
                        value={newSupplier.packingInstructions}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, packingInstructions: e.target.value })
                        }
                        placeholder="e.g. No plastic / Use corrugated boxes"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border resize-none"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Inspection Terms
                      </label>
                      <input
                        type="text"
                        value={newSupplier.inspectionTerms}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, inspectionTerms: e.target.value })
                        }
                        placeholder="e.g. At Our Works / Third-party"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Payment Terms (Descriptive)
                      </label>
                      <input
                        type="text"
                        value={newSupplier.paymentTerms}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })
                        }
                        placeholder="e.g. 60 DAYS FROM THE DATE OF DELIVERY"
                        className="block w-full rounded-xl border-slate-200 py-2.5 px-4 text-sm shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none border"
                      />
                    </div>


                    <div className="md:col-span-2 space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">
                        Vendor Status
                      </label>
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="status"
                            checked={newSupplier.status === "Approved"}
                            onChange={() => setNewSupplier({ ...newSupplier, status: "Approved" })}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className={`text-sm font-bold ${newSupplier.status === "Approved" ? "text-emerald-700" : "text-slate-500 group-hover:text-slate-700"}`}>Approved</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="status"
                            checked={newSupplier.status === "Blocked"}
                            onChange={() => setNewSupplier({ ...newSupplier, status: "Blocked" })}
                            className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                          />
                          <span className={`text-sm font-bold ${newSupplier.status === "Blocked" ? "text-rose-700" : "text-slate-500 group-hover:text-slate-700"}`}>Blocked</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        {isEditing ? "Update Profile" : "Complete Registration"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Table */}
      {!loading && !isRateModalOpen && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Supplier / Code
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mapped Items
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 capitalize">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono uppercase">
                          {s.supplierCode || "NO-CODE"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Mail className="w-3 h-3" /> {s.contactEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-amber-500 font-bold tracking-tight text-sm">
                        {stars(s.performance?.calculatedStars || 5)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                        Qual: {s.performance?.qualityScore || 100}% • Del:{" "}
                        {s.performance?.deliveryScore || 100}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-xs border border-indigo-100">
                          {s.agreedProducts?.length || 0} Items
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.status === "Blocked"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                        {s.status || "Approved"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Supplier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(s._id, s.name)
                          }
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSupplier(s);
                            setIsRateModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          Manage Rates
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center">
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        No suppliers found. Click "Add Supplier" to register
                        one.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Rate Card Management View */}
      {isRateModalOpen && selectedSupplier && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <button
            onClick={() => setIsRateModalOpen(false)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Supplier Info Sidebar */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedSupplier.name}
                  </h3>
                  <div className="text-indigo-600 text-xs font-bold uppercase mt-1 px-2 py-0.5 bg-indigo-50 inline-block rounded">
                    {selectedSupplier.category}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Email
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        {selectedSupplier.contactEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Status
                      </div>
                      <div className="text-sm font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded">
                        Approved Vendor
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Payment Terms
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        {selectedSupplier.paymentTermsDays} Days Net
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-100" />
                  Quick Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-indigo-100 uppercase">
                      Rate Stability
                    </div>
                    <div className="text-xl font-bold">
                      {selectedSupplier.performance?.priceStability || 100}%
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-indigo-100 uppercase">
                      Avg Lead Time
                    </div>
                    <div className="text-xl font-bold">12 Days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rates Table Section */}
            <div className="flex-1 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Contractual Item Mappings
                  </h3>
                  <button
                    onClick={() => setIsMapItemModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
                  >
                    + Map New Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Internal Item</th>
                        <th className="px-6 py-3">Supplier Alias</th>
                        <th className="px-6 py-3">Contract Rate</th>
                        <th className="px-6 py-3 text-right text-slate-700 bg-indigo-50/30">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSupplier.agreedProducts?.map((product, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">
                              {product.configId?.itemCode}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {product.configId?.itemName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-semibold text-slate-700">
                              {product.supplierItemName || "-"}
                            </div>
                            {product.hsnCode && (
                              <div className="text-[10px] text-slate-400">
                                HSN: {product.hsnCode}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-900">
                              {product.currency || "INR"}{" "}
                              {product.agreedRate?.toLocaleString()}
                            </div>
                            {product.isPreferred && (
                              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Preferred
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  const history =
                                    selectedSupplier.priceHistory?.filter(
                                      (h) => h.configId === (product.configId?._id || product.configId),
                                    );
                                  setTrendItem({
                                    item: product.configId,
                                    history: history || [],
                                  });
                                  setIsTrendModalOpen(true);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                title="Price Trend Analysis"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRateForm({
                                    configId: product.configId?._id || product.configId,
                                    configModel: product.configModel,
                                    itemName: product.configId?.itemName,
                                    itemCode: product.configId?.itemCode,
                                    searchQuery: `${product.configId?.itemCode} - ${product.configId?.itemName}`,
                                    supplierItemName:
                                      product.supplierItemName || "",
                                    hsnCode: product.hsnCode || "",
                                    currency: product.currency || "INR",
                                    agreedRate: (
                                      product.agreedRate || 0
                                    ).toString(),
                                    leadTime: product.leadTime || 7,
                                    isPreferred: product.isPreferred || false,
                                    showDropdown: false,
                                  });
                                  setIsMapItemModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteRate(product.configId?._id || product.configId)
                                }
                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove Mapping"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {selectedSupplier.agreedProducts?.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-20 text-center text-slate-400 italic"
                          >
                            No items mapped to this supplier yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map New Item Modal */}
      {isMapItemModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMapItemModalOpen(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-visible shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white rounded-2xl">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Configure Item Rate
                  </h3>
                  <button
                    onClick={() => setIsMapItemModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block px-1">
                      Component Category
                    </label>
                    <select
                      value={rateForm.category}
                      onChange={(e) => setRateForm({ ...rateForm, category: e.target.value, itemId: "", searchQuery: "", showDropdown: true })}
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all bg-white"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block px-1">
                      Internal Component Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Item Code or Name..."
                        value={rateForm.searchQuery}
                        onChange={(e) =>
                          setRateForm({
                            ...rateForm,
                            searchQuery: e.target.value,
                            showDropdown: true,
                          })
                        }
                        onFocus={() =>
                          setRateForm({ ...rateForm, showDropdown: true })
                        }
                        className={`block w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all ${rateForm.itemId
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-white border-slate-200"
                          }`}
                      />
                      {rateForm.showDropdown && (
                        <div
                          className="absolute z-50 mt-1 w-full bg-white shadow-2xl rounded-xl py-2 text-sm ring-1 ring-black/5 max-h-60 overflow-y-auto"
                          onMouseLeave={() =>
                            setRateForm({ ...rateForm, showDropdown: false })
                          }
                        >
                          {isLoadingItems ? (
                            <div className="px-4 py-3 text-slate-500 italic">
                              Searching master DB...
                            </div>
                          ) : (
                            (itemsList || []).map((item) => (
                              <div
                                key={item._id}
                                onClick={() =>
                                  setRateForm({
                                    ...rateForm,
                                    configId: item._id,
                                    configModel: item.configModel,
                                    itemName: item.itemName,
                                    itemCode: item.itemCode,
                                    hsnCode: item.hsnCode || "",
                                    searchQuery: `${item.itemCode} - ${item.itemName}`,
                                    showDropdown: false,
                                  })
                                }
                                className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0"
                              >
                                <div className="font-bold text-slate-900">
                                  {item.itemCode}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {item.itemName}
                                </div>
                              </div>
                            ))
                          )}
                          {!isLoadingItems &&
                            (itemsList || []).length === 0 && (
                              <div className="px-4 py-3 text-slate-500 text-center">
                                No components found
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Agreed Unit Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={rateForm.agreedRate}
                        onChange={(e) =>
                          setRateForm({
                            ...rateForm,
                            agreedRate: e.target.value,
                          })
                        }
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Currency
                      </label>
                      <select
                        value={rateForm.currency}
                        onChange={(e) =>
                          setRateForm({ ...rateForm, currency: e.target.value })
                        }
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                      >
                        <option>INR</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        HSN / SAC Code
                      </label>
                      <input
                        type="text"
                        placeholder="Tax Code"
                        value={rateForm.hsnCode}
                        onChange={(e) =>
                          setRateForm({ ...rateForm, hsnCode: e.target.value })
                        }
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Supplier Alias Part Name
                    </label>
                    <input
                      type="text"
                      placeholder="Vendor's specific identification"
                      value={rateForm.supplierItemName}
                      onChange={(e) =>
                        setRateForm({
                          ...rateForm,
                          supplierItemName: e.target.value,
                        })
                      }
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="preferred"
                      checked={rateForm.isPreferred}
                      onChange={(e) =>
                        setRateForm({
                          ...rateForm,
                          isPreferred: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    <label
                      htmlFor="preferred"
                      className="text-xs font-bold text-slate-700"
                    >
                      Set as Preferred Vendor for this item
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-end gap-3">
                  <button
                    onClick={() => setIsMapItemModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleMapItem}
                    disabled={!rateForm.itemId || !rateForm.agreedRate}
                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                  >
                    Confirm Mapping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Trend Modal */}
      {isTrendModalOpen && trendItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsTrendModalOpen(false)}
            ></div>
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Commercial Price History
                  </h3>
                  <div className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mt-1">
                    <Database className="w-3 h-3" /> {trendItem.item?.itemCode}{" "}
                    • {trendItem.item?.itemName}
                  </div>
                </div>
                <button
                  onClick={() => setIsTrendModalOpen(false)}
                  className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="h-[300px] mb-8">
                  {trendItem.history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={trendItem.history.map((h, idx) => ({
                          date: new Date(h.changedAt).toLocaleDateString(
                            "en-IN",
                            { month: "short", day: "numeric" },
                          ),
                          rate: h.newRate,
                          oldRate: h.oldRate,
                        }))}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                            fontWeight: 600,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                            fontWeight: 600,
                          }}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                          }}
                          labelStyle={{
                            fontWeight: 800,
                            color: "#1e293b",
                            marginBottom: "4px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#4f46e5"
                          strokeWidth={4}
                          dot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <History className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-500">
                        No historical price points available yet.
                      </p>
                      <p className="text-xs text-slate-400 px-12 text-center mt-1">
                        Updates to the contract rate will automatically appear
                        here to track inflation.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Audit Log
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {[...trendItem.history].reverse().map((log, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm border border-slate-100/50"
                      >
                        <div className="flex gap-4 items-center">
                          <div
                            className={`p-1.5 rounded-lg ${log.newRate > log.oldRate ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                          >
                            <TrendingUp
                              className={`w-3.5 h-3.5 ${log.newRate < log.oldRate ? "rotate-90" : ""}`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-700">
                              ₹{(log.newRate || 0).toLocaleString()}{" "}
                              <span className="text-[10px] text-slate-400 mx-1">
                                from
                              </span>{" "}
                              <span className="text-slate-500 font-medium line-through">
                                ₹{(log.oldRate || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(log.changedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] bg-white px-2 py-1 rounded-md border border-slate-200 font-bold text-slate-500 uppercase tracking-tight">
                          System Ref: #{log._id?.slice(-4)}
                        </div>
                      </div>
                    ))}
                    {trendItem.history.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-4">
                        No logged changes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierConfig;
