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
    if (!process.env.MONGODB_URI) return NextResponse.json({ error: "No DB" }, { status: 500 });
    const { default: dbConnect } = await import("@/lib/db");
    const { default: Factory } = await import("@/lib/models/Factory");
    await dbConnect();
    const body = await req.json();
    const { name, code, location, stores } = body;
    if (!name || !code || !location)
        return NextResponse.json({ error: "Name, code and location are required" }, { status: 400 });
    const storeList = typeof stores === "string"
        ? stores.split(",").map((s) => s.trim()).filter(Boolean)
        : stores || [];
    const factory = await Factory.create({ name, code: code.toUpperCase(), location, stores: storeList });
    return NextResponse.json({ factory }, { status: 201 });
}
