import mongoose from "mongoose";

const SpareConfigSchema = new mongoose.Schema(
    {
        itemCode: { type: String, required: true },
        itemName: { type: String, required: true },
        description: { type: String },
        category: { type: String, default: "Spares_Config" },
        make: { type: String },
        ratings: { type: String },
        volt: { type: String },
        amp: { type: String },
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

SpareConfigSchema.index({ itemCode: 1, factoryId: 1 }, { unique: true });

export default mongoose.models.SpareConfig || mongoose.model("SpareConfig", SpareConfigSchema);
