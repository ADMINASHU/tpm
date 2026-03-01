import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["Admin", "Manager", "Store", "Operator", "Finance", "Logistics"],
            required: true,
        },
        factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
