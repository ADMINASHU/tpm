import mongoose from "mongoose";

const LedgerEntrySchema = new mongoose.Schema(
    {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["Debit", "Credit"], required: true },
        isOverhead: { type: Boolean, default: false },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.LedgerEntry || mongoose.model("LedgerEntry", LedgerEntrySchema);
