import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    if (!process.env.MONGODB_URI)
      return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: Factory } = await import("@/lib/models/Factory");
    await dbConnect();
    const body = await req.json();
    const { name, code, location, stores, gstNumber, billingAddress } = body;

    // Support both old string format and new structured array for stores
    // Filter out stores that don't have both name and address to satisfy schema
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
            .filter((s) => s.name && s.address) // Fallback might still fail if address is required
        : [];

    const factory = await Factory.findByIdAndUpdate(
      id,
      {
        name,
        code: code?.toUpperCase(),
        location,
        stores: storeList,
        gstNumber,
        billingAddress,
      },
      { new: true, runValidators: true },
    );

    if (!factory)
      return NextResponse.json({ error: "Factory not found" }, { status: 404 });

    return NextResponse.json({ factory });
  } catch (error) {
    console.error("Factory Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update factory" },
      { status: 400 },
    );
  }
}

export async function DELETE(req, context) {
  const { id } = await context.params;
  if (!process.env.MONGODB_URI)
    return NextResponse.json({ error: "No DB" }, { status: 500 });
  const { default: dbConnect } = await import("@/lib/db");
  const { default: Factory } = await import("@/lib/models/Factory");
  await dbConnect();
  await Factory.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
