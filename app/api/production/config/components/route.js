import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ComponentConfig from "@/lib/models/ComponentConfig";

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
                { itemCode: { $regex: search, $options: "i" } },
                { itemName: { $regex: search, $options: "i" } },
            ];
        }

        const configs = await ComponentConfig.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: configs });
    } catch (error) {
        console.error("GET /api/production/config/components error:", error);
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
        const newMakes = new Set();
        const newCategories = new Set();

        for (const item of items) {
            try {
                const itemCode = item.itemCode?.trim().toLowerCase();
                if (!itemCode) throw new Error("Item Code is required");

                // Prepare data with default mappings
                const updateData = {
                    ...item,
                    itemCode,
                    itemName: item.itemName?.trim().toLowerCase(),
                    factoryId,
                    minStockLevel: item.minStockLevel !== undefined ? Number(item.minStockLevel) : item.minBufferLevel !== undefined ? Number(item.minBufferLevel) : 0,
                    maxStockLevel: item.maxStockLevel !== undefined ? Number(item.maxStockLevel) : item.maxBufferLevel !== undefined ? Number(item.maxBufferLevel) : 0,
                    averageUnitCost: item.averageUnitCost !== undefined ? Number(item.averageUnitCost) : 0,
                };

                // Auto-generate description if missing
                if (!updateData.description) {
                    const specs = updateData.technicalSpecs || {};
                    const specStr = Object.entries(specs).map(([k, v]) => `${k}:${v}`).join(", ");
                    updateData.description = [updateData.category, updateData.make, specStr].filter(Boolean).join(" - ").toLowerCase();
                }

                // Track new makes/categories for auto-registration
                if (updateData.make) newMakes.add(item.make); // Keep original casing for registry if preferred, or normalize
                if (updateData.category) newCategories.add(item.category);

                const existing = await ComponentConfig.findOne({ itemCode, factoryId });
                const config = await ComponentConfig.findOneAndUpdate(
                    { itemCode, factoryId },
                    { $set: updateData },
                    { upsert: true, new: true, runValidators: true }
                );

                if (existing) {
                    results.updated++;
                } else {
                    results.created++;
                }
            } catch (err) {
                results.errors.push({ itemCode: item.itemCode, error: err.message });
            }
        }

        // Auto-Register new Makes and Categories in SystemConfig
        if (newMakes.size > 0 || newCategories.size > 0) {
            const SystemConfig = (await import("@/lib/models/SystemConfig")).default;
            const currentConfig = await SystemConfig.findOne({ type: "component" });
            if (currentConfig) {
                let changed = false;
                const updatedCategories = [...new Set([...(currentConfig.categories || []), ...Array.from(newCategories)])];
                const updatedMakes = [...new Set([...(currentConfig.makes || []), ...Array.from(newMakes)])];

                if (updatedCategories.length !== (currentConfig.categories?.length || 0) ||
                    updatedMakes.length !== (currentConfig.makes?.length || 0)) {
                    currentConfig.categories = updatedCategories;
                    currentConfig.makes = updatedMakes;
                    await currentConfig.save();
                }
            }
        }

        return NextResponse.json({ success: results.errors.length === 0, data: results, results });
    } catch (error) {
        console.error("POST /api/production/config/components error:", error);
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

        const updated = await ComponentConfig.findByIdAndUpdate(_id, updateData, { new: true });
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

        await ComponentConfig.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
