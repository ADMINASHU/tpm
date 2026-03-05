import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InventoryTransaction from "@/lib/models/InventoryTransaction";
import Item from "@/lib/models/Item";
import User from "@/lib/models/User";
import Factory from "@/lib/models/Factory";
import { getCurrentISTDate } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function GET(req) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const summary = searchParams.get("summary");
    const factoryId = session.user.factoryId;

    // Strict check: if no factoryId in session, deny unless superadmin logic is added later
    if (!factoryId) {
        return NextResponse.json({ error: "No factory assigned to user session" }, { status: 403 });
    }

    const query = { factory: factoryId };

    if (summary === "true") {
        const itemIds = await InventoryTransaction.distinct("item", query);
        return NextResponse.json({ success: true, itemIds });
    }

    if (itemId) query.item = itemId;

    try {
        const transactions = await InventoryTransaction.find(query)
            .populate("item", "itemCode itemName")
            .populate("performedBy", "name")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({ success: true, transactions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST endpoint to record a manual adjustment (or other types)
export async function POST(req) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { itemId, type, quantity, notes, reference } = body;
        const factoryId = session.user.factoryId;

        if (!itemId || !type || quantity === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const newBalance = (item.currentQuantity || 0) + Number(quantity);

        // Create transaction
        const transaction = await InventoryTransaction.create({
            item: itemId,
            factory: factoryId,
            type,
            quantity,
            balanceAfter: newBalance,
            notes,
            reference,
            performedBy: session.user.id,
            date: getCurrentISTDate()
        });

        // Update item quantity
        item.currentQuantity = newBalance;
        await item.save();

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
