import mongoose from "mongoose";

const BulkInventorySchema = new mongoose.Schema(
    {
        itemName: { type: String, required: true },
        category: { type: String, enum: ["Component", "Spare_Part", "Consumable"], required: true },
        make: { type: String },
        currentQuantity: { type: Number, required: true, default: 0 },
        minimumStockLevel: { type: Number, default: 0 },
        averageUnitCost: { type: Number, required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }, // Specifically logical store
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

BulkInventorySchema.index({ itemName: 1, storeId: 1 }, { unique: true });

export default mongoose.models.BulkInventory || mongoose.model("BulkInventory", BulkInventorySchema);
