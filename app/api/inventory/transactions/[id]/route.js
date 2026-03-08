import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InventoryTransaction from "@/lib/models/InventoryTransaction";
import Item from "@/lib/models/Item";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { type, quantity, reference, notes, date } = body;

        if (quantity === undefined || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const transaction = await InventoryTransaction.findById(id);
        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        const newQty = Number(quantity);
        const qtyDiff = newQty - transaction.quantity;

        // If an item is associated, adjust its current quantity to reflect the edit
        if (transaction.item && qtyDiff !== 0) {
            const item = await Item.findById(transaction.item);
            if (item) {
                // For instance, if old quantity was +10, and new is +15, difference is +5
                // Wait, if old was 10, new is 5, difference is -5
                item.currentQuantity = (item.currentQuantity || 0) + qtyDiff;
                await item.save();

                // Roughly adjust the log's balanceAfter. Full recalculation of all subsequent logs is complex,
                // so we adjust this specific snapshot by the difference.
                transaction.balanceAfter = (transaction.balanceAfter || 0) + qtyDiff;
            }
        }

        // Apply edits
        transaction.type = type;
        transaction.quantity = newQty;
        transaction.reference = reference;
        transaction.notes = notes;
        if (date) {
            transaction.date = new Date(date);
        }

        await transaction.save();

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error("PUT /api/inventory/transactions/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const transaction = await InventoryTransaction.findById(id);

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Revert the stock balance for the associated item
        if (transaction.item) {
            const item = await Item.findById(transaction.item);
            if (item) {
                // If the transaction ADDED 10, we must SUBTRACT 10 to revert it.
                item.currentQuantity = (item.currentQuantity || 0) - transaction.quantity;
                await item.save();
            }
        }

        await transaction.deleteOne();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/inventory/transactions/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
