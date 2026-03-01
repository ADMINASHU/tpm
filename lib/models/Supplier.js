import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        contactEmail: { type: String, required: true },
        gstNumber: { type: String },
        paymentTermsDays: { type: Number, default: 30 },
        agreedProducts: [{
            itemName: { type: String, required: true },
            make: { type: String },
            agreedRate: { type: Number, required: true },
            minimumLotSize: { type: Number, default: 1 }
        }],
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
