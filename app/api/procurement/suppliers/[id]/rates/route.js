import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Supplier from "@/lib/models/Supplier";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json(); // { itemId, agreedRate, supplierItemName, hsnCode, leadTime, isPreferred, currency }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 },
      );
    }

    // Check if item already exists in agreedProducts
    const existingIndex = supplier.agreedProducts.findIndex(
      (p) => p.item?.toString() === body.itemId,
    );

    const productData = {
      item: new mongoose.Types.ObjectId(body.itemId),
      supplierItemName: body.supplierItemName,
      hsnCode: body.hsnCode,
      currency: body.currency || "INR",
      agreedRate: Number(body.agreedRate) || 0,
      leadTime: Number(body.leadTime) || 1,
      isPreferred: body.isPreferred || false,
    };

    if (existingIndex > -1) {
      const oldProduct = supplier.agreedProducts[existingIndex];

      // If price changed, log history
      if (Number(oldProduct.agreedRate) !== productData.agreedRate) {
        supplier.priceHistory.push({
          item: body.itemId,
          oldRate: oldProduct.agreedRate,
          newRate: productData.agreedRate,
          changedBy: session.user.id,
        });
      }

      // Update existing using Mongoose set
      supplier.agreedProducts[existingIndex].item = productData.item;
      supplier.agreedProducts[existingIndex].supplierItemName =
        productData.supplierItemName;
      supplier.agreedProducts[existingIndex].hsnCode = productData.hsnCode;
      supplier.agreedProducts[existingIndex].currency = productData.currency;
      supplier.agreedProducts[existingIndex].agreedRate =
        productData.agreedRate;
      supplier.agreedProducts[existingIndex].leadTime = productData.leadTime;
      supplier.agreedProducts[existingIndex].isPreferred =
        productData.isPreferred;
    } else {
      // Add new
      supplier.agreedProducts.push(productData);
    }

    await supplier.save();

    const updatedSupplier = await Supplier.findById(id)
      .populate("agreedProducts.item", "itemCode itemName description hsnCode")
      .lean();

    return NextResponse.json({ success: true, data: updatedSupplier });
  } catch (error) {
    console.error("POST /api/procurement/suppliers/[id]/rates error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 },
      );
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 },
      );
    }

    // Remove from agreedProducts
    supplier.agreedProducts = supplier.agreedProducts.filter(
      (p) => p.item?.toString() !== itemId,
    );

    await supplier.save();

    const updatedSupplier = await Supplier.findById(id)
      .populate("agreedProducts.item", "itemCode itemName description hsnCode")
      .lean();

    return NextResponse.json({ success: true, data: updatedSupplier });
  } catch (error) {
    console.error("DELETE /api/procurement/suppliers/[id]/rates error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
