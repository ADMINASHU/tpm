"use client";

import { Truck } from "lucide-react";

function ExternalDispatch() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Truck className="mr-2 text-indigo-600 h-6 w-6" aria-hidden="true" />
          Create Dispatch Order
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Record outbound shipment of finished goods or spare parts to a
          customer or service center.
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="customer-cd" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Customer / Consignee
            </label>
            <input
              id="customer-cd"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label htmlFor="dispatch-from" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Dispatch From (Store)
            </label>
            <select id="dispatch-from" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Finished Goods (Bengaluru)</option>
              <option>Production Store (Bengaluru)</option>
              <option>Raw Material Store (Bengaluru)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="del-addr" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Delivery Address
            </label>
            <input
              id="del-addr"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. 12 Industrial Area, Pune, Maharashtra"
            />
          </div>
          <div>
            <label htmlFor="item-serial" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Item / Serial No.
            </label>
            <input
              id="item-serial"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="Scan Serial or enter Bulk Name"
            />
          </div>
          <div>
            <label htmlFor="dis-qty" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Quantity
            </label>
            <input
              id="dis-qty"
              type="number"
              min="1"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="1"
            />
          </div>
          <div>
            <label htmlFor="mod-dis" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Mode of Dispatch
            </label>
            <select id="mod-dis" className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm bg-white">
              <option>Own Vehicle</option>
              <option>Third-Party Courier</option>
              <option>Customer Pickup</option>
              <option>Air Freight</option>
            </select>
          </div>
          <div>
            <label htmlFor="veh-track" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Vehicle / Tracking No.
            </label>
            <input
              id="veh-track"
              type="text"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder="e.g. KA01AB1234 or AWB-00912"
            />
          </div>
          {/* Add Logistics Surcharge Calculation fields */}
          <div className="col-span-2 pt-4 border-t border-slate-100 mt-4">
            <h3 className="text-sm font-semibold leading-6 text-slate-900 mb-4 flex items-center gap-2">
              Logistics Costs (Surcharge Calculation)
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label htmlFor="fuel-s" className="block text-xs font-semibold text-slate-500 mb-1">
                  Fuel (â‚¹)
                </label>
                <input
                  id="fuel-s"
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="toll-s" className="block text-xs font-semibold text-slate-500 mb-1">
                  Toll (â‚¹)
                </label>
                <input
                  id="toll-s"
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="driv-s" className="block text-xs font-semibold text-slate-500 mb-1">
                  Driver Allow. (â‚¹)
                </label>
                <input
                  id="driv-s"
                  type="number"
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="notes" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Dispatch Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm resize-none"
              placeholder="Any special handling instructions or reference PO number..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
          >
            <Truck className="w-4 h-4 mr-2" aria-hidden="true" /> Confirm Dispatch
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExternalDispatch;

