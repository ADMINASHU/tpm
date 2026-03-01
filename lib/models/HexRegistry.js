import mongoose from "mongoose";

const HexRegistrySchema = new mongoose.Schema(
    {
        hexCode: { type: String, required: true },
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
        specs: { type: Map, of: String },
        purchasePrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Inwarded", "QC_Passed", "RTV_Rejected", "Consumed", "In_Transit"],
            default: "Inwarded",
        },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    },
    { timestamps: true }
);

HexRegistrySchema.index({ hexCode: 1, factoryId: 1 }, { unique: true });

export default mongoose.models.HexRegistry || mongoose.model("HexRegistry", HexRegistrySchema);
