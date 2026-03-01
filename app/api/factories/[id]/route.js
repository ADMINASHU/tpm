import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function PUT(req, context) {
    const { id } = await context.params;
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: Factory } = await import("@/lib/models/Factory");
    await dbConnect();
    const body = await req.json();
    const storeList = typeof body.stores === "string"
        ? body.stores.split(",").map((s) => s.trim()).filter(Boolean)
        : body.stores || [];
    const factory = await Factory.findByIdAndUpdate(
        id,
        { name: body.name, code: body.code?.toUpperCase(), location: body.location, stores: storeList },
        { new: true }
    );
    if (!factory) return NextResponse.json({ error: "Factory not found" }, { status: 404 });
    return NextResponse.json({ factory });
}

export async function DELETE(req, context) {
    const { id } = await context.params;
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: Factory } = await import("@/lib/models/Factory");
    await dbConnect();
    await Factory.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}

