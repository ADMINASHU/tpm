import mongoose from "mongoose";

const FactorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true, uppercase: true, maxlength: 5 },
        location: { type: String, required: true },
        stores: { type: [String], default: [] }, // logical store names
    },
    { timestamps: true }
);

export default mongoose.models.Factory || mongoose.model("Factory", FactorySchema);
