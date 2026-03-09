import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import InventoryTransaction from "@/lib/models/InventoryTransaction";
import Item from "@/lib/models/Item";
import User from "@/lib/models/User";
import Factory from "@/lib/models/Factory";
import Indent from "@/lib/models/Indent";
import Supplier from "@/lib/models/Supplier";
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

  if (!factoryId) {
    return NextResponse.json(
      { error: "No factory assigned to user session" },
      { status: 403 },
    );
  }

  const query = { factory: factoryId };
  const ids = searchParams.get("ids");

  const Types =
    dbConnect.mongoose?.Types || (await import("mongoose")).default.Types;
  const factoryObjectId = new Types.ObjectId(factoryId);

  if (summary === "true") {
    const match = { factory: factoryObjectId };
    if (ids) {
      const idArray = ids.split(",");
      const Types =
        dbConnect.mongoose?.Types || (await import("mongoose")).default.Types;
      const objIdArray = idArray.map((id) => {
        try {
          return new Types.ObjectId(id);
        } catch (e) {
          return id;
        }
      });

      match.$or = [
        { item: { $in: objIdArray } },
        { product: { $in: objIdArray } },
        { configId: { $in: objIdArray } },
      ];
    }

    try {
      // Get all configIds currently in "Approval Pending" indents for this factory
      const pendingIndents = await Indent.find({
        factoryId,
        status: "Approval Pending",
      })
        .select("items.configId")
        .lean();

      const pendingConfigIds = new Set();
      pendingIndents.forEach((indent) => {
        indent.items?.forEach((item) => {
          if (item.configId) pendingConfigIds.add(item.configId.toString());
        });
      });

      const stats = await InventoryTransaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              configId: "$configId",
              item: "$item",
              product: "$product",
            },
            totalQty: { $sum: "$quantity" },
          },
        },
      ]);

      const refinedStats = await InventoryTransaction.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "items",
            localField: "item",
            foreignField: "_id",
            as: "itemDoc",
          },
        },
        {
          $lookup: {
            from: "finishedproducts",
            localField: "product",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        {
          $addFields: {
            resolvedConfigId: {
              $cond: [
                { $gt: [{ $size: "$itemDoc" }, 0] },
                { $arrayElemAt: ["$itemDoc.configId", 0] },
                { $arrayElemAt: ["$productDoc.configId", 0] },
              ],
            },
            resolvedConfigModel: {
              $cond: [
                { $gt: [{ $size: "$itemDoc" }, 0] },
                { $arrayElemAt: ["$itemDoc.configModel", 0] },
                "ProductConfig",
              ],
            },
            isInbound: {
              $and: [
                {
                  $in: [
                    "$type",
                    [
                      "GRN",
                      "OPENING_STOCK",
                      "STOCK_TRANSFER_IN",
                      "PRODUCTION_OUTPUT",
                    ],
                  ],
                },
                { $gt: ["$unitPrice", 0] },
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              configId: "$resolvedConfigId",
              configModel: "$resolvedConfigModel",
              fallbackId: {
                $cond: [
                  "$resolvedConfigId",
                  null,
                  { $ifNull: ["$item", "$product"] },
                ],
              },
            },
            totalQty: { $sum: "$quantity" },
            totalCostValue: {
              $sum: {
                $cond: [
                  "$isInbound",
                  { $multiply: ["$unitPrice", "$quantity"] },
                  0,
                ],
              },
            },
            totalCostQty: {
              $sum: {
                $cond: ["$isInbound", "$quantity", 0],
              },
            },
          },
        },
        {
          $addFields: {
            averageUnitCost: {
              $cond: [
                { $gt: ["$totalCostQty", 0] },
                { $divide: ["$totalCostValue", "$totalCostQty"] },
                0,
              ],
            },
          },
        },
      ]);

      const populated = await Promise.all(
        refinedStats.map(async (stat) => {
          let details = { currentQuantity: stat.totalQty };
          const cid = stat._id.configId;
          const model = stat._id.configModel;
          const fid = stat._id.fallbackId;

          const isPendingIndent = cid && pendingConfigIds.has(cid.toString());

          if (cid) {
            if (model === "ComponentConfig") {
              const conf = await (
                await import("@/lib/models/ComponentConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf) details = { ...details, ...conf, type: "item" };
            } else if (model === "SpareConfig") {
              const conf = await (
                await import("@/lib/models/SpareConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf) details = { ...details, ...conf, type: "item" };
            } else if (model === "ProductConfig") {
              const conf = await (
                await import("@/lib/models/ProductConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf)
                details = {
                  ...details,
                  ...conf,
                  itemName: conf.productName,
                  itemCode: conf.serialNumber,
                  type: "product",
                };
            }
          } else if (fid) {
            const item = await Item.findById(fid).lean();
            if (item) {
              details = { ...details, ...item, type: "item" };
            } else {
              const prod = await (
                await import("@/lib/models/FinishedProduct")
              ).default
                .findById(fid)
                .lean();
              if (prod)
                details = {
                  ...details,
                  ...prod,
                  itemName: prod.productName,
                  itemCode: prod.serialNumber,
                  type: "product",
                };
            }
          }

          return {
            ...details,
            _id: cid || fid,
            currentQuantity: stat.totalQty,
            averageUnitCost: stat.averageUnitCost || 0,
            estimatedTotalValue:
              (stat.totalQty || 0) * (stat.averageUnitCost || 0),
            isPendingIndent: !!isPendingIndent,
          };
        }),
      );

      const filtered = populated.filter((p) => p.itemName);
      return NextResponse.json({ success: true, data: filtered });
    } catch (error) {
      console.error("Summary aggregate error", error);
      return NextResponse.json(
        { success: false, error: "Failed to load summary" },
        { status: 500 },
      );
    }
  }

  if (itemId) query.item = itemId;

  try {
    const transactions = await InventoryTransaction.find(query)
      .populate("item")
      .populate("product")
      .populate("performedBy", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Resolve master configuration names/codes for the UI
    const resolved = await Promise.all(
      transactions.map(async (tx) => {
        let masterName = "";
        let masterCode = "";

        const cid = tx.configId || tx.item?.configId || tx.product?.configId;
        const cmodel =
          tx.configModel ||
          tx.item?.configModel ||
          (tx.product ? "ProductConfig" : null);

        if (cid && cmodel) {
          try {
            if (cmodel === "ComponentConfig") {
              const conf = await (
                await import("@/lib/models/ComponentConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf) {
                masterName = conf.itemName;
                masterCode = conf.itemCode;
              }
            } else if (cmodel === "SpareConfig") {
              const conf = await (
                await import("@/lib/models/SpareConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf) {
                masterName = conf.itemName;
                masterCode = conf.itemCode;
              }
            } else if (cmodel === "ProductConfig") {
              const conf = await (
                await import("@/lib/models/ProductConfig")
              ).default
                .findById(cid)
                .lean();
              if (conf) {
                masterName = conf.productName;
                masterCode = conf.serialNumber;
              }
            }
          } catch (e) {
            console.error("Resolution error for CID:", cid, e);
          }
        }

        return {
          ...tx,
          masterName:
            masterName ||
            tx.item?.itemName ||
            tx.product?.productName ||
            "Unknown",
          masterCode:
            masterCode ||
            tx.item?.itemCode ||
            tx.product?.serialNumber ||
            "N/A",
        };
      }),
    );

    return NextResponse.json({ success: true, transactions: resolved });
  } catch (error) {
    console.error("GET transactions error:", error);
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
    const {
      itemId,
      productId,
      configId,
      configModel,
      type,
      quantity,
      unitPrice,
      notes,
      reference,
      entityTag,
      date,
    } = body;
    const factoryId = session.user.factoryId;

    if (
      (!itemId && !productId && !configId) ||
      !type ||
      quantity === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let resolvedItemId = itemId;
    let resolvedProductId = productId;
    let newBalance = 0;

    if (configId) {
      // Handle creation/lookup via Config
      if (configModel === "ProductConfig") {
        // Serialized Product
        // Create or find FinishedProduct
        let prod = await (
          await import("@/lib/models/FinishedProduct")
        ).default.findOne({
          configId: configId,
          serialNumber: entityTag,
        });

        if (!prod) {
          const conf = await (
            await import("@/lib/models/ProductConfig")
          ).default.findById(configId);
          if (!conf)
            return NextResponse.json(
              { error: "Product Config not found" },
              { status: 404 },
            );

          prod = await (
            await import("@/lib/models/FinishedProduct")
          ).default.create({
            productName: conf.productName,
            serialNumber: entityTag, // Using tag as serial
            configId: conf._id,
            factoryId: factoryId,
            category: conf.category,
            productRatings: conf.productRatings,
            status: "Available",
          });
        }
        resolvedProductId = prod._id;
        newBalance = 1;
      } else {
        // Component or Spare
        const conf =
          configModel === "SpareConfig"
            ? await (
                await import("@/lib/models/SpareConfig")
              ).default.findById(configId)
            : await (
                await import("@/lib/models/ComponentConfig")
              ).default.findById(configId);

        if (!conf)
          return NextResponse.json(
            { error: "Configuration not found" },
            { status: 404 },
          );

        let item;
        if (conf.trackingType === "Serialized") {
          // Create a new record for this specific tag
          item = await Item.findOne({ configId, entityTag });
          if (!item) {
            item = await Item.create({
              itemName: conf.itemName,
              itemCode: conf.itemCode,
              configId: conf._id,
              configModel: configModel,
              factoryId: factoryId,
              category: conf.category,
              trackingType: "Serialized",
              entityTag: entityTag,
              currentQuantity: 0,
              averageUnitCost: Number(unitPrice) || 0,
            });
          }
        } else {
          // Bulk - find the single record for this config
          item = await Item.findOne({ configId, factoryId });
          if (!item) {
            item = await Item.create({
              itemName: conf.itemName,
              itemCode: conf.itemCode,
              configId: conf._id,
              configModel: configModel,
              factoryId: factoryId,
              category: conf.category,
              trackingType: "Bulk",
              currentQuantity: 0,
              averageUnitCost: Number(unitPrice) || 0,
            });
          }
        }
        resolvedItemId = item._id;
        newBalance = (item.currentQuantity || 0) + Number(quantity);
        item.currentQuantity = newBalance;
        if (type === "OPENING_STOCK" && unitPrice !== undefined) {
          item.averageUnitCost = Number(unitPrice);
        }
        await item.save();
      }
    } else if (itemId) {
      const item = await Item.findById(itemId);
      if (!item)
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      newBalance = (item.currentQuantity || 0) + Number(quantity);
      item.currentQuantity = newBalance;

      // If it's an opening stock entry, update the average unit cost
      if (type === "OPENING_STOCK" && unitPrice !== undefined) {
        item.averageUnitCost = Number(unitPrice);
      }

      await item.save();
      resolvedItemId = item._id;
    } else if (productId) {
      resolvedProductId = productId;
      newBalance = 1;
    }

    // Create transaction
    const transaction = await InventoryTransaction.create({
      item: resolvedItemId || undefined,
      product: resolvedProductId || undefined,
      configId: configId || undefined,
      configModel: configModel || undefined,
      factory: factoryId,
      type,
      quantity: Number(quantity),
      unitPrice: unitPrice !== undefined ? Number(unitPrice) : 0,
      balanceAfter: newBalance,
      notes,
      reference,
      entityTag,
      performedBy: session.user.id,
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("POST /api/inventory/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
