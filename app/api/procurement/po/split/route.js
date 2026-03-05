import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Indent from "@/lib/models/Indent";
import Supplier from "@/lib/models/Supplier";
import PurchaseOrder from "@/lib/models/PurchaseOrder";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const body = await req.json();
    const { indentId } = body;

    await dbConnect();

    const indent = await Indent.findOne({ _id: indentId, factoryId });
    if (!indent)
      return NextResponse.json({ error: "Indent not found" }, { status: 404 });

    // 1. Multi-Vendor Supplier Grouping
    const supplierGroups = {};

    for (const item of indent.items) {
      // Find preferred/lowest for this explicit item
      const mappedSuppliers = await Supplier.find({
        factoryId,
        "agreedProducts.itemName": item.itemName,
      });

      if (mappedSuppliers.length === 0) continue; // Unmapped items break out

      let selectedSupplier = mappedSuppliers[0];
      let productRef = selectedSupplier.agreedProducts.find(
        (p) => p.itemName === item.itemName,
      );

      for (const sup of mappedSuppliers) {
        const ref = sup.agreedProducts.find(
          (p) => p.itemName === item.itemName,
        );
        if (ref.isPreferred) {
          selectedSupplier = sup;
          productRef = ref;
          break;
        }
        if (ref.agreedRate < productRef.agreedRate) {
          productRef = ref;
          selectedSupplier = sup;
        }
      }

      // Group it
      const sId = selectedSupplier._id.toString();
      if (!supplierGroups[sId]) {
        supplierGroups[sId] = {
          supplier: selectedSupplier,
          items: [],
          totalAmount: 0,
        };
      }

      // 2. Name Translation (Supplier Alias)
      const finalName = productRef.supplierItemName || item.itemName;

      supplierGroups[sId].items.push({
        itemName: finalName, // ALIAS PRINTING
        make: productRef.make || item.make,
        quantity: item.quantity,
        agreedRate: productRef.agreedRate,
        taxPercent: 18, // Would be driven by HSN realistically
      });

      supplierGroups[sId].totalAmount += productRef.agreedRate * item.quantity;
    }

    // 3. Multi-PO Draft Creation
    const generatedPOs = [];
    let index = 1;

    for (const [supId, groupData] of Object.entries(supplierGroups)) {
      const newPo = await PurchaseOrder.create({
        poNumber: `PO-${indent.indentNumber}-${index}`,
        indentId: indent._id,
        supplierId: supId,
        status: "Draft",
        items: groupData.items,
        totalAmount: groupData.totalAmount,
        factoryId,
      });
      generatedPOs.push(newPo);
      index++;
    }

    // Update Indent Status
    indent.status = "Approved";
    await indent.save();

    return NextResponse.json(
      { success: true, count: generatedPOs.length, pos: generatedPOs },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error in PO Splitting:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
