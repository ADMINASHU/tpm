import { useState, useEffect } from "react";
import { Search, Plus, Calendar, Package, AlertCircle, CheckCircle2, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

function StockOverview({ pageName = "Inventory" }) {
  const [items, setItems] = useState([]);
  const [itemsWithLogs, setItemsWithLogs] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // Form state for opening stock
  const [openingQty, setOpeningQty] = useState("");
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const [resItems, resLogs] = await Promise.all([
        fetch("/api/production/items"),
        fetch("/api/inventory/transactions?summary=true")
      ]);

      const jsonItems = await resItems.json();
      const jsonLogs = await resLogs.json();

      if (jsonItems.success) {
        setItems(jsonItems.items || []);
      }
      if (jsonLogs.success) {
        setItemsWithLogs(new Set(jsonLogs.itemIds || []));
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredItems = items.filter(item =>
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setOpeningQty(item.openingStock || "");
    setOpeningDate(item.openingStockDate ? new Date(item.openingStockDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setSaveStatus(null);
    setShowModal(true);
  };

  const handleSaveOpeningStock = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Calculate quantity adjustment
      const oldOpening = selectedItem.openingStock || 0;
      const newOpening = parseFloat(openingQty) || 0;
      const diff = newOpening - oldOpening;

      const res = await fetch("/api/production/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedItem._id,
          openingStock: newOpening,
          openingStockDate: openingDate,
          currentQuantity: (selectedItem.currentQuantity || 0) + diff
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveStatus({ type: 'success', message: "Opening stock updated successfully." });
        setTimeout(() => {
          setShowModal(false);
          fetchStock();
        }, 1500);
      } else {
        setSaveStatus({ type: 'error', message: json.error || "Failed to update stock." });
      }
    } catch (error) {
      setSaveStatus({ type: 'error', message: "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Stock Overview</h2>
          <Breadcrumb pageName={pageName} subPageName="Stock Overview" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Total Unique Items:{" "}
            <span className="font-bold text-slate-900 text-lg">{items.length}</span>
          </p>
        </div>
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

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <th className="py-4 px-6">Item Identity</th>
              <th className="py-4 px-6">Category & Make</th>
              <th className="py-4 px-6 text-right">Qty Available</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Fetching inventory data...</p>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center text-slate-400 italic">
                  No items found matching your search.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-indigo-600 text-xs">
                        {item.itemCode}
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5">
                        {item.itemName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">
                        {item.make || "General"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`text-base font-black ${(item.currentQuantity || 0) <= (item.minStockLevel || 0)
                      ? 'text-rose-600'
                      : (item.currentQuantity || 0) > (item.maxStockLevel || 1000)
                        ? 'text-indigo-600'
                        : 'text-emerald-600'
                      }`}>
                      {Number(item.currentQuantity || 0).toLocaleString()}
                      <span className="text-[10px] ml-1 font-bold text-slate-400 uppercase">{item.baseUom || "Nos"}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!itemsWithLogs.has(item._id) && (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Plus className="w-3.5 h-3.5" /> Opening Stock
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Opening Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Set Opening Stock
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOpeningStock} className="p-6 space-y-5">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Item Identity</p>
                <p className="text-sm font-black text-indigo-900">{selectedItem?.itemName}</p>
                <p className="text-[11px] font-mono text-indigo-600 mt-0.5">{selectedItem?.itemCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="qty" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> Quantity
                  </label>
                  <input
                    id="qty"
                    type="number"
                    step="any"
                    required
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="Enter qty..."
                    value={openingQty}
                    onChange={(e) => setOpeningQty(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="date" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Entry Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    className="block w-full px-4 py-2.5 rounded-xl border-0 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {saveStatus && (
                <div className={`flex items-start gap-3 p-4 rounded-xl ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                  {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <p className="text-sm font-semibold">{saveStatus.message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-3 px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center shadow-md shadow-indigo-200 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Save Stock Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default StockOverview;

