import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/lib/models/Item";
import Supplier from "@/lib/models/Supplier";
import Indent from "@/lib/models/Indent";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const userId = session.user.id;
    await dbConnect();

    // 1. Monitor Stock Levels
    // Find items where currentQuantity < minStockLevel
    const deficientItems = await Item.find({
      factoryId,
      $expr: { $lt: ["$currentQuantity", "$minStockLevel"] },
    });

    const generatedIndents = [];

    for (const item of deficientItems) {
      if (!item.configId) continue;

      // Calculate replenishment quantity: Max Stock - Current Stock
      let requiredQty =
        (item.maxStockLevel || item.minStockLevel || 0) - item.currentQuantity;
      if (requiredQty <= 0) continue;

      // 2. Multi-Supplier Price Logic
      // Find suppliers mapped to this item by configId
      const mappedSuppliers = await Supplier.find({
        factoryId,
        "agreedProducts.configId": item.configId,
      });

      let selectedSupplier = null;
      let suggestedRate = 0;
      let leadTime = 0;

      if (mappedSuppliers.length > 0) {
        // Selection Logic: Preferred vendor OR lowest "Agreed Price"
        let preferred = mappedSuppliers.find(
          (s) =>
            s.agreedProducts.find(
              (p) => p.configId.toString() === item.configId.toString(),
            )?.isPreferred,
        );

        if (preferred) {
          selectedSupplier = preferred;
          const pMap = preferred.agreedProducts.find(
            (p) => p.configId.toString() === item.configId.toString(),
          );
          suggestedRate = pMap.agreedRate;
          // In this schema, leadTime isn't directly on agreedProducts,
          // but we can default it or assume it's part of the agreement if added later.
          // For now, we'll use a default or check if it exists in the item config if we had more info.
        } else {
          // Find lowest price
          let lowestPriceSupplier = null;
          let minPrice = Infinity;

          for (const s of mappedSuppliers) {
            const pMap = s.agreedProducts.find(
              (p) => p.configId.toString() === item.configId.toString(),
            );
            if (pMap && pMap.agreedRate < minPrice) {
              minPrice = pMap.agreedRate;
              lowestPriceSupplier = s;
            }
          }
          selectedSupplier = lowestPriceSupplier;
          suggestedRate = minPrice;
        }
      }

      // Create Indent item entry
      const indentItem = {
        configId: item.configId,
        configModel: item.configModel,
        itemName: item.itemName,
        description: item.description,
        make: item.make,
        quantity: requiredQty,
        suggestedSupplier: selectedSupplier?._id,
        suggestedRate: suggestedRate,
        reason: "Auto-generated replenishment due to low stock",
      };

      // Check if an "Approval Pending" indent already exists for this item to avoid duplicates
      const existingIndent = await Indent.findOne({
        factoryId,
        status: "Approval Pending",
        indentType: "Auto",
        "items.configId": item.configId,
      });

      if (!existingIndent) {
        const indent = await Indent.create({
          indentNumber: `IND-AUTO-${Date.now()}-${item.itemCode}`,
          indentType: "Auto",
          requestedBy: userId,
          department: item.category === "Component" ? "Production" : "Store", // Simple heuristic
          items: [indentItem],
          status: "Approval Pending",
          factoryId,
        });
        generatedIndents.push(indent);
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: generatedIndents.length,
        indents: generatedIndents,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error in Auto-Indent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
