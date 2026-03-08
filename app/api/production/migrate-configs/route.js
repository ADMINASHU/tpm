import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Item from "@/lib/models/Item";
import FinishedProduct from "@/lib/models/FinishedProduct";
import ComponentConfig from "@/lib/models/ComponentConfig";
import SpareConfig from "@/lib/models/SpareConfig";
import ProductConfig from "@/lib/models/ProductConfig";

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const results = { components: 0, spares: 0, products: 0, errors: [] };

        // 1. Migrate Components
        const componentTemplates = await Item.find({ category: "Component" }).lean();
        for (const temp of componentTemplates) {
            try {
                await ComponentConfig.findOneAndUpdate(
                    { itemCode: temp.itemCode, factoryId: temp.factoryId },
                    {
                        itemCode: temp.itemCode,
                        itemName: temp.itemName,
                        description: temp.description,
                        category: temp.category,
                        trackingType: temp.trackingType,
                        hsnCode: temp.hsnCode,
                        make: temp.make,
                        baseUom: temp.baseUom,
                        mountingTechnology: temp.mountingTechnology,
                        technicalSpecs: temp.technicalSpecs,
                        factoryId: temp.factoryId
                    },
                    { upsert: true }
                );
                results.components++;
            } catch (e) {
                results.errors.push(`Component ${temp.itemCode}: ${e.message}`);
            }
        }

        // 2. Migrate Spares
        const spareTemplates = await Item.find({ category: "Spares_Config" }).lean();
        for (const temp of spareTemplates) {
            try {
                await SpareConfig.findOneAndUpdate(
                    { itemCode: temp.itemCode, factoryId: temp.factoryId },
                    {
                        itemCode: temp.itemCode,
                        itemName: temp.itemName,
                        description: temp.description,
                        category: temp.category,
                        make: temp.make,
                        ratings: temp.ratings,
                        volt: temp.volt,
                        amp: temp.amp,
                        technicalSpecs: temp.technicalSpecs,
                        revision: temp.revision,
                        factoryId: temp.factoryId
                    },
                    { upsert: true }
                );
                results.spares++;
            } catch (e) {
                results.errors.push(`Spare ${temp.itemCode}: ${e.message}`);
            }
        }

        // 3. Migrate Products
        const productTemplates = await FinishedProduct.find({ category: "Product_Config" }).lean();
        for (const temp of productTemplates) {
            try {
                await ProductConfig.findOneAndUpdate(
                    { serialNumber: temp.serialNumber, factoryId: temp.factoryId },
                    {
                        serialNumber: temp.serialNumber,
                        productName: temp.productName,
                        productRatings: temp.productRatings,
                        dcBus: temp.dcBus,
                        phase: temp.phase,
                        modelAndSeries: temp.modelAndSeries,
                        specsDetails: temp.specsDetails,
                        category: temp.category,
                        laborCost: temp.laborCost,
                        overheadCost: temp.overheadCost,
                        logisticsSurcharge: temp.logisticsSurcharge,
                        marginPercent: temp.marginPercent,
                        transferPrice: temp.transferPrice,
                        factoryId: temp.factoryId
                    },
                    { upsert: true }
                );
                results.products++;
            } catch (e) {
                results.errors.push(`Product ${temp.serialNumber}: ${e.message}`);
            }
        }

        return NextResponse.json({ success: true, message: "Migration completed", results });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
