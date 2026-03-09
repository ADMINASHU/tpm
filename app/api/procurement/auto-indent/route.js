import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/lib/models/Item";
import Supplier from "@/lib/models/Supplier";
import Indent from "@/lib/models/Indent";
import ComponentConfig from "@/lib/models/ComponentConfig";
import SpareConfig from "@/lib/models/SpareConfig";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const userId = session.user.id;
    await dbConnect();

    // 1. Monitor Stock Levels
    // Get all items in the factory to check against their master configs
    const items = await Item.find({ factoryId }).lean();

    const allIndentItems = [];

    for (const item of items) {
      if (!item.configId || !item.configModel) continue;

      // Fetch the master configuration to get thresholds
      let config = null;
      if (item.configModel === "ComponentConfig") {
        config = await ComponentConfig.findById(item.configId).lean();
      } else if (item.configModel === "SpareConfig") {
        config = await SpareConfig.findById(item.configId).lean();
      }

      if (!config) continue;

      const minLevel = config.minStockLevel || 0;
      const maxLevel = config.maxStockLevel || 0;

      // Check if stock is below threshold
      if (item.currentQuantity >= minLevel) continue;

      // Calculate replenishment quantity: Max Stock - Current Stock
      let requiredQty = (maxLevel || minLevel || 0) - item.currentQuantity;
      if (requiredQty <= 0) continue;

      // 2. Multi-Supplier Price Logic
      const mappedSuppliers = await Supplier.find({
        factoryId,
        "agreedProducts.configId": item.configId,
      });

      let selectedSupplier = null;
      let suggestedRate = 0;

      if (mappedSuppliers.length > 0) {
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
        } else {
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

      allIndentItems.push({
        configId: item.configId,
        configModel: item.configModel,
        itemName: item.itemName,
        description: item.description,
        make: item.make,
        quantity: requiredQty,
        suggestedSupplier: selectedSupplier?._id,
        suggestedRate: suggestedRate,
        reason: "Auto-generated replenishment due to low stock",
      });
    }

    if (allIndentItems.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No items below threshold",
      });
    }

    // Check if an "Approval Pending" auto-indent already exists
    let existingIndent = await Indent.findOne({
      factoryId,
      status: "Approval Pending",
      indentType: "Auto",
    });

    if (existingIndent) {
      const existingConfigIds = existingIndent.items.map((i) =>
        i.configId.toString(),
      );
      const newItems = allIndentItems.filter(
        (i) => !existingConfigIds.includes(i.configId.toString()),
      );

      if (newItems.length > 0) {
        existingIndent.items.push(...newItems);
        await existingIndent.save();
      }

      return NextResponse.json(
        {
          success: true,
          count: newItems.length,
          indent: existingIndent,
          message:
            newItems.length > 0
              ? `Added ${newItems.length} items to existing auto-indent`
              : "Items already present in pending auto-indent",
        },
        { status: 200 },
      );
    } else {
      const indent = await Indent.create({
        indentNumber: `IND-AUTO-${Date.now()}`,
        indentType: "Auto",
        requestedBy: userId,
        department: "Store/Production",
        items: allIndentItems,
        status: "Approval Pending",
        factoryId,
      });

      return NextResponse.json(
        {
          success: true,
          count: allIndentItems.length,
          indent,
          message: "Created consolidated auto-indent",
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("API Error in Auto-Indent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
