"use client";

import { useState, useEffect } from "react";
import { Database } from "lucide-react";

function BOMConfig() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [targetProduct, setTargetProduct] = useState("");
  const [materials, setMaterials] = useState([]);

  const handleAddMaterial = (e) => {
    e.preventDefault();
    setMaterials([...materials, { name: "New Component", qty: 1 }]);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Database className="mr-2 text-indigo-600 h-6 w-6" />
          Master BOM Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define ratio mappings for Spare Parts (PCBs) and Finished Products.
        </p>
      </div>

      <div
        className={`bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 transition-all ${isInitialized ? "opacity-50 pointer-events-none" : ""}`}
      >
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Create New BOM
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={targetProduct}
            onChange={(e) => setTargetProduct(e.target.value)}
            placeholder="Target Product Name"
            className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
          />
          <select className="block w-full rounded-xl border-0 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600">
            <option>Finished_Product</option>
            <option>Spare_Part</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              if (targetProduct) setIsInitialized(true);
            }}
            className={`font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${targetProduct
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            disabled={!targetProduct}
          >
            Initialize BOM Recipe
          </button>
        </div>
      </div>

      {isInitialized && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-indigo-50 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recipe: <span className="text-indigo-600">{targetProduct}</span>
              </h3>
              <p className="text-sm text-slate-500">
                Add required components and quantities for one unit.
              </p>
            </div>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              + Add Item
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-indigo-50/50 rounded-xl border border-dashed border-indigo-100 mb-6">
              <Database className="w-8 h-8 text-indigo-300 mb-2" />
              <p className="text-sm text-indigo-900 font-semibold mb-1">
                BOM is empty
              </p>
              <p className="text-xs text-indigo-700/70 max-w-xs">
                Click "Add Item" to start appending components and raw materials
                to this recipe.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-12 gap-3 px-3">
                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Item Code
                </span>
                <span className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </span>
                <span className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Legend (e.g. C12)
                </span>
                <span className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Qty Req
                </span>
                <span className="col-span-1"></span>
              </div>
              {materials.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2 pl-3 rounded-lg border border-slate-100 group"
                >
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="COMP-001"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 uppercase"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Component description"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="R1, C2 (optional)"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 uppercase"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      defaultValue={m.qty}
                      min="1"
                      className="block w-full rounded-md border-0 py-1.5 px-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() =>
                        setMaterials(materials.filter((_, idx) => idx !== i))
                      }
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setIsInitialized(false);
                setMaterials([]);
                setTargetProduct("");
              }}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Discard Draft
            </button>
            <button className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm rounded-xl transition-colors">
              Save Parent BOM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default BOMConfig;

