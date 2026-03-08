import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import FinishedProduct from "@/lib/models/FinishedProduct";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    if (!process.env.MONGODB_URI)
      return NextResponse.json({ success: true, data: [] });

    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    let query = {};
    if (search) {
      query.$or = [
        { serialNumber: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { modelAndSeries: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const products = await FinishedProduct.find(query).limit(50).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/production/products error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json({ error: "No DB" }, { status: 500 });

  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const factoryId = session?.user?.factoryId;

  try {
    // If multiple products are sent, only handle the first one for now (or loop if needed)
    // The UI currently saves one at a time.
    const productToSave = {
      ...body,
      factoryId: body.factoryId || factoryId,
      category: body.category || "Product_Config"
    };

    // Defaulting financial values to 0 if not provided, as they are required by schema
    if (productToSave.laborCost === undefined) productToSave.laborCost = 0;
    if (productToSave.overheadCost === undefined)
      productToSave.overheadCost = 0;
    if (productToSave.transferPrice === undefined)
      productToSave.transferPrice = 0;

    const newProduct = await FinishedProduct.create(productToSave);
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/production/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
}

export async function PUT(req) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json({ error: "No DB" }, { status: 500 });

  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { _id, ...updateData } = body;

  if (!_id) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 },
    );
  }

  try {
    const updatedProduct = await FinishedProduct.findByIdAndUpdate(
      _id,
      updateData,
      { new: true },
    );
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json({ error: "No DB" }, { status: 500 });

  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 },
    );
  }

  try {
    const deletedProduct = await FinishedProduct.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
