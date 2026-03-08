import mongoose from "mongoose";

const AssemblyLogSchema = new mongoose.Schema(
    {
        batchId: { type: String, required: true },
        targetType: {
            type: String,
            enum: ["Spare_Part", "Finished_Product"],
            required: true,
        },
        configId: { type: String }, // itemCode or serialNumber (Rating Plate)
        configName: { type: String, required: true },
        bomNumber: { type: String, required: true },
        bomVersion: { type: String, required: true },
        entityTag: { type: String }, // Hex Tag or Serial Number (Optional for Drafts)
        components: [
            {
                configId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    refPath: 'components.configModel'
                },
                configModel: {
                    type: String,
                    required: true,
                    enum: ["ComponentConfig", "SpareConfig"]
                },
                itemName: { type: String },
                quantity: { type: Number },
                isOverride: { type: Boolean, default: false }
            }
        ],
        factoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Factory",
            required: true,
        },
        operatorName: { type: String },
        status: {
            type: String,
            enum: ["Completed", "Pending"],
            default: "Completed"
        },
        failureReason: { type: String }, // Store missing items or error messages
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.AssemblyLog || mongoose.model("AssemblyLog", AssemblyLogSchema);
