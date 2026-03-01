import mongoose from "mongoose";

const IndentSchema = new mongoose.Schema(
    {
        indentNumber: { type: String, required: true, unique: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        department: { type: String, enum: ["Production", "Store", "Projects"], required: true },
        status: { type: String, enum: ["Pending", "Approved", "Rejected", "PO_Generated"], default: "Pending" },
        items: [{
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            reason: { type: String }
        }],
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Indent || mongoose.model("Indent", IndentSchema);
