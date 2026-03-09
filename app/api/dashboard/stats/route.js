import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Item from "@/lib/models/Item";
import VendorInvoice from "@/lib/models/VendorInvoice";
import FinishedProduct from "@/lib/models/FinishedProduct";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { factoryId } = session.user;
    if (!factoryId) {
      return NextResponse.json(
        { error: "No factory assigned" },
        { status: 400 },
      );
    }

    await dbConnect();
    const fId = new mongoose.Types.ObjectId(factoryId);

    // 1. Inventory Stats (Items in 'Available' status)
    const inventoryStats = await Item.aggregate([
      { $match: { factoryId: fId, status: "Available" } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$currentQuantity" },
          totalValue: {
            $sum: {
              $multiply: [
                "$currentQuantity",
                { $ifNull: ["$averageUnitCost", 0] },
              ],
            },
          },
        },
      },
    ]);

    // 2. Pending QC Stats (Items in 'Buffer' status)
    const qcStats = await Item.aggregate([
      { $match: { factoryId: fId, status: "Buffer" } },
      {
        $group: {
          _id: null,
          pendingCount: { $sum: "$currentQuantity" },
        },
      },
    ]);

    // 3. AP Liability (Unpaid or partially paid invoices)
    const apStats = await VendorInvoice.aggregate([
      { $match: { factoryId: fId, status: { $in: ["Pending", "Partial"] } } },
      {
        $group: {
          _id: null,
          totalLiability: { $sum: "$balanceAmount" },
        },
      },
    ]);

    // 4. Rolling Overhead (Average overhead from products)
    const overheadStats = await FinishedProduct.aggregate([
      { $match: { factoryId: fId } },
      {
        $group: {
          _id: null,
          avgOverhead: { $avg: "$overheadCost" },
        },
      },
    ]);

    const stats = {
      stockCount: inventoryStats[0]?.totalCount || 0,
      inventoryValue: inventoryStats[0]?.totalValue || 0,
      pendingQC: qcStats[0]?.pendingCount || 0,
      apLiability: apStats[0]?.totalLiability || 0,
      rollingOverhead: overheadStats[0]?.avgOverhead || 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
