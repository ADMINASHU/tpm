import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/lib/models/Item";

export const dynamic = "force-dynamic";

export async function GET(req) {
  if (!process.env.MONGODB_URI) return NextResponse.json({ items: [] });

  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await Item.find({}).lean();
  return NextResponse.json({ success: true, items });
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

  // Support both single item and bulk array
  const items = Array.isArray(body) ? body : [body];

  const results = { created: 0, errors: [] };

  for (const item of items) {
    try {
      // Create item with factoryId if not provided in item, but don't force it
      await Item.create({ ...item, factoryId: item.factoryId || factoryId });
      results.created++;
    } catch (err) {
      results.errors.push({ itemCode: item.itemCode, error: err.message });
    }
  }

  return NextResponse.json({ success: true, results }, { status: 201 });
}
