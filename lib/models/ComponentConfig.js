import mongoose from "mongoose";

const ComponentConfigSchema = new mongoose.Schema(
    {
        itemCode: { type: String, required: true },
        itemName: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true },
        trackingType: { type: String, enum: ["Bulk", "Serialized"], required: true },
        hsnCode: { type: String },
        make: { type: String },
        baseUom: { type: String },
        mountingTechnology: { type: String },
        minStockLevel: { type: Number, default: 0 },
        maxStockLevel: { type: Number, default: 0 },
        technicalSpecs: { type: mongoose.Schema.Types.Mixed, default: {} },
        factoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Factory",
            required: true,
        },
    },
    { timestamps: true }
);

ComponentConfigSchema.index({ itemCode: 1, factoryId: 1 }, { unique: true });

export default mongoose.models.ComponentConfig || mongoose.model("ComponentConfig", ComponentConfigSchema);
