import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Item from "@/lib/models/Item";
import Supplier from "@/lib/models/Supplier";
import Indent from "@/lib/models/Indent";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId, userId } = session.user;
    await dbConnect();

    // 1. Monitor Stock Levels
    // We find items where currentQuantity < minStockLevel
    const deficientItems = await Item.find({
      factoryId,
      $expr: { $lt: ["$currentQuantity", "$minStockLevel"] },
    });

    const generatedIndents = [];

    for (const item of deficientItems) {
      const requiredQty = item.minStockLevel - item.currentQuantity;

      if (requiredQty <= 0) continue;

      // 2. Multi-Supplier Price Logic
      // Find suppliers mapped to this item
      const mappedSuppliers = await Supplier.find({
        factoryId,
        "agreedProducts.itemName": item.itemName,
      });

      if (mappedSuppliers.length === 0) {
        console.warn(`No supplier found for deficient item: ${item.itemName}`);
        // Could create an indent without supplier for manual assignment
        const indent = await Indent.create({
          indentNumber: `IND-AUTO-${Date.now()}-${item.itemCode}`,
          type: "Stock_Replenishment",
          items: [
            {
              itemName: item.itemName,
              quantity: requiredQty,
            },
          ],
          status: "Approval_Pending",
          createdBy: userId,
          factoryId,
        });
        generatedIndents.push(indent);
        continue;
      }

      // 3. Select Preferred or Lowest Price
      // Sort suppliers to find the primary match
      let selectedSupplier = null;
      let lowestRef = null;

      for (const supplier of mappedSuppliers) {
        const productMap = supplier.agreedProducts.find(
          (p) => p.itemName === item.itemName,
        );

        if (productMap.isPreferred) {
          selectedSupplier = supplier;
          break;
        }

        if (
          !lowestRef ||
          productMap.agreedRate <
            lowestRef.agreedProducts.find((p) => p.itemName === item.itemName)
              .agreedRate
        ) {
          lowestRef = supplier;
        }
      }

      if (!selectedSupplier) {
        selectedSupplier = lowestRef;
      }

      // Create Indent
      const indent = await Indent.create({
        indentNumber: `IND-AUTO-${Date.now()}-${item.itemCode}`,
        type: "Stock_Replenishment",
        items: [
          {
            itemName: item.itemName,
            quantity: requiredQty,
          },
        ],
        status: "Approval_Pending",
        createdBy: userId,
        factoryId,
      });

      generatedIndents.push(indent);
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
