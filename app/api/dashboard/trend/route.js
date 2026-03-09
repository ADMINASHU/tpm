import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import InventoryTransaction from "@/lib/models/InventoryTransaction";
import Item from "@/lib/models/Item";

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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const itemId = searchParams.get("itemId");
    const days = parseInt(searchParams.get("days") || "30");

    await dbConnect();
    const fId = new mongoose.Types.ObjectId(factoryId);

    // Calculate start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Initial match stage
    const match = {
      factory: fId,
      date: { $gte: startDate, $lte: endDate },
    };

    if (category === "Product") {
      match.configModel = "ProductConfig";
      if (itemId) {
        match.configId = new mongoose.Types.ObjectId(itemId);
      }
    } else if (category === "Spare_Part") {
      match.configModel = "SpareConfig";
      if (itemId) {
        match.configId = new mongoose.Types.ObjectId(itemId);
      }
    } else if (category === "Component") {
      match.configModel = "ComponentConfig";
      if (itemId) {
        // itemId here is the component category from SystemConfig
        const itemsInCategory = await Item.find({
          factoryId: fId,
          category: itemId,
        })
          .select("_id")
          .lean();
        const itemIds = itemsInCategory.map((i) => i._id);
        match.item = { $in: itemIds };
        delete match.configModel;
      }
    }

    const trendData = await InventoryTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          inQty: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$type",
                    [
                      "GRN",
                      "STOCK_TRANSFER_IN",
                      "PRODUCTION_OUTPUT",
                      "OPENING_STOCK",
                    ],
                  ],
                },
                "$quantity",
                0,
              ],
            },
          },
          outQty: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$type",
                    [
                      "STOCK_TRANSFER_OUT",
                      "PRODUCTION_CONSUMPTION",
                      "RETURN_TO_VENDOR",
                      "ADJUSTMENT",
                    ],
                  ],
                },
                { $abs: "$quantity" },
                0,
              ],
            },
          },
          purchasedValue: {
            $sum: {
              $cond: [
                {
                  $in: ["$type", ["GRN", "OPENING_STOCK", "STOCK_TRANSFER_IN"]],
                },
                { $multiply: ["$unitPrice", "$quantity"] },
                0,
              ],
            },
          },
          consumedValue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$type",
                    ["PRODUCTION_CONSUMPTION", "STOCK_TRANSFER_OUT"],
                  ],
                },
                {
                  $multiply: [
                    { $abs: "$quantity" },
                    { $ifNull: ["$unitPrice", 0] },
                  ],
                }, // Fallback to unitPrice if avgCost not preserved here
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill gaps in dates for a smooth graph
    const filledData = [];
    const dateCursor = new Date(startDate);
    while (dateCursor <= endDate) {
      const dateStr = dateCursor.toISOString().split("T")[0];
      const existing = trendData.find((d) => d._id === dateStr);

      filledData.push(
        existing || {
          _id: dateStr,
          inQty: 0,
          outQty: 0,
          purchasedValue: 0,
          consumedValue: 0,
        },
      );

      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    return NextResponse.json({ success: true, data: filledData });
  } catch (error) {
    console.error("Trend Data Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
