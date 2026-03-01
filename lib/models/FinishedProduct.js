import mongoose from "mongoose";

const FinishedProductSchema = new mongoose.Schema(
    {
        serialNumber: { type: String, required: true, unique: true },
        components: [{ type: String }],
        laborCost: { type: Number, required: true },
        overheadCost: { type: Number, required: true },
        logisticsSurcharge: { type: Number, default: 0 },
        marginPercent: { type: Number, default: 0 },
        transferPrice: { type: Number, required: true },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.FinishedProduct || mongoose.model("FinishedProduct", FinishedProductSchema);
