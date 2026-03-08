import mongoose from "mongoose";

const ProductConfigSchema = new mongoose.Schema(
    {
        serialNumber: { type: String, required: true }, // This acts as the Config ID/Template Number
        productName: { type: String, required: true },
        productRatings: { type: String },
        dcBus: { type: String },
        phase: { type: String },
        modelAndSeries: { type: String },
        specsDetails: { type: String },
        category: { type: String, default: "Product_Config" },
        minStockLevel: { type: Number, default: 0 },
        maxStockLevel: { type: Number, default: 0 },
        factoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Factory",
            required: true,
        },
    },
    { timestamps: true }
);

ProductConfigSchema.index({ serialNumber: 1, factoryId: 1 }, { unique: true });

export default mongoose.models.ProductConfig || mongoose.model("ProductConfig", ProductConfigSchema);
