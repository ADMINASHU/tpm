import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Indent from "@/lib/models/Indent";
import Supplier from "@/lib/models/Supplier";
import PurchaseOrder from "@/lib/models/PurchaseOrder";
import Factory from "@/lib/models/Factory";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId } = session.user;
    const body = await req.json();
    const { indentId, storeName } = body;

    await dbConnect();

    const factory = await Factory.findById(factoryId);
    if (!factory) {
      return NextResponse.json({ error: "Factory not found" }, { status: 404 });
    }

    const selectedStore = factory.stores?.find((s) => s.name === storeName);
    const deliveryAddress = selectedStore?.address || factory.location;

    const indent = await Indent.findOne({ _id: indentId, factoryId }).populate(
      "items.suggestedSupplier",
    );
    if (!indent)
      return NextResponse.json({ error: "Indent not found" }, { status: 404 });

    // 1. Multi-Vendor Supplier Grouping
    const supplierGroups = {};

    for (const item of indent.items) {
      let selectedSupplier = null;
      let productRef = null;

      if (item.suggestedSupplier) {
        selectedSupplier = item.suggestedSupplier;
        productRef = selectedSupplier.agreedProducts.find(
          (p) => p.configId.toString() === item.configId.toString(),
        );
      } else {
        // Fallback: Find preferred/lowest for this explicit item by configId
        const mappedSuppliers = await Supplier.find({
          factoryId,
          "agreedProducts.configId": item.configId,
        });

        if (mappedSuppliers.length === 0) {
          console.warn(
            `No supplier found for item: ${item.itemName} (${item.configId})`,
          );
          continue;
        }

        // Selection Logic
        let preferred = mappedSuppliers.find(
          (s) =>
            s.agreedProducts.find(
              (p) => p.configId.toString() === item.configId.toString(),
            )?.isPreferred,
        );

        if (preferred) {
          selectedSupplier = preferred;
          productRef = preferred.agreedProducts.find(
            (p) => p.configId.toString() === item.configId.toString(),
          );
        } else {
          // Lowest Price
          let lowest = null;
          let minRate = Infinity;
          for (const s of mappedSuppliers) {
            const ref = s.agreedProducts.find(
              (p) => p.configId.toString() === item.configId.toString(),
            );
            if (ref && ref.agreedRate < minRate) {
              minRate = ref.agreedRate;
              lowest = s;
              productRef = ref;
            }
          }
          selectedSupplier = lowest;
        }
      }

      if (!selectedSupplier || !productRef) continue;

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
        configId: item.configId,
        configModel: item.configModel,
        itemName: item.itemName, // Keep internal name
        supplierItemName: finalName, // ALIAS FOR PO PRINTING
        make: productRef.make || item.make,
        quantity: item.quantity,
        agreedRate: productRef.agreedRate,
        taxPercent: productRef.hsnCode ? 18 : 18, // Simplified
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
        factoryName: factory.name,
        factoryBillingAddress: factory.billingAddress,
        factoryGstNumber: factory.gstNumber,
        deliveryAddress: deliveryAddress,
        deliveryStoreName: storeName,
      });
      generatedPOs.push(newPo);
      index++;
    }

    // Update Indent Status
    indent.status = "PO Generated";
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
