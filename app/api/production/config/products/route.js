import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ProductConfig from "@/lib/models/ProductConfig";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        let query = { factoryId: session.user.factoryId };
        if (search) {
            query.$or = [
                { serialNumber: { $regex: search, $options: "i" } },
                { productName: { $regex: search, $options: "i" } },
            ];
        }

        const configs = await ProductConfig.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: configs });
    } catch (error) {
        console.error("GET /api/production/config/products error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const factoryId = session.user.factoryId;
        const items = Array.isArray(body) ? body : [body];
        const results = { created: 0, updated: 0, errors: [] };

        for (const item of items) {
            try {
                const serialNumber = item.serialNumber?.trim().toUpperCase();
                if (!serialNumber) throw new Error("Serial Number is required");

                // Prepare data (removing any unintended cost fields if they leaked from CSV)
                const { laborCost, overheadCost, transferPrice, logisticsSurcharge, marginPercent, ...rawUpdateData } = item;

                const updateData = {
                    ...rawUpdateData,
                    serialNumber,
                    productName: item.productName?.trim().toLowerCase(),
                    factoryId,
                    minStockLevel: item.minStockLevel !== undefined ? Number(item.minStockLevel) : item.minBufferLevel !== undefined ? Number(item.minBufferLevel) : 0,
                    maxStockLevel: item.maxStockLevel !== undefined ? Number(item.maxStockLevel) : item.maxBufferLevel !== undefined ? Number(item.maxBufferLevel) : 0,
                };

                const existing = await ProductConfig.findOne({ serialNumber, factoryId });
                const config = await ProductConfig.findOneAndUpdate(
                    { serialNumber, factoryId },
                    { $set: updateData },
                    { upsert: true, new: true, runValidators: true }
                );

                if (existing) {
                    results.updated++;
                } else {
                    results.created++;
                }
            } catch (err) {
                results.errors.push({ serialNumber: item.serialNumber, error: err.message });
            }
        }

        return NextResponse.json({ success: results.errors.length === 0, data: results, results });
    } catch (error) {
        console.error("POST /api/production/config/products error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { _id, ...updateData } = body;

        const updated = await ProductConfig.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await ProductConfig.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
