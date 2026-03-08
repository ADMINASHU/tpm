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
    const body = await req.json(); // { configId, configModel, agreedRate, supplierItemName, hsnCode, leadTime, isPreferred, currency }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 },
      );
    }

    // Check if item already exists in agreedProducts
    const existingIndex = supplier.agreedProducts.findIndex(
      (p) => p.configId?.toString() === body.configId,
    );

    const productData = {
      configId: new mongoose.Types.ObjectId(body.configId),
      configModel: body.configModel || "ComponentConfig",
      supplierItemName: body.supplierItemName,
      hsnCode: body.hsnCode,
      currency: body.currency || "INR",
      agreedRate: Number(body.agreedRate) || 0,
      isPreferred: body.isPreferred || false,
    };

    if (existingIndex > -1) {
      const oldProduct = supplier.agreedProducts[existingIndex];

      // If price changed, log history
      if (Number(oldProduct.agreedRate) !== productData.agreedRate) {
        supplier.priceHistory.push({
          configId: body.configId,
          configModel: body.configModel || "ComponentConfig",
          oldRate: oldProduct.agreedRate,
          newRate: productData.agreedRate,
          changedBy: session.user.id,
        });
      }

      // Update existing using Mongoose set
      supplier.agreedProducts[existingIndex].configId = productData.configId;
      supplier.agreedProducts[existingIndex].configModel = productData.configModel;
      supplier.agreedProducts[existingIndex].supplierItemName =
        productData.supplierItemName;
      supplier.agreedProducts[existingIndex].hsnCode = productData.hsnCode;
      supplier.agreedProducts[existingIndex].currency = productData.currency;
      supplier.agreedProducts[existingIndex].agreedRate =
        productData.agreedRate;
      supplier.agreedProducts[existingIndex].isPreferred =
        productData.isPreferred;
    } else {
      // Add new
      supplier.agreedProducts.push(productData);
    }

    await supplier.save();

    const updatedSupplier = await Supplier.findById(id).lean();

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
    const configId = searchParams.get("configId");

    if (!configId) {
      return NextResponse.json(
        { success: false, error: "Config ID is required" },
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
      (p) => p.configId?.toString() !== configId,
    );

    await supplier.save();

    const updatedSupplier = await Supplier.findById(id)
      .populate("agreedProducts.configId")
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
