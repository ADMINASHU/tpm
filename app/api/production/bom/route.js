import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BOM from "@/lib/models/BOM";
import Item from "@/lib/models/Item";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const factoryId = session?.user?.factoryId;
    const boms = await BOM.find({ factoryId, isActive: true })
      .populate(
        "components.itemId",
        "itemCode itemName description make baseUom",
      )
      .lean();

    return NextResponse.json({ success: true, data: boms });
  } catch (error) {
    console.error("GET /api/production/bom error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const factoryId = session?.user?.factoryId;

    if (
      !body.targetProduct ||
      !body.targetType ||
      !body.bomNumber ||
      !body.version ||
      !body.components ||
      body.components.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required BOM fields" },
        { status: 400 },
      );
    }

    // Check for existing active BOM for this product to automatically version up
    const existingBom = await BOM.findOne({
      targetProduct: body.targetProduct,
      factoryId,
    }).sort({ version: -1 });
    const newVersion = existingBom ? existingBom.version + 1 : 1;

    // Optional: Mark previous versions as inactive if creating a new version for the same product
    if (existingBom) {
      await BOM.updateMany(
        { targetProduct: body.targetProduct, factoryId },
        { $set: { isActive: false } },
      );
    }

    const newBom = await BOM.create({
      bomNumber: body.bomNumber,
      targetProduct: body.targetProduct,
      targetType: body.targetType,
      components: body.components,
      version: body.version,
      factoryId: factoryId,
      isActive: true,
    });

    return NextResponse.json({ success: true, data: newBom });
  } catch (error) {
    console.error("POST /api/production/bom error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "BOM number or version conflict." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save BOM" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { _id, components, targetProduct, targetType, bomNumber, version } =
      body;
    const factoryId = session?.user?.factoryId;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "BOM ID is required for update" },
        { status: 400 },
      );
    }

    if (
      !targetProduct ||
      !targetType ||
      !bomNumber ||
      !version ||
      !components ||
      components.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required BOM fields" },
        { status: 400 },
      );
    }

    const updatedBom = await BOM.findOneAndUpdate(
      { _id, factoryId },
      {
        $set: {
          bomNumber,
          version,
          components,
          targetProduct,
          targetType,
        },
      },
      { new: true },
    );

    if (!updatedBom) {
      return NextResponse.json(
        { success: false, error: "BOM not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedBom });
  } catch (error) {
    console.error("PUT /api/production/bom error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update BOM" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const factoryId = session?.user?.factoryId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "BOM ID is required" },
        { status: 400 },
      );
    }

    const deletedBom = await BOM.findOneAndDelete({ _id: id, factoryId });

    if (!deletedBom) {
      return NextResponse.json(
        { success: false, error: "BOM not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "BOM deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/production/bom error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}
