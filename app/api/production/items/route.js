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
      // Map frontend trackingStrategy to backend trackingType
      const itemToSave = { ...item };
      if (itemToSave.trackingStrategy && !itemToSave.trackingType) {
        itemToSave.trackingType = itemToSave.trackingStrategy;
        delete itemToSave.trackingStrategy;
      }

      // Backend safety: Parse technicalSpecs if it's a string
      if (
        typeof itemToSave.technicalSpecs === "string" &&
        itemToSave.technicalSpecs
      ) {
        try {
          const specObj = {};
          const pairs = itemToSave.technicalSpecs.split(";");
          pairs.forEach((p) => {
            const [key, val] = p.split(":");
            if (key && val) {
              specObj[key.trim().toLowerCase()] = val.trim().toLowerCase();
            }
          });
          itemToSave.technicalSpecs = specObj;
        } catch (e) {
          itemToSave.technicalSpecs = {};
        }
      }

      // Auto-generate description if missing
      if (!itemToSave.description) {
        const specs = itemToSave.technicalSpecs || {};
        const specString = Object.entries(specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");

        const parts = [
          itemToSave.category,
          itemToSave.make,
          specString
        ].filter(Boolean);

        itemToSave.description = parts.join(" - ").toLowerCase();
      }

      await Item.create({
        ...itemToSave,
        factoryId: itemToSave.factoryId || factoryId,
      });
      results.created++;
    } catch (err) {
      results.errors.push({ itemCode: item.itemCode, error: err.message });
    }
  }

  const success = results.created > 0 || items.length === 0;
  return NextResponse.json(
    { success, results },
    { status: success ? 201 : 400 },
  );
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
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item: updatedItem });
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
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
