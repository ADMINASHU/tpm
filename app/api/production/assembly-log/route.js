import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import AssemblyLog from "@/lib/models/AssemblyLog";
import Item from "@/lib/models/Item";
import FinishedProduct from "@/lib/models/FinishedProduct";
import SpareConfig from "@/lib/models/SpareConfig";
import ProductConfig from "@/lib/models/ProductConfig";
import InventoryTransaction from "@/lib/models/InventoryTransaction";
import { getCurrentISTDate } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const factoryId = session?.user?.factoryId;
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        let query = { factoryId };
        if (search) {
            query.$or = [
                { entityTag: { $regex: search, $options: "i" } },
                { configName: { $regex: search, $options: "i" } },
                { bomNumber: { $regex: search, $options: "i" } },
                { batchId: { $regex: search, $options: "i" } },
            ];
        }

        const logs = await AssemblyLog.find(query).sort({ timestamp: -1 }).limit(500).lean();

        // Collect all unique configIds across all logs
        const allConfigIds = [...new Set(logs.flatMap(log => log.components.map(c => c.configId)))];

        // Derive weighted average unit cost from InventoryTransaction records
        // Only inbound transactions (GRN, OPENING_STOCK, STOCK_TRANSFER_IN) have meaningful unitPrice
        const costStats = await InventoryTransaction.aggregate([
            {
                $match: {
                    factory: new mongoose.Types.ObjectId(factoryId),
                    configId: { $in: allConfigIds.map(id => new mongoose.Types.ObjectId(id)) },
                    type: { $in: ["GRN", "OPENING_STOCK", "STOCK_TRANSFER_IN"] },
                    unitPrice: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: "$configId",
                    totalValue: { $sum: { $multiply: ["$unitPrice", "$quantity"] } },
                    totalQtyCosted: { $sum: "$quantity" }
                }
            },
            {
                $project: {
                    avgCost: {
                        $cond: [
                            { $gt: ["$totalQtyCosted", 0] },
                            { $divide: ["$totalValue", "$totalQtyCosted"] },
                            0
                        ]
                    }
                }
            }
        ]);
        const costMap = {};
        costStats.forEach(s => costMap[s._id.toString()] = s.avgCost || 0);

        // Fetch current stock stats grouping by config
        const stockStats = await InventoryTransaction.aggregate([
            { $match: { factory: new mongoose.Types.ObjectId(factoryId), configId: { $in: allConfigIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: "$configId", totalQty: { $sum: "$quantity" } } }
        ]);
        const stockMap = {};
        stockStats.forEach(s => stockMap[s._id.toString()] = s.totalQty);


        const processedLogs = logs.map(log => {
            const totalCost = log.components.reduce((sum, comp) => {
                const cost = costMap[comp.configId.toString()] || 0;
                return sum + (cost * (comp.quantity || 0));
            }, 0);

            // Dynamic stock evaluation for Pending logs
            if (log.status === "Pending") {
                const missingItems = [];
                log.components.forEach(comp => {
                    const required = comp.quantity || 0;
                    const available = stockMap[comp.configId.toString()] || 0;
                    if (available < required) {
                        missingItems.push(`${comp.itemName} (Need ${required}, Have ${available})`);
                    }
                });

                if (missingItems.length > 0) {
                    log.isStockAvailable = false;
                    if (log.entityTag) {
                        log.failureReason = `Draft: Required items not available in stock. Missing: ${missingItems.join(", ")}`;
                    } else {
                        log.failureReason = `Draft: No tags/serials assigned yet. Missing: ${missingItems.join(", ")}`;
                    }
                } else {
                    log.isStockAvailable = true;
                    if (log.entityTag) {
                        log.failureReason = "Stock Replenished! Ready to finalise.";
                        log.isReady = true;
                    } else {
                        log.failureReason = "Stock Available: Ready for Tag Assignment.";
                    }
                }
            }

            return { ...log, totalCost };
        });

        return NextResponse.json({ success: true, data: processedLogs });
    } catch (error) {
        console.error("GET /api/production/assembly-log error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const factoryId = session?.user?.factoryId;
        const { batchId, targetType, configId, configName, bomNumber, bomVersion, scannedEntities, components, configDetails, configModel } = body;

        if (!targetType || !configName || !bomNumber || !components) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Handle Draft Mode (No tags scanned)
        if (!scannedEntities || scannedEntities.length === 0) {
            const draftLog = await AssemblyLog.create({
                batchId,
                targetType,
                configId,
                configName,
                bomNumber,
                bomVersion,
                entityTag: null, // Explicitly null for Draft
                components: components.map(c => ({
                    configId: c.configId || c.itemId, // Fallback for transition
                    configModel: c.configModel || "ComponentConfig",
                    itemName: c.itemName,
                    quantity: c.quantity
                })),
                factoryId,
                status: "Pending",
                failureReason: "Draft: No tags/serials assigned yet",
                operatorName: session?.user?.name || "System",
                timestamp: getCurrentISTDate()
            });

            return NextResponse.json({
                success: true,
                status: "Pending",
                message: "Assembly progress saved as Draft.",
                data: [draftLog]
            });
        }

        // 1. Check Stock Levels for the whole batch
        const configIds = components.map(c => c.configId || c.itemId);
        const stats = await InventoryTransaction.aggregate([
            { $match: { factory: new mongoose.Types.ObjectId(factoryId), configId: { $in: configIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: "$configId", totalQty: { $sum: "$quantity" } } }
        ]);

        const stockMap = {};
        stats.forEach(s => stockMap[s._id.toString()] = s.totalQty);

        const batchSize = scannedEntities.length;
        const missingItems = [];
        components.forEach(comp => {
            const required = (comp.quantity || 0) * batchSize;
            const available = stockMap[comp.configId || comp.itemId] || 0;
            if (available < required) {
                missingItems.push(`${comp.itemName} (Need ${required}, Have ${available})`);
            }
        });

        const isPending = missingItems.length > 0;
        const status = isPending ? "Pending" : "Completed";
        const failureReason = isPending ? `Insufficient stock for: ${missingItems.join(", ")}` : null;

        // Calculate total BOM cost based on weighted average of components
        let assemblyUnitPrice = 0;
        if (!isPending) {
            const costStats = await InventoryTransaction.aggregate([
                {
                    $match: {
                        factory: new mongoose.Types.ObjectId(factoryId),
                        configId: { $in: configIds.map(id => new mongoose.Types.ObjectId(id)) },
                        type: { $in: ["GRN", "OPENING_STOCK", "STOCK_TRANSFER_IN", "PRODUCTION_OUTPUT"] },
                        unitPrice: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: "$configId",
                        totalValue: { $sum: { $multiply: ["$unitPrice", "$quantity"] } },
                        totalQtyCosted: { $sum: "$quantity" }
                    }
                }
            ]);

            const costMap = {};
            costStats.forEach(s => {
                if (s.totalQtyCosted > 0) {
                    costMap[s._id.toString()] = s.totalValue / s.totalQtyCosted;
                } else {
                    costMap[s._id.toString()] = 0;
                }
            });

            assemblyUnitPrice = components.reduce((sum, comp) => {
                const cid = (comp.configId || comp.itemId).toString();
                const unitCost = costMap[cid] || 0;
                return sum + (unitCost * (comp.quantity || 0));
            }, 0);
        }

        const createdLogs = [];

        for (const tag of scannedEntities) {
            // 1. Create Assembly Log
            const logEntry = await AssemblyLog.create({
                batchId,
                targetType,
                configId,
                configName,
                bomNumber,
                bomVersion,
                entityTag: tag,
                components: components.map(c => ({
                    configId: c.configId || c.itemId,
                    configModel: c.configModel || "ComponentConfig",
                    itemName: c.itemName,
                    quantity: c.quantity
                })),
                factoryId,
                status,
                failureReason,
                operatorName: session?.user?.name || "System",
                timestamp: getCurrentISTDate()
            });
            createdLogs.push(logEntry);

            if (!isPending) {
                let resultId = null;
                // 2. Create Result Item/Product and Output Transaction
                if (targetType === "Spare_Part") {
                    const existingItem = await Item.findOne({ itemCode: `${configDetails.itemCode}-${tag}`, factoryId });

                    if (existingItem) {
                        resultId = existingItem._id;
                    } else {
                        const newItem = await Item.create({
                            ...configDetails,
                            category: "Spares",
                            trackingType: "Serialized",
                            factoryId,
                            itemCode: `${configDetails.itemCode}-${tag}`,
                            currentQuantity: 1,
                            configId: configId,
                            configModel: "SpareConfig"
                        });
                        resultId = newItem._id;
                    }

                    await InventoryTransaction.create({
                        item: resultId,
                        configId: configId,
                        configModel: "SpareConfig",
                        factory: factoryId,
                        type: "PRODUCTION_OUTPUT",
                        quantity: 1,
                        balanceAfter: 1,
                        entityTag: tag,
                        reference: batchId,
                        unitPrice: assemblyUnitPrice,
                        notes: `Assembled Spare: ${configName}`,
                        performedBy: session.user.id,
                        date: getCurrentISTDate()
                    });
                } else {
                    const existingProduct = await FinishedProduct.findOne({ serialNumber: tag, factoryId });

                    if (existingProduct) {
                        resultId = existingProduct._id;
                    } else {
                        const newProduct = await FinishedProduct.create({
                            ...configDetails,
                            serialNumber: tag,
                            category: "Finished_Product",
                            status: "Available",
                            factoryId,
                            configId: configId
                        });
                        resultId = newProduct._id;
                    }

                    await InventoryTransaction.create({
                        product: resultId,
                        configId: configId,
                        configModel: "ProductConfig",
                        factory: factoryId,
                        type: "PRODUCTION_OUTPUT",
                        quantity: 1,
                        balanceAfter: 1,
                        entityTag: tag,
                        reference: batchId,
                        unitPrice: assemblyUnitPrice,
                        notes: `Assembled Product: ${configName}`,
                        performedBy: session.user.id,
                        date: getCurrentISTDate()
                    });
                }

                // 3. Record Consumption Transactions
                for (const comp of components) {
                    const cid = comp.configId || comp.itemId;
                    const cmodel = comp.configModel || "ComponentConfig";

                    // Deduct from Bulk item primarily for BOM consumption
                    const item = await Item.findOne({ configId: cid, factoryId, trackingType: "Bulk" });
                    const newBalance = (item?.currentQuantity || 0) - comp.quantity;

                    await InventoryTransaction.create({
                        item: item?._id,
                        configId: cid,
                        configModel: cmodel,
                        factory: factoryId,
                        type: "PRODUCTION_CONSUMPTION",
                        quantity: -comp.quantity,
                        balanceAfter: newBalance,
                        reference: batchId,
                        entityTag: tag,
                        notes: `Consumed for ${targetType === "Spare_Part" ? "Spare" : "Product"}: ${tag}`,
                        performedBy: session.user.id,
                        date: getCurrentISTDate()
                    });

                    if (item) {
                        item.currentQuantity = newBalance;
                        await item.save();
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            status,
            message: isPending ? "Assembly saved as Pending due to stock shortage." : "Assembly successfully completed.",
            data: createdLogs
        });

    } catch (error) {
        console.error("POST /api/production/assembly-log error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to process assembly" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { logId, newTag } = body;
        const factoryId = session?.user?.factoryId;

        if (!logId) return NextResponse.json({ success: false, error: "Log ID required" }, { status: 400 });

        const log = await AssemblyLog.findById(logId);
        if (!log) return NextResponse.json({ success: false, error: "Log not found" }, { status: 404 });
        if (log.status !== "Pending") return NextResponse.json({ success: false, error: "Only pending logs can be retried" }, { status: 400 });

        // 1. Stock Check
        const configIds = log.components.map(c => c.configId);
        const stats = await InventoryTransaction.aggregate([
            { $match: { factory: new mongoose.Types.ObjectId(factoryId), configId: { $in: configIds.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: "$configId", totalQty: { $sum: "$quantity" } } }
        ]);

        const stockMap = {};
        stats.forEach(s => stockMap[s._id.toString()] = s.totalQty);

        const missingItems = [];
        log.components.forEach(comp => {
            const required = comp.quantity || 0;
            const available = stockMap[comp.configId.toString()] || 0;
            if (available < required) {
                missingItems.push(`${comp.itemName} (Need ${required}, Have ${available})`);
            }
        });

        const finalTag = newTag || log.entityTag;
        if (!finalTag) {
            return NextResponse.json({ success: false, error: "Entity Tag (Hex/Serial) is required." });
        }

        if (missingItems.length > 0) {
            log.entityTag = finalTag;
            log.failureReason = `Draft: Required items not available in stock. Missing: ${missingItems.join(", ")}`;
            await log.save();

            return NextResponse.json({
                success: true,
                status: "Pending",
                message: "Tag assigned successfully, but assembly remains Pending due to stock shortage."
            });
        }

        // Calculate total BOM cost based on weighted average of components
        const costStats = await InventoryTransaction.aggregate([
            {
                $match: {
                    factory: new mongoose.Types.ObjectId(factoryId),
                    configId: { $in: configIds.map(id => new mongoose.Types.ObjectId(id)) },
                    type: { $in: ["GRN", "OPENING_STOCK", "STOCK_TRANSFER_IN", "PRODUCTION_OUTPUT"] },
                    unitPrice: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: "$configId",
                    totalValue: { $sum: { $multiply: ["$unitPrice", "$quantity"] } },
                    totalQtyCosted: { $sum: "$quantity" }
                }
            }
        ]);

        const costMap = {};
        costStats.forEach(s => {
            if (s.totalQtyCosted > 0) {
                costMap[s._id.toString()] = s.totalValue / s.totalQtyCosted;
            } else {
                costMap[s._id.toString()] = 0;
            }
        });

        const assemblyUnitPrice = log.components.reduce((sum, comp) => {
            const cid = comp.configId.toString();
            const unitCost = costMap[cid] || 0;
            return sum + (unitCost * (comp.quantity || 0));
        }, 0);

        // 3. Complete Assembly
        let resultId = null;
        if (log.targetType === "Spare_Part") {
            const config = await SpareConfig.findOne({ _id: log.configId });
            if (!config) throw new Error("Original spare configuration not found");

            const existingItem = await Item.findOne({ itemCode: `${config.itemCode}-${finalTag}`, factoryId });

            if (existingItem) {
                resultId = existingItem._id;
            } else {
                const newItem = await Item.create({
                    itemName: config.itemName,
                    itemCode: `${config.itemCode}-${finalTag}`,
                    category: "Spares",
                    trackingType: "Serialized",
                    make: config.make,
                    technicalSpecs: config.technicalSpecs,
                    description: config.description,
                    factoryId,
                    currentQuantity: 1,
                    configId: config._id,
                    configModel: "SpareConfig"
                });
                resultId = newItem._id;
            }

            await InventoryTransaction.create({
                item: resultId,
                configId: config._id,
                configModel: "SpareConfig",
                factory: factoryId,
                type: "PRODUCTION_OUTPUT",
                quantity: 1,
                balanceAfter: 1,
                entityTag: finalTag,
                reference: log.batchId,
                unitPrice: assemblyUnitPrice,
                notes: `Assembled Spare (Retry): ${log.configName}`,
                performedBy: session.user.id,
                date: getCurrentISTDate()
            });
        } else {
            const config = await ProductConfig.findOne({ _id: log.configId });
            if (!config) throw new Error("Original product configuration not found");

            const existingProduct = await FinishedProduct.findOne({ serialNumber: finalTag, factoryId });

            if (existingProduct) {
                resultId = existingProduct._id;
            } else {
                const newProduct = await FinishedProduct.create({
                    productName: config.productName,
                    serialNumber: finalTag,
                    category: "Finished_Product",
                    productRatings: config.productRatings,
                    dcBus: config.dcBus,
                    phase: config.phase,
                    modelAndSeries: config.modelAndSeries,
                    specsDetails: config.specsDetails,
                    status: "Available",
                    factoryId,
                    configId: config._id
                });
                resultId = newProduct._id;
            }

            await InventoryTransaction.create({
                product: resultId,
                configId: config._id,
                configModel: "ProductConfig",
                factory: factoryId,
                type: "PRODUCTION_OUTPUT",
                quantity: 1,
                balanceAfter: 1,
                entityTag: finalTag,
                reference: log.batchId,
                unitPrice: assemblyUnitPrice,
                notes: `Assembled Product (Retry): ${log.configName}`,
                performedBy: session.user.id,
                date: getCurrentISTDate()
            });
        }

        // 3. Record Consumption
        for (const comp of log.components) {
            const item = await Item.findOne({ configId: comp.configId, factoryId, trackingType: "Bulk" });
            const newBalance = (item?.currentQuantity || 0) - comp.quantity;

            await InventoryTransaction.create({
                item: item?._id,
                configId: comp.configId,
                configModel: comp.configModel,
                factory: factoryId,
                type: "PRODUCTION_CONSUMPTION",
                quantity: -comp.quantity,
                balanceAfter: newBalance,
                reference: log.batchId,
                entityTag: finalTag,
                notes: `Consumed for ${log.targetType === "Spare_Part" ? "Spare" : "Product"}: ${finalTag} (Retry)`,
                performedBy: session.user.id,
                date: getCurrentISTDate()
            });

            if (item) {
                item.currentQuantity = newBalance;
                await item.save();
            }
        }

        log.status = "Completed";
        log.entityTag = finalTag;
        log.failureReason = null;
        await log.save();

        return NextResponse.json({ success: true, message: "Assembly successfully completed." });

    } catch (error) {
        console.error("PATCH /api/production/assembly-log error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to retry assembly" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const logId = searchParams.get("logId");
        const reverse = searchParams.get("reverse") === "true";

        if (!logId) return NextResponse.json({ success: false, error: "Log ID required" }, { status: 400 });

        const log = await AssemblyLog.findById(logId);
        if (!log) return NextResponse.json({ success: false, error: "Log not found" }, { status: 404 });

        if (reverse) {
            // 1. Find all associated inventory transactions
            const transactions = await InventoryTransaction.find({
                reference: log.batchId,
                entityTag: log.entityTag,
                factory: log.factoryId
            });

            for (const tx of transactions) {
                if (tx.type === "PRODUCTION_CONSUMPTION") {
                    // Restore stock for consumed components (Bulk items)
                    const item = await Item.findById(tx.item);
                    if (item && item.trackingType === "Bulk") {
                        const restoredQty = Math.abs(tx.quantity);
                        item.currentQuantity = (item.currentQuantity || 0) + restoredQty;
                        await item.save();
                    }
                } else if (tx.type === "PRODUCTION_OUTPUT") {
                    // Remove the produced Serialized item/product
                    if (log.targetType === "Spare_Part") {
                        await Item.deleteOne({ _id: tx.item });
                    } else if (log.targetType === "Finished_Product") {
                        await FinishedProduct.deleteOne({ _id: tx.product });
                    }
                }
                // Delete the transaction itself
                await InventoryTransaction.findByIdAndDelete(tx._id);
            }
        }

        // Always delete the log entry
        await AssemblyLog.findByIdAndDelete(logId);

        return NextResponse.json({
            success: true,
            message: reverse
                ? "Assembly record reversed and deleted successfully. Stock has been restored."
                : "Assembly log record deleted successfully. (No stock reversal performed)"
        });

    } catch (error) {
        console.error("DELETE /api/production/assembly-log error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to delete assembly log" }, { status: 500 });
    }
}
