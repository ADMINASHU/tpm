import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.MONGODB_URI) return NextResponse.json({ factories: [] });
  const { default: dbConnect } = await import("@/lib/db");
  const { default: Factory } = await import("@/lib/models/Factory");
  await dbConnect();
  const factories = await Factory.find().sort({ code: 1 }).lean();
  return NextResponse.json({ factories });
}

export async function POST(req) {
  try {
    if (!process.env.MONGODB_URI)
      return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: Factory } = await import("@/lib/models/Factory");
    await dbConnect();
    const body = await req.json();
    const { name, code, location, stores, gstNumber, billingAddress } = body;
    if (!name || !code || !location)
      return NextResponse.json(
        { error: "Name, code and location are required" },
        { status: 400 },
      );

    // Support both old string format and new structured array for stores
    const storeList = Array.isArray(stores)
      ? stores
          .map((s) => ({
            name: s.name?.trim(),
            address: s.address?.trim(),
          }))
          .filter((s) => s.name && s.address)
      : typeof stores === "string"
        ? stores
            .split(",")
            .map((s) => ({ name: s.trim(), address: "" }))
            .filter((s) => s.name && s.address)
        : [];

    const factory = await Factory.create({
      name,
      code: code.toUpperCase(),
      location,
      stores: storeList,
      gstNumber,
      billingAddress,
    });
    return NextResponse.json({ factory }, { status: 201 });
  } catch (error) {
    console.error("Factory Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create factory" },
      { status: 400 },
    );
  }
}
