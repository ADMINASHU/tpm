import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Supplier from "@/lib/models/Supplier";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const factoryId = session?.user?.factoryId;
    const suppliers = await Supplier.find({ factoryId })
      .populate("agreedProducts.item", "itemCode itemName description hsnCode")
      .lean();

    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    console.error("GET /api/procurement/suppliers error:", error);
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

    if (!body.name || !body.contactEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required supplier fields" },
        { status: 400 },
      );
    }

    const newSupplier = await Supplier.create({
      ...body,
      factoryId,
      agreedProducts: [],
      priceHistory: [],
    });

    return NextResponse.json(
      { success: true, data: newSupplier },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/procurement/suppliers error:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 },
    );
  }
}
